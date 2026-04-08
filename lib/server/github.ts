import { serverEnv } from "@/lib/server/env";
import type { GithubAnalysisResponse, GithubProjectSuggestion } from "@/lib/types";

type GithubRepo = {
  name: string;
  default_branch: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  homepage: string | null;
  pushed_at: string;
  description: string | null;
};

async function githubRequest<T>(path: string) {
  if (!serverEnv.githubToken) {
    throw new Error("GitHub token is not configured.");
  }

  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${serverEnv.githubToken}`,
      "User-Agent": "skill-gap-visualizer",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`GitHub request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

function scoreReadme(content: string) {
  const lengthScore = Math.min(55, Math.floor(content.length / 40));
  const hasSections = ["installation", "usage", "features", "stack", "demo"].filter((item) =>
    content.toLowerCase().includes(item),
  ).length;
  const badgeScore = (content.match(/!\[[^\]]*\]\(/g) ?? []).length * 5;
  return Math.min(100, lengthScore + hasSections * 8 + badgeScore);
}

function scoreStructure(fileNames: string[]) {
  const useful = ["src", "app", "components", "lib", "tests", ".github", "README.md"].filter((item) =>
    fileNames.some((fileName) => fileName.toLowerCase() === item.toLowerCase()),
  ).length;
  return Math.min(100, 45 + useful * 9);
}

function formatFreshness(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  if (days === 0) return "today";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function buildHeatmap(repos: GithubRepo[]) {
  const cells = Array.from({ length: 72 }, () => 0);

  repos.forEach((repo, index) => {
    const days = Math.max(0, Math.min(71, Math.floor((Date.now() - new Date(repo.pushed_at).getTime()) / (1000 * 60 * 60 * 24))));
    const cellIndex = 71 - days;
    cells[cellIndex] = Math.max(cells[cellIndex], 4 - Math.min(3, index));
  });

  return cells;
}

export async function fetchGithubAnalysis(username: string): Promise<GithubAnalysisResponse> {
  const repos = await githubRequest<GithubRepo[]>(`/users/${username}/repos?per_page=6&sort=updated`);

  if (repos.length === 0) {
    return {
      username,
      commitCount: 0,
      languages: [],
      stars: 0,
      readmeScore: 0,
      deploymentCoverage: 0,
      ciCoverage: 0,
      repos: [],
      heatmap: Array.from({ length: 72 }, () => 0),
      connected: true,
    };
  }

  const repoAnalyses = await Promise.all(
    repos.map(async (repo) => {
      const [languages, commits, readmeResponse, rootContents] = await Promise.all([
        githubRequest<Record<string, number>>(`/repos/${username}/${repo.name}/languages`),
        githubRequest<Array<{ sha: string }>>(`/repos/${username}/${repo.name}/commits?per_page=10`),
        fetch(`https://api.github.com/repos/${username}/${repo.name}/readme`, {
          headers: {
            Accept: "application/vnd.github.raw+json",
            Authorization: `Bearer ${serverEnv.githubToken}`,
            "User-Agent": "skill-gap-visualizer",
          },
          cache: "no-store",
        }),
        githubRequest<Array<{ name: string; type: string }>>(`/repos/${username}/${repo.name}/contents`),
      ]);

      const readmeText = readmeResponse.ok ? await readmeResponse.text() : "";
      const fileNames = rootContents.map((item) => item.name);
      const hasCi = fileNames.includes(".github") || fileNames.some((fileName) => /ci|workflow/i.test(fileName));
      const deployment = repo.homepage ? "Configured" : "Missing";

      return {
        repo,
        commitCount: commits.length,
        languages,
        readmeScore: scoreReadme(readmeText),
        structure: scoreStructure(fileNames),
        ci: hasCi ? 78 : 34,
        freshness: formatFreshness(repo.pushed_at),
        deployment,
      };
    }),
  );

  const languageTotals = new Map<string, number>();

  repoAnalyses.forEach((analysis) => {
    Object.entries(analysis.languages).forEach(([language, bytes]) => {
      languageTotals.set(language, (languageTotals.get(language) ?? 0) + bytes);
    });
  });

  const totalLanguageBytes = Array.from(languageTotals.values()).reduce((sum, value) => sum + value, 0) || 1;
  const languages = Array.from(languageTotals.entries())
    .map(([label, value]) => ({
      label,
      value: Math.round((value / totalLanguageBytes) * 100),
    }))
    .sort((left, right) => right.value - left.value)
    .slice(0, 6);

  const readmeScore = Math.round(
    repoAnalyses.reduce((sum, analysis) => sum + analysis.readmeScore, 0) / Math.max(1, repoAnalyses.length),
  );
  const ciCoverage = Math.round(
    repoAnalyses.reduce((sum, analysis) => sum + analysis.ci, 0) / Math.max(1, repoAnalyses.length),
  );
  const deploymentCoverage = Math.round(
    (repoAnalyses.filter((analysis) => analysis.deployment === "Configured").length / Math.max(1, repoAnalyses.length)) * 100,
  );

  return {
    username,
    commitCount: repoAnalyses.reduce((sum, analysis) => sum + analysis.commitCount, 0),
    languages,
    stars: repoAnalyses.reduce((sum, analysis) => sum + analysis.repo.stargazers_count, 0),
    readmeScore,
    deploymentCoverage,
    ciCoverage,
    repos: repoAnalyses.map((analysis) => ({
      name: analysis.repo.name,
      structure: analysis.structure,
      docs: analysis.readmeScore,
      ci: analysis.ci,
      freshness: analysis.freshness,
      deployment: analysis.deployment,
      stars: analysis.repo.stargazers_count,
    })),
    heatmap: buildHeatmap(repos),
    connected: true,
  };
}

export async function fetchGithubProjectSuggestions(username: string): Promise<GithubProjectSuggestion[]> {
  const repos = await githubRequest<GithubRepo[]>(`/users/${username}/repos?per_page=6&sort=updated`);

  if (repos.length === 0) {
    return [];
  }

  const suggestions = await Promise.all(
    repos.map(async (repo) => {
      const [readmeResponse, rootContents] = await Promise.all([
        fetch(`https://api.github.com/repos/${username}/${repo.name}/readme`, {
          headers: {
            Accept: "application/vnd.github.raw+json",
            Authorization: `Bearer ${serverEnv.githubToken}`,
            "User-Agent": "skill-gap-visualizer",
          },
          cache: "no-store",
        }),
        githubRequest<Array<{ name: string; type: string }>>(`/repos/${username}/${repo.name}/contents`),
      ]);

      const readmeText = readmeResponse.ok ? await readmeResponse.text() : "";
      const structureScore = scoreStructure(rootContents.map((item) => item.name));
      const readmeScore = scoreReadme(readmeText);
      const complexityLevel = Math.max(3, Math.min(10, Math.round((structureScore * 0.45 + readmeScore * 0.35 + Math.min(repo.stargazers_count, 20) * 2) / 12)));

      return {
        name: repo.name,
        description: repo.description ?? "Imported from GitHub. Add business context and measurable impact before saving.",
        repoUrl: `https://github.com/${username}/${repo.name}`,
        liveUrl: repo.homepage ?? "",
        readmeScore,
        complexityLevel,
        freshness: formatFreshness(repo.pushed_at),
        stars: repo.stargazers_count,
      };
    }),
  );

  return suggestions.sort((left, right) => right.readmeScore - left.readmeScore || right.stars - left.stars);
}
