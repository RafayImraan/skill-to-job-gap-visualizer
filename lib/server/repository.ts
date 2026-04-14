import type { Prisma } from "@prisma/client";
import type {
  AuthCredentialsInput,
  DashboardOverviewResponse,
  GithubAnalysisResponse,
  InterviewPrepResponse,
  MarketTrendsResponse,
  ProjectAnalysisResponse,
  GithubProjectSuggestion,
  ProfileMeResponse,
  ProfileSummaryResponse,
  ProjectInput,
  ProfileUpdateInput,
  RoadmapResponse,
  ResumeUploadResponse,
  SettingsResponse,
  SkillGapResponse,
} from "@/lib/types";
import {
  seededAuthSession,
  seededDashboardOverview,
  seededGithubAnalysis,
  seededInterviewPrep,
  seededMarketTrends,
  seededProjectAnalysis,
  seededProfileSummary,
  seededRoadmap,
  seededResumeUpload,
  seededSettings,
  seededSkillGap,
} from "@/lib/seed-data";
import { hashPassword, verifyPassword } from "@/lib/server/password";
import { getPrismaClient } from "@/lib/server/prisma";
import { analyzeResumeText } from "@/lib/server/resume";
import { fetchGithubAnalysis, fetchGithubProjectSuggestions } from "@/lib/server/github";
import { generateOllamaJson } from "@/lib/server/local-ai";

type UserWithRoadmap = Prisma.UserGetPayload<{
  include: {
    roadmap: true;
    projects: true;
  };
}>;

type UserWithSkills = Prisma.UserGetPayload<{
  include: {
    projects: true;
    skills: {
      include: {
        skill: true;
      };
    };
  };
}>;

type UserWithRoadmapOnly = Prisma.UserGetPayload<{
  include: {
    roadmap: true;
  };
}>;

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function createEmptyGithubAnalysis(username: string | null = null): GithubAnalysisResponse {
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
    connected: false,
  };
}

function createEmptyResumeUpload(): ResumeUploadResponse {
  return {
    extractedText: "",
    suggestedSkills: [],
    atsScore: 0,
    findings: [],
    keywordCoverage: 0,
    missingKeywords: [],
    weakPhrases: [],
    history: [],
    comparison: {
      previousAtsScore: null,
      currentAtsScore: 0,
      delta: 0,
    },
  };
}

function createEmptyProjectAnalysis(): ProjectAnalysisResponse {
  return {
    overallScore: 0,
    strongestSignal: "No projects added yet. Add your first project to begin recruiter-facing analysis.",
    nextUpgrade: "Add one real project with a repo link, description, and live URL if available.",
    projects: [],
  };
}

function buildTrend(finalValue: number) {
  const anchors = [0.42, 0.5, 0.56, 0.64, 0.72, 0.8, 0.9, 1];
  return anchors.map((anchor) => clamp(finalValue * anchor));
}

function roleFitText(role: string | null | undefined) {
  const normalized = (role ?? "").toLowerCase();
  if (normalized.includes("frontend")) return "Frontend";
  if (normalized.includes("product")) return "Product";
  if (normalized.includes("backend")) return "Backend";
  return "Generalist";
}

function estimateSalary(match: number, demand: number) {
  const low = 42 + Math.round(match / 3) + Math.round(demand / 8);
  const high = low + 18 + Math.round(demand / 5);
  return `$${low}k-$${high}k`;
}

function normalizeChecklistStatus(score: number): "Ready" | "Needs work" | "Improving" {
  if (score >= 72) return "Ready";
  if (score >= 52) return "Improving";
  return "Needs work";
}

function freshnessBucket(value: string) {
  if (value === "today" || value.endsWith("d ago")) return "recent";
  if (value.endsWith("w ago")) return "active";
  return "stale";
}

function buildGeneratedRoadmapMilestones(input: {
  skillGap: SkillGapResponse;
  githubAnalysis: GithubAnalysisResponse;
  resumeAnalysis: ResumeUploadResponse;
}) {
  const { skillGap, githubAnalysis, resumeAnalysis } = input;

  return [
    {
      day: 1,
      title: `Close ${skillGap.missingSkills[0] ?? "TypeScript"} fundamentals`,
      description: `Target the first missing signal: ${skillGap.missingSkills[0] ?? "TypeScript"}. Build one focused mini-project around it.`,
      xp: 140,
      done: false,
      unlocked: true,
    },
    {
      day: 7,
      title: "Upgrade a weak project",
      description: `Improve deployment and complexity on ${skillGap.weakProjects[0] ?? "your weakest visible project"}.`,
      xp: 180,
      done: false,
      unlocked: false,
    },
    {
      day: 14,
      title: "Resume keyword pass",
      description: `Add ${resumeAnalysis.missingKeywords.slice(0, 4).join(", ") || "role keywords"} and quantify impact bullets.`,
      xp: 160,
      done: false,
      unlocked: false,
    },
    {
      day: 21,
      title: "Polish GitHub proof",
      description: `Raise README quality, CI coverage, and deployment proof. Current README score: ${githubAnalysis.readmeScore}.`,
      xp: 220,
      done: false,
      unlocked: false,
    },
    {
      day: 30,
      title: "Ship recruiter-ready portfolio evidence",
      description: "Finalize one polished project case study with clear outcomes, demo links, and architecture notes.",
      xp: 260,
      done: false,
      unlocked: false,
    },
    {
      day: 45,
      title: `Learn ${skillGap.missingSkills[1] ?? "Testing"}`,
      description: "Add the next gap-closing skill and integrate it into your strongest project.",
      xp: 240,
      done: false,
      unlocked: false,
    },
    {
      day: 60,
      title: "Practice technical storytelling",
      description: "Turn your projects into strong interview narratives and recruiter-facing proof points.",
      xp: 180,
      done: false,
      unlocked: false,
    },
    {
      day: 90,
      title: "Apply with upgraded signal stack",
      description: "Use your improved resume, GitHub, and project portfolio to target matched roles deliberately.",
      xp: 420,
      done: false,
      unlocked: false,
    },
  ];
}

async function buildInterviewAiCoaching(input: {
  role: string;
  strongestProject: string;
  spotlightQuestion: string;
  technicalQuestions: string[];
  focusAreas: string[];
}) {
  return generateOllamaJson<{
    answerFramework?: string[];
    sampleAnswer?: string;
  }>(`
Return strict JSON with keys:
answerFramework, sampleAnswer

Role: ${input.role}
Strongest project: ${input.strongestProject}
Spotlight question: ${input.spotlightQuestion}
Technical questions:
${input.technicalQuestions.join("\n")}
Focus areas:
${input.focusAreas.join(", ")}

Rules:
- answerFramework must be an array of 4 short strings
- sampleAnswer must be 3 to 5 concise sentences
- keep it specific to software engineering interviews
`.trim());
}

async function buildRoadmapAiGuidance(input: {
  role: string;
  missingSkills: string[];
  milestones: Array<{ day: number; title: string; description: string }>;
}) {
  return generateOllamaJson<{
    planSummary?: string;
    coachTip?: string;
  }>(`
Return strict JSON with keys:
planSummary, coachTip

Role target: ${input.role}
Missing skills: ${input.missingSkills.join(", ")}
Milestones:
${input.milestones.map((item) => `Day ${item.day}: ${item.title} - ${item.description}`).join("\n")}

Rules:
- planSummary must be 2 sentences max
- coachTip must be 1 sentence
- keep it practical and execution-focused
`.trim());
}

export async function findUserById(userId: string) {
  const prisma = getPrismaClient();
  if (!prisma) return null;
  return prisma.user.findUnique({ where: { id: userId } });
}

export async function findUserByEmail(email: string) {
  const prisma = getPrismaClient();
  if (!prisma) return null;
  return prisma.user.findUnique({ where: { email } });
}

export async function authenticateUser(input: AuthCredentialsInput) {
  const user = await findUserByEmail(input.email);
  if (!user) return null;
  const valid = await verifyPassword(input.password, user.passwordHash);
  return valid ? user : null;
}

export async function createUser(input: AuthCredentialsInput) {
  const prisma = getPrismaClient();
  if (!prisma) {
    throw new Error("Database not configured.");
  }

  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    throw new Error("Account already exists.");
  }

  return prisma.user.create({
    data: {
      name: input.name ?? (input.email.includes("@") ? input.email.split("@")[0] : "New User"),
      email: input.email,
      passwordHash: await hashPassword(input.password),
      role: "Student",
    },
  });
}

export async function getDashboardOverview(userId?: string): Promise<DashboardOverviewResponse> {
  const prisma = getPrismaClient();

  if (!prisma || !userId) {
    return seededDashboardOverview;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      projects: true,
      roadmap: true,
    },
  });

  if (!user) {
    return seededDashboardOverview;
  }

  const typedUser = user as UserWithRoadmap;
  const completedMilestones = typedUser.roadmap.filter((item) => item.isCompleted).length;
  const roadmapProgress = typedUser.roadmap.length ? Math.round((completedMilestones / typedUser.roadmap.length) * 100) : 0;
  const projects = typedUser.projects;
  const deployedProjects = projects.filter((project) => Boolean(project.liveUrl)).length;
  const hasProjects = projects.length > 0;
  const hasResume = Boolean(user.resumeText?.trim());
  const projectScore = projects.length
    ? clamp(
        projects.reduce(
          (sum, project) => sum + project.complexityLevel * 8 + (project.liveUrl ? 12 : 0) + project.readmeScore / 4,
          0,
        ) / projects.length,
      )
    : 28;
  const resumeAnalysis = hasResume ? analyzeResumeText(user.resumeText!) : createEmptyResumeUpload();
  const githubAnalysis = await getGithubAnalysis(null, userId);
  const skillGap = await getSkillGap(userId);
  const hasGithub = githubAnalysis.connected && githubAnalysis.repos.length > 0;
  const marketMatch = clamp((projectScore * 0.26) + (resumeAnalysis.atsScore * 0.34) + (githubAnalysis.readmeScore * 0.2) + (deployedProjects * 8));
  const githubStrength = hasGithub
    ? clamp((githubAnalysis.readmeScore * 0.32) + (githubAnalysis.ciCoverage * 0.2) + (githubAnalysis.deploymentCoverage * 0.18) + Math.min(githubAnalysis.commitCount, 25))
    : 0;
  const atsAlignment = hasResume
    ? clamp((resumeAnalysis.atsScore * 0.78) + (100 - resumeAnalysis.missingKeywords.length * 6) * 0.22)
    : 0;
  const interviewConfidence = clamp((projectScore * 0.34) + (atsAlignment * 0.22) + (roadmapProgress * 0.18) + (hasProjects ? 18 : 0));
  const jobReadiness = clamp((projectScore * 0.3) + (atsAlignment * 0.25) + (githubStrength * 0.2) + (roadmapProgress * 0.25));
  const salaryLow = 48 + Math.round(jobReadiness / 4);
  const salaryHigh = salaryLow + 20 + Math.round(githubStrength / 10);
  const priorityActions = [
    !hasResume ? "Upload your resume to unlock ATS scoring and rewrite guidance" : null,
    !hasProjects ? "Add your first project with a repo or live link to unlock recruiter scoring" : null,
    !hasGithub ? "Add your GitHub username in Profile to unlock repository intelligence" : null,
    hasProjects && skillGap.weakProjects[0] ? `Strengthen ${skillGap.weakProjects[0]}` : null,
    hasResume && resumeAnalysis.missingKeywords[0] ? `Add ${resumeAnalysis.missingKeywords.slice(0, 3).join(", ")} to your resume and project docs` : null,
  ].filter(Boolean) as string[];

  return {
    role: user.name,
    target: user.role ?? "Set your target role in Profile",
    focus:
      !hasResume && !hasProjects && !hasGithub
        ? "Complete your profile, upload a resume, and add your first project to generate personalized guidance."
        : `${roleFitText(user.role)} track with ${skillGap.missingSkills.slice(0, 2).join(" + ") || "portfolio polish"} as the next unlock path.`,
    streak: seededDashboardOverview.streak,
    roadmapProgress,
    priorityActions: priorityActions.length > 0 ? priorityActions : seededDashboardOverview.priorityActions,
    kpis: [
      {
        title: "Job Readiness Score",
        value: String(jobReadiness),
        suffix: "%",
        tone: "cyan",
        change: `+${Math.max(3, Math.round(roadmapProgress / 12))}%`,
        insight: "Derived from projects, ATS alignment, GitHub strength, and roadmap completion.",
        trend: buildTrend(jobReadiness),
      },
      {
        title: "ATS Alignment",
        value: String(atsAlignment),
        suffix: "%",
        tone: "violet",
        change: `+${Math.max(4, 10 - resumeAnalysis.missingKeywords.length)}%`,
        insight: "Driven by keyword coverage, measurable impact, and reduction of weak phrasing.",
        trend: buildTrend(atsAlignment),
      },
      {
        title: "GitHub Strength",
        value: String(githubStrength),
        suffix: "/100",
        tone: "green",
        change: `+${Math.max(2, Math.round(githubAnalysis.deploymentCoverage / 20))}%`,
        insight: "Blends documentation quality, CI coverage, deployment proof, and contribution signals.",
        trend: buildTrend(githubStrength),
      },
      {
        title: "Market Match",
        value: String(marketMatch),
        suffix: "%",
        tone: "amber",
        change: `+${Math.max(3, skillGap.missingSkills.length)}%`,
        insight: "Estimated fit against portfolio depth, ATS coverage, and current role specialization.",
        trend: buildTrend(marketMatch),
      },
      {
        title: "Interview Confidence",
        value: String(interviewConfidence),
        suffix: "%",
        tone: "red",
        change: `+${Math.max(2, Math.round(projectScore / 25))}%`,
        insight: "Influenced by shipped work, clarity of impact, and roadmap momentum.",
        trend: buildTrend(interviewConfidence),
      },
      {
        title: "Salary Potential",
        value: `$${salaryLow}k-$${salaryHigh}k`,
        suffix: "",
        tone: "green",
        change: `+$${Math.max(4, Math.round(githubStrength / 15))}k`,
        insight: "Projected from readiness, deployment proof, and the current quality of public work evidence.",
        trend: buildTrend(Math.min(100, salaryHigh)),
      },
    ],
  };
}

export async function getSkillGap(userId: string | null): Promise<SkillGapResponse> {
  const prisma = getPrismaClient();

  if (!prisma || !userId) {
    return { ...seededSkillGap, userId };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { projects: true, skills: { include: { skill: true } } },
  });

  if (!user) {
    return { ...seededSkillGap, userId };
  }

  const typedUser = user as UserWithSkills;
  const userSkillNames = new Set(typedUser.skills.map((item) => item.skill.name));
  const missingSkills = seededSkillGap.missingSkills.filter((skill) => !userSkillNames.has(skill));
  const weakProjects = typedUser.projects
    .filter((project) => !project.liveUrl || project.complexityLevel < 6)
    .map((project) => `${project.title} (${!project.liveUrl ? "no deployment" : "low complexity"})`);

  return {
    ...seededSkillGap,
    userId,
    missingSkills: missingSkills.length > 0 ? missingSkills : seededSkillGap.missingSkills,
    weakProjects: weakProjects.length > 0 ? weakProjects : seededSkillGap.weakProjects,
  };
}

export async function getGithubAnalysis(username: string | null, userId?: string): Promise<GithubAnalysisResponse> {
  const prisma = getPrismaClient();

  let resolvedUsername = username;

  if (!resolvedUsername && prisma && userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { githubUsername: true },
    });

    resolvedUsername = user?.githubUsername ?? null;
  }

  if (!resolvedUsername) {
    return createEmptyGithubAnalysis(null);
  }

  try {
    return await fetchGithubAnalysis(resolvedUsername);
  } catch {
    return createEmptyGithubAnalysis(resolvedUsername);
  }
}

export async function getGithubProjectSuggestionsForUser(userId: string): Promise<GithubProjectSuggestion[]> {
  const prisma = getPrismaClient();

  if (!prisma) {
    return [];
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { githubUsername: true },
  });

  if (!user?.githubUsername) {
    return [];
  }

  try {
    return await fetchGithubProjectSuggestions(user.githubUsername);
  } catch {
    return [];
  }
}

export async function getResumeUpload(): Promise<ResumeUploadResponse> {
  return seededResumeUpload;
}

export async function getResumeUploadForUser(userId?: string): Promise<ResumeUploadResponse> {
  const prisma = getPrismaClient();

  if (!prisma || !userId) {
    return seededResumeUpload;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      resumeVersions: {
        orderBy: { createdAt: "desc" },
        take: 6,
      },
    },
  });

  if (!user?.resumeText) {
    return createEmptyResumeUpload();
  }

  const analysis = analyzeResumeText(user.resumeText);
  const history = user.resumeVersions
    .slice()
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
    .map((item, index) => ({
      id: item.id,
      createdAt: item.createdAt.toISOString(),
      label: item.sourceLabel ?? (index === 0 ? "Current version" : `Version ${user.resumeVersions.length - index}`),
      atsScore: item.atsScore,
      keywordCoverage: item.keywordCoverage,
      excerpt: item.resumeText.slice(0, 140),
      isCurrent: item.resumeText === user.resumeText,
    }));
  const currentScore = history[0]?.atsScore ?? analysis.atsScore;
  const previousScore = history[1]?.atsScore ?? null;

  return {
    ...analysis,
    history,
    comparison: {
      previousAtsScore: previousScore,
      currentAtsScore: currentScore,
      delta: previousScore === null ? 0 : currentScore - previousScore,
    },
  };
}

export async function saveResumeTextForUser(userId: string, resumeText: string, sourceLabel?: string) {
  const prisma = getPrismaClient();

  if (!prisma) {
    throw new Error("Database not configured.");
  }

  const analysis = analyzeResumeText(resumeText);

  await prisma.user.update({
    where: { id: userId },
    data: {
      resumeText,
    },
  });

  await prisma.resumeSnapshot.create({
    data: {
      userId,
      sourceLabel: sourceLabel ?? "Manual upload",
      resumeText,
      atsScore: analysis.atsScore,
      keywordCoverage: analysis.keywordCoverage,
    },
  });

  return getResumeUploadForUser(userId);
}

export async function saveResumeSnapshotForUser(userId: string, resumeText: string, sourceLabel?: string) {
  const prisma = getPrismaClient();

  if (!prisma) {
    throw new Error("Database not configured.");
  }

  const analysis = analyzeResumeText(resumeText);

  await prisma.resumeSnapshot.create({
    data: {
      userId,
      sourceLabel: sourceLabel ?? "Rewrite draft",
      resumeText,
      atsScore: analysis.atsScore,
      keywordCoverage: analysis.keywordCoverage,
    },
  });

  return getResumeUploadForUser(userId);
}

export async function restoreResumeSnapshotForUser(userId: string, snapshotId: string) {
  const prisma = getPrismaClient();

  if (!prisma) {
    throw new Error("Database not configured.");
  }

  const snapshot = await prisma.resumeSnapshot.findFirst({
    where: {
      id: snapshotId,
      userId,
    },
  });

  if (!snapshot) {
    throw new Error("Resume version not found.");
  }

  return saveResumeTextForUser(userId, snapshot.resumeText, `Restored: ${snapshot.sourceLabel ?? "Previous version"}`);
}

export async function getMarketTrends(): Promise<MarketTrendsResponse> {
  const prisma = getPrismaClient();

  if (!prisma) {
    return seededMarketTrends;
  }

  const roles = await prisma.jobRole.findMany({
    orderBy: { marketDemandScore: "desc" },
    take: 6,
  });

  if (roles.length === 0) {
    return seededMarketTrends;
  }

  const sampleUser = await prisma.user.findFirst({
    include: {
      projects: true,
      skills: { include: { skill: true } },
    },
  });

  const benchmarkUserId = sampleUser?.id ?? null;
  const [benchmarkGithub, benchmarkResume, benchmarkSkillGap] = await Promise.all([
    getGithubAnalysis(null, benchmarkUserId ?? undefined),
    getResumeUploadForUser(benchmarkUserId ?? undefined),
    getSkillGap(benchmarkUserId),
  ]);

  const userSkillNames = new Set(sampleUser?.skills.map((item) => item.skill.name) ?? []);
  const projectCount = sampleUser?.projects.length ?? 0;
  const deploymentCount = sampleUser?.projects.filter((project) => Boolean(project.liveUrl)).length ?? 0;

  return {
    roles: roles.map((role) => {
      const roleMissingSkills = role.keywords.filter((keyword) => !userSkillNames.has(keyword));
      const keywordMatch = role.keywords.length
        ? ((role.keywords.length - roleMissingSkills.length) / role.keywords.length) * 100
        : 60;
      const match = clamp(
        keywordMatch * 0.52 +
          benchmarkResume.atsScore * 0.18 +
          benchmarkGithub.readmeScore * 0.14 +
          Math.min(100, projectCount * 14 + deploymentCount * 10) * 0.16,
      );

      return {
        role: role.title,
        demand: role.marketDemandScore,
        salary: estimateSalary(match, role.marketDemandScore),
        match,
        missingSkills: roleMissingSkills.length > 0 ? roleMissingSkills.slice(0, 4) : benchmarkSkillGap.missingSkills.slice(0, 3),
        rationale:
          roleMissingSkills.length > 0
            ? `Best lift comes from adding ${roleMissingSkills.slice(0, 2).join(" and ")} evidence to projects and resume bullets.`
            : "Your current stack already overlaps well with this role. Stronger deployment proof would improve recruiter confidence.",
      };
    }),
  };
}

export async function getInterviewPrep(userId?: string): Promise<InterviewPrepResponse> {
  const prisma = getPrismaClient();

  if (!prisma || !userId) {
    return seededInterviewPrep;
  }

  const [user, skillGap, githubAnalysis, resumeAnalysis, overview] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        projects: true,
        roadmap: true,
      },
    }),
    getSkillGap(userId),
    getGithubAnalysis(null, userId),
    getResumeUploadForUser(userId),
    getDashboardOverview(userId),
  ]);

  if (!user) {
    return seededInterviewPrep;
  }

  const shippedProjects = user.projects.filter((project) => Boolean(project.liveUrl)).length;
  const roadmapProgress = overview.roadmapProgress;
  const confidenceScore = clamp(
    resumeAnalysis.atsScore * 0.22 +
      githubAnalysis.readmeScore * 0.18 +
      githubAnalysis.ciCoverage * 0.12 +
      roadmapProgress * 0.18 +
      Math.min(100, shippedProjects * 20) * 0.12 +
      (100 - skillGap.missingSkills.length * 7) * 0.18,
  );

  const systemDesignScore = clamp(42 + roadmapProgress * 0.18 - (skillGap.missingSkills.includes("System Design") ? 16 : 0));
  const debuggingScore = clamp(48 + githubAnalysis.ciCoverage * 0.3 - (skillGap.missingSkills.includes("Testing") ? 12 : 0));
  const storytellingScore = clamp(52 + resumeAnalysis.keywordCoverage * 0.28 + (/\d/.test(user.resumeText ?? "") ? 8 : 0));
  const frontendScore = clamp(58 + githubAnalysis.readmeScore * 0.16 + (user.role?.toLowerCase().includes("frontend") ? 10 : 0));
  const codingScore = clamp(50 + shippedProjects * 8 + (skillGap.missingSkills.includes("TypeScript") ? -10 : 6));

  const focusAreas = [
    skillGap.missingSkills[0] ? `${skillGap.missingSkills[0]} proof for technical rounds` : null,
    systemDesignScore < 60 ? "System design storytelling" : null,
    debuggingScore < 60 ? "Debugging walkthrough practice" : null,
    !/\d/.test(user.resumeText ?? "") ? "Quantified impact examples" : null,
  ].filter(Boolean) as string[];

  const strongestProject =
    user.projects
      .slice()
      .sort((left, right) => right.complexityLevel - left.complexityLevel || right.readmeScore - left.readmeScore)[0]
      ?.title ?? "your strongest shipped project";

  const spotlightQuestion = `Walk me through the toughest tradeoff you made while building ${strongestProject}.`;
  const technicalQuestions = [
    `How would you add ${skillGap.missingSkills[0] ?? "testing"} evidence to ${strongestProject} without slowing delivery too much?`,
    "How would you debug a production-only issue that users can reproduce but you cannot locally?",
    `If you were targeting ${user.role ?? "frontend"} roles, what metrics would you highlight from your best project to prove impact?`,
  ];
  const resolvedFocusAreas = focusAreas.length > 0 ? focusAreas : seededInterviewPrep.focusAreas;
  const aiCoaching = await buildInterviewAiCoaching({
    role: user.role ?? "Frontend Engineer",
    strongestProject,
    spotlightQuestion,
    technicalQuestions,
    focusAreas: resolvedFocusAreas,
  });

  return {
    confidenceScore,
    focusAreas: resolvedFocusAreas,
    checklist: [
      { label: "Behavioral stories mapped to STAR", status: normalizeChecklistStatus(storytellingScore) },
      { label: "Debugging walkthrough practice", status: normalizeChecklistStatus(debuggingScore) },
      { label: "System design basics", status: normalizeChecklistStatus(systemDesignScore) },
      { label: "Frontend performance tradeoffs", status: normalizeChecklistStatus(frontendScore) },
      { label: "Live coding confidence", status: normalizeChecklistStatus(codingScore) },
    ],
    spotlightQuestion: {
      question: spotlightQuestion,
      guidance:
        "Explain the constraint, the option you rejected, why your final choice fit the product or engineering goal, and what changed after shipping it.",
    },
    technicalQuestions,
    answerFramework:
      aiCoaching?.answerFramework?.filter((item) => typeof item === "string" && item.trim().length > 0).slice(0, 4) ??
      seededInterviewPrep.answerFramework,
    sampleAnswer: aiCoaching?.sampleAnswer?.trim() || seededInterviewPrep.sampleAnswer,
    provider: aiCoaching?.sampleAnswer ? "ai" : "fallback",
  };
}

export async function getProjectAnalysis(userId?: string): Promise<ProjectAnalysisResponse> {
  const prisma = getPrismaClient();

  if (!prisma || !userId) {
    return seededProjectAnalysis;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      projects: true,
    },
  });

  if (!user || user.projects.length === 0) {
    return createEmptyProjectAnalysis();
  }

  const githubAnalysis = await getGithubAnalysis(null, userId);
  const repoMap = new Map(
    githubAnalysis.repos.map((repo) => [
      repo.name.toLowerCase(),
      repo,
    ]),
  );

  const analyzedProjects = user.projects.map((project) => {
    const repoName =
      project.repoUrl?.split("/").filter(Boolean).pop()?.toLowerCase() ??
      project.title.toLowerCase().replace(/\s+/g, "-");
    const githubRepo = repoMap.get(repoName);
    const deploymentStatus = project.liveUrl
      ? project.liveUrl.includes("staging")
        ? "Staging only"
        : "Live"
      : githubRepo?.deployment === "Configured"
        ? "Live"
        : "No live demo";
    const docsScore = githubRepo?.docs ?? project.readmeScore;
    const freshness = githubRepo ? freshnessBucket(githubRepo.freshness) : "recent";
    const recruiterScore = clamp(
      project.complexityLevel * 8 +
        docsScore * 0.26 +
        (deploymentStatus === "Live" ? 16 : deploymentStatus === "Staging only" ? 10 : 0) +
        (githubRepo?.ci ?? 30) * 0.14 +
        (githubRepo?.structure ?? 60) * 0.12 +
        ((githubRepo?.stars ?? 0) > 0 ? Math.min(10, githubRepo?.stars ?? 0) : 0),
    );

    const recommendations = [
      !project.liveUrl ? "Add a public deployment or polished demo video" : null,
      docsScore < 75 ? "Expand the README with setup, architecture, and outcomes" : null,
      !project.description || project.description.length < 90 ? "Rewrite the summary around user problem, stack, and measurable impact" : null,
      (githubRepo?.ci ?? 0) < 60 ? "Add tests or CI proof to improve engineering credibility" : null,
      project.complexityLevel < 6 ? "Increase depth with auth, analytics, data persistence, or background workflows" : null,
    ].filter(Boolean) as string[];

    const qualitySignal =
      recruiterScore >= 82
        ? "Strong recruiter-ready evidence with clear shipping proof."
        : recruiterScore >= 65
          ? "Solid project signal, but it still needs stronger storytelling or quality evidence."
          : "Useful starter project, but not yet strong enough to carry applications on its own.";

    return {
      id: project.id,
      title: project.title,
      summary: project.description ?? "Project summary not written yet.",
      complexity: project.complexityLevel,
      recruiterScore,
      deploymentStatus,
      docsScore,
      qualitySignal,
      freshness,
      recommendations: recommendations.length > 0 ? recommendations : ["Keep shipping updates and add measurable outcomes to the README."],
      liveUrl: project.liveUrl,
      repoUrl: project.repoUrl,
      stars: githubRepo?.stars ?? 0,
    };
  });

  const overallScore = clamp(
    analyzedProjects.reduce((sum, project) => sum + project.recruiterScore, 0) / analyzedProjects.length,
  );
  const strongestProject = analyzedProjects
    .slice()
    .sort((left, right) => right.recruiterScore - left.recruiterScore)[0];
  const weakestProject = analyzedProjects
    .slice()
    .sort((left, right) => left.recruiterScore - right.recruiterScore)[0];

  return {
    overallScore,
    strongestSignal:
      strongestProject
        ? `${strongestProject.title} is your strongest portfolio proof right now with a ${strongestProject.recruiterScore}/100 recruiter score.`
        : seededProjectAnalysis.strongestSignal,
    nextUpgrade:
      weakestProject?.recommendations[0] ??
      seededProjectAnalysis.nextUpgrade,
    projects: analyzedProjects.sort((left, right) => right.recruiterScore - left.recruiterScore),
  };
}

export async function createProjectForUser(userId: string, input: ProjectInput) {
  const prisma = getPrismaClient();

  if (!prisma) {
    throw new Error("Database not configured.");
  }

  await prisma.project.create({
    data: {
      userId,
      title: input.title,
      description: input.description || null,
      complexityLevel: input.complexityLevel,
      repoUrl: input.repoUrl || null,
      liveUrl: input.liveUrl || null,
      readmeScore: input.readmeScore,
    },
  });
}

export async function updateProjectForUser(userId: string, projectId: string, input: ProjectInput) {
  const prisma = getPrismaClient();

  if (!prisma) {
    throw new Error("Database not configured.");
  }

  const updated = await prisma.project.updateMany({
    where: {
      id: projectId,
      userId,
    },
    data: {
      title: input.title,
      description: input.description || null,
      complexityLevel: input.complexityLevel,
      repoUrl: input.repoUrl || null,
      liveUrl: input.liveUrl || null,
      readmeScore: input.readmeScore,
    },
  });

  if (updated.count === 0) {
    throw new Error("Project not found.");
  }
}

export async function deleteProjectForUser(userId: string, projectId: string) {
  const prisma = getPrismaClient();

  if (!prisma) {
    throw new Error("Database not configured.");
  }

  const deleted = await prisma.project.deleteMany({
    where: {
      id: projectId,
      userId,
    },
  });

  if (deleted.count === 0) {
    throw new Error("Project not found.");
  }
}

export async function getRoadmap(userId?: string): Promise<RoadmapResponse> {
  const prisma = getPrismaClient();

  if (!prisma || !userId) {
    return seededRoadmap;
  }

  const [user, skillGap, githubAnalysis, resumeAnalysis] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { roadmap: true, projects: true },
    }),
    getSkillGap(userId),
    getGithubAnalysis(null, userId),
    getResumeUploadForUser(userId),
  ]);

  if (!user) {
    return seededRoadmap;
  }

  const storedMilestones = user.roadmap
    .sort((left, right) => left.dayNumber - right.dayNumber)
    .map((item) => ({
      id: item.id,
      day: item.dayNumber,
      title: item.title,
      description: item.description,
      xp: item.xpReward,
      done: item.isCompleted,
      unlocked: item.isUnlocked,
    }));

  if (storedMilestones.length >= 5) {
    const totalXp = storedMilestones.filter((item) => item.done).reduce((sum, item) => sum + item.xp, 0);
    const progress = clamp((storedMilestones.filter((item) => item.done).length / storedMilestones.length) * 100);
    const currentFocus =
      storedMilestones.find((item) => !item.done)?.title ??
      storedMilestones[storedMilestones.length - 1]?.title ??
      seededRoadmap.currentFocus;

    return {
      totalXp,
      progress,
      currentFocus,
      milestones: storedMilestones,
      planSummary: seededRoadmap.planSummary,
      coachTip: seededRoadmap.coachTip,
      provider: "fallback",
    };
  }

  const generated = buildGeneratedRoadmapMilestones({
    skillGap,
    githubAnalysis,
    resumeAnalysis,
  });

  const aiGuidance = await buildRoadmapAiGuidance({
    role: user.role ?? "Frontend Engineer",
    missingSkills: skillGap.missingSkills,
    milestones: generated.map((item) => ({
      day: item.day,
      title: item.title,
      description: item.description,
    })),
  });

  return {
    totalXp: 0,
    progress: 0,
    currentFocus: generated[0].title,
    milestones: generated,
    planSummary: aiGuidance?.planSummary?.trim() || seededRoadmap.planSummary,
    coachTip: aiGuidance?.coachTip?.trim() || seededRoadmap.coachTip,
    provider: aiGuidance?.planSummary || aiGuidance?.coachTip ? "ai" : "fallback",
  };
}

export async function updateRoadmapMilestoneForUser(userId: string, dayNumber: number, isCompleted: boolean) {
  const prisma = getPrismaClient();

  if (!prisma) {
    throw new Error("Database not configured.");
  }

  const [user, skillGap, githubAnalysis, resumeAnalysis] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { roadmap: true, projects: true },
    }),
    getSkillGap(userId),
    getGithubAnalysis(null, userId),
    getResumeUploadForUser(userId),
  ]);

  if (!user) {
    throw new Error("User not found.");
  }

  if (user.roadmap.length === 0) {
    const generated = buildGeneratedRoadmapMilestones({
      skillGap,
      githubAnalysis,
      resumeAnalysis,
    });

    await prisma.roadmapMilestone.createMany({
      data: generated.map((item) => ({
        userId,
        dayNumber: item.day,
        title: item.title,
        description: item.description,
        xpReward: item.xp,
        isCompleted: item.done,
        isUnlocked: item.unlocked ?? false,
      })),
    });
  }

  const milestones = await prisma.roadmapMilestone.findMany({
    where: { userId },
    orderBy: { dayNumber: "asc" },
  });

  const target = milestones.find((item) => item.dayNumber === dayNumber);
  if (!target) {
    throw new Error("Milestone not found.");
  }

  await prisma.roadmapMilestone.update({
    where: { id: target.id },
    data: {
      isCompleted,
      isUnlocked: true,
    },
  });

  const nextMilestone = milestones.find((item) => item.dayNumber > dayNumber);
  if (isCompleted && nextMilestone && !nextMilestone.isUnlocked) {
    await prisma.roadmapMilestone.update({
      where: { id: nextMilestone.id },
      data: { isUnlocked: true },
    });
  }

  if (!isCompleted) {
    const laterMilestones = milestones.filter((item) => item.dayNumber > dayNumber);
    for (const item of laterMilestones) {
      await prisma.roadmapMilestone.update({
        where: { id: item.id },
        data: {
          isCompleted: false,
          isUnlocked: item.dayNumber === (nextMilestone?.dayNumber ?? -1),
        },
      });
    }
  }

  return getRoadmap(userId);
}

export async function getProfileSummary(userId?: string): Promise<ProfileSummaryResponse> {
  const prisma = getPrismaClient();

  if (!prisma || !userId) {
    return seededProfileSummary;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roadmap: true,
    },
  });

  if (!user) {
    return seededProfileSummary;
  }

  const completedMilestones = (user as UserWithRoadmapOnly).roadmap.filter((item) => item.isCompleted).length;

  return {
    ...seededProfileSummary,
    name: user.name,
    target: user.role ?? seededProfileSummary.target,
    roadmapProjection: `${completedMilestones} milestones completed`,
  };
}

export async function getProfileMe(userId?: string): Promise<ProfileMeResponse | null> {
  const prisma = getPrismaClient();

  if (!prisma || !userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    linkedinUrl: user.linkedinUrl,
    githubUsername: user.githubUsername,
    resumeText: user.resumeText,
  };
}

export async function updateProfileMe(userId: string, input: ProfileUpdateInput): Promise<ProfileMeResponse | null> {
  const prisma = getPrismaClient();

  if (!prisma) {
    return null;
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: input.name,
      role: input.role,
      linkedinUrl: input.linkedinUrl || null,
      githubUsername: input.githubUsername || null,
      resumeText: input.resumeText || null,
    },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    linkedinUrl: user.linkedinUrl,
    githubUsername: user.githubUsername,
    resumeText: user.resumeText,
  };
}

export async function getSettings(): Promise<SettingsResponse> {
  return seededSettings;
}

export async function getAuthSession() {
  return seededAuthSession;
}
