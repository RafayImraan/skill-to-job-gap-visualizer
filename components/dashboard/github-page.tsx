"use client";

import dynamic from "next/dynamic";
import { Github } from "lucide-react";
import { useGithubAnalysis } from "@/lib/api";
import { GlassCard, PageHeader, QueryMessage } from "@/components/dashboard/shared-ui";

const GithubRadar = dynamic(() => import("@/components/data-charts").then((mod) => mod.GithubRadar), {
  ssr: false,
  loading: () => <div className="surface panel" style={{ minHeight: 260 }} />,
});

export function GithubPage() {
  const github = useGithubAnalysis();
  const githubData = github.data;
  const heatmap = githubData?.heatmap ?? Array.from({ length: 72 }, (_, index) => (index * 7) % 5);
  const languages = githubData?.languages ?? [];
  const repos = githubData?.repos ?? [];

  return (
    <>
      <PageHeader page="github-intelligence" />
      <section className="grid-2">
        <GlassCard>
          <div className="row-between">
            <div>
              <div className="muted">Contribution heatmap</div>
              <h2 className="section-title" style={{ marginTop: 10 }}>
                Commit consistency
              </h2>
            </div>
            <Github color="var(--green)" />
          </div>
          <div className="heatmap">
            {heatmap.map((cell, index) => (
              <div
                key={index}
                className="heat-cell"
                style={{
                  background:
                    cell === 0
                      ? "rgba(255,255,255,0.05)"
                      : cell === 1
                        ? "rgba(0,227,140,0.16)"
                        : cell === 2
                          ? "rgba(0,227,140,0.3)"
                          : cell === 3
                            ? "rgba(94,233,255,0.35)"
                            : "rgba(180,124,255,0.4)",
                }}
              />
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="muted">Language distribution</div>
          <h2 className="section-title" style={{ marginTop: 10 }}>
            Live language mix
          </h2>
          <div className="tag-row" style={{ alignItems: "end", minHeight: 220 }}>
            {(languages.length > 0 ? languages : [{ label: "No data", value: 20 }]).map((language) => (
              <div
                key={language.label}
                className="surface"
                style={{
                  width: 70 + language.value * 2,
                  height: 70 + language.value * 2,
                  borderRadius: "999px",
                  display: "grid",
                  placeItems: "center",
                  padding: 14,
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <strong>{language.label}</strong>
                  <div className="muted">{language.value}%</div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>

      <GlassCard>
        <div className="row-between">
          <div>
            <div className="muted">Repository radar</div>
            <h2 className="section-title" style={{ marginTop: 10 }}>
              Quality signal shape
            </h2>
          </div>
          <span className="pill">Deploy + docs + CI</span>
        </div>
        <GithubRadar
          docs={githubData?.readmeScore ?? 0}
          ci={githubData?.ciCoverage ?? 0}
          structure={
            repos.length > 0 ? Math.round(repos.reduce((sum, repo) => sum + repo.structure, 0) / repos.length) : 0
          }
          deployment={githubData?.deploymentCoverage ?? 0}
        />
      </GlassCard>

      <GlassCard>
        {github.isError ? <QueryMessage message="GitHub analysis is temporarily unavailable." /> : null}
        {!githubData?.connected ? (
          <QueryMessage message="GitHub is not connected yet. Add your GitHub username in Profile to unlock repository analysis." />
        ) : null}
        <div className="table-like">
          {(repos.length > 0
            ? repos
            : [
                {
                  name: "No repositories yet",
                  structure: 0,
                  docs: 0,
                  ci: 0,
                  freshness: "n/a",
                  deployment: "Missing",
                  stars: 0,
                },
              ]
          ).map((repo) => (
            <div key={repo.name} className="table-row">
              <strong>{repo.name}</strong>
              <span>Structure: {repo.structure}</span>
              <span>Docs: {repo.docs}</span>
              <span>CI: {repo.ci}</span>
            </div>
          ))}
        </div>
        <div className="tag-row" style={{ marginTop: 16 }}>
          <span className="pill">User: {githubData?.username ?? "not linked"}</span>
          <span className="pill">Commits: {githubData?.commitCount ?? 0}</span>
          <span className="pill">Stars: {githubData?.stars ?? 0}</span>
          <span className="pill">README score: {githubData?.readmeScore ?? 0}</span>
          <span className="pill">Deployment: {githubData?.deploymentCoverage ?? 0}%</span>
        </div>
      </GlassCard>
    </>
  );
}
