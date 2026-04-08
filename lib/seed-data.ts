import type {
  DashboardOverviewResponse,
  GithubAnalysisResponse,
  InterviewPrepResponse,
  MarketTrendsResponse,
  ProjectAnalysisResponse,
  ProfileSummaryResponse,
  RoadmapResponse,
  ResumeUploadResponse,
  SettingsResponse,
  SkillGapResponse,
} from "@/lib/types";
import { atsFindings, brandStory, interviewChecklist, kpis, marketTrends, profileHighlights, settings } from "@/lib/mock-data";

export const seededDashboardOverview: DashboardOverviewResponse = {
  role: brandStory.role,
  target: brandStory.target,
  focus: brandStory.focus,
  streak: brandStory.streak,
  roadmapProgress: 74,
  priorityActions: [
    "Ship one deployed full-stack app",
    "Add TypeScript + testing proof",
    "Rewrite 3 resume bullets with quantified impact",
  ],
  kpis,
};

export const seededSkillGap: SkillGapResponse = {
  userId: "demo-user",
  missingSkills: ["Docker", "AWS", "TypeScript", "Testing", "SQL"],
  weakProjects: ["Campus Blog (no backend)", "Portfolio clone (missing analytics)"],
  domainFocus: "Frontend",
  gapScores: { skills: 75, projects: 60, ats: 80 },
  internshipFitScore: 62,
  marketMatchScore: 74,
};

export const seededGithubAnalysis: GithubAnalysisResponse = {
  username: "ayeshakhan",
  commitCount: 246,
  languages: [
    { label: "TypeScript", value: 42 },
    { label: "JavaScript", value: 28 },
    { label: "Python", value: 16 },
    { label: "CSS", value: 9 },
    { label: "SQL", value: 5 },
  ],
  stars: 29,
  readmeScore: 78,
  deploymentCoverage: 67,
  ciCoverage: 44,
  repos: [
    { name: "skill-graph-lab", structure: 84, docs: 72, ci: 65, freshness: "2d ago", deployment: "Configured", stars: 12 },
    { name: "campus-marketplace", structure: 71, docs: 58, ci: 40, freshness: "8d ago", deployment: "Missing", stars: 8 },
    { name: "portfolio-next", structure: 88, docs: 91, ci: 74, freshness: "today", deployment: "Configured", stars: 9 },
  ],
  heatmap: Array.from({ length: 72 }, (_, index) => (index * 7) % 5),
  connected: false,
};

export const seededResumeUpload: ResumeUploadResponse = {
  extractedText:
    "Built and maintained a student dashboard used by campus clubs. Responsible for improving the frontend experience and deployment setup.",
  suggestedSkills: ["TypeScript", "REST API", "CI/CD", "Docker"],
  atsScore: 63,
  findings: [
    {
      title: "Missing role keywords",
      detail: "Add Docker, REST API, SQL, observability, and CI/CD to match current internship descriptions.",
      confidence: "High confidence",
      severity: "red",
    },
    {
      title: "Weak action verbs",
      detail: "Replace 'responsible for' and 'worked on' with stronger outcomes-driven verbs.",
      confidence: "Medium confidence",
      severity: "amber",
    },
    {
      title: "Impact statements",
      detail: "Add measurable results like user counts, speed gains, or issue reduction.",
      confidence: "High confidence",
      severity: "violet",
    },
  ],
  keywordCoverage: 63,
  missingKeywords: ["Docker", "SQL", "Testing"],
  weakPhrases: ["responsible for"],
  history: [
    {
      id: "seed-resume-1",
      createdAt: new Date("2026-03-10T09:00:00.000Z").toISOString(),
      label: "Initial upload",
      atsScore: 54,
      keywordCoverage: 50,
      excerpt: "Built and maintained a student dashboard used by campus clubs.",
      isCurrent: false,
    },
    {
      id: "seed-resume-2",
      createdAt: new Date("2026-04-01T09:00:00.000Z").toISOString(),
      label: "Current version",
      atsScore: 63,
      keywordCoverage: 63,
      excerpt: "Improved the frontend experience and deployment setup with clearer ownership.",
      isCurrent: true,
    },
  ],
  comparison: {
    previousAtsScore: 54,
    currentAtsScore: 63,
    delta: 9,
  },
};

export const seededProfileSummary: ProfileSummaryResponse = {
  name: brandStory.role,
  target: brandStory.target,
  highlights: profileHighlights,
  strongestFit: "Product-minded frontend roles",
  roadmapProjection: "Projected roadmap completion in 11 weeks",
};

export const seededSettings: SettingsResponse = {
  items: settings,
};

export const seededMarketTrends: MarketTrendsResponse = {
  roles: marketTrends,
};

export const seededProjectAnalysis: ProjectAnalysisResponse = {
  overallScore: 72,
  strongestSignal: "Two projects already show deployment proof and mid-to-high complexity.",
  nextUpgrade: "Add stronger README depth, test evidence, and measurable project outcomes to your weakest project.",
  projects: [
    {
      id: "seed-project-1",
      title: "SkillSync Dashboard",
      summary: "Analytics-rich student dashboard with roadmap and recruiter-facing profile surfaces.",
      complexity: 8,
      recruiterScore: 84,
      deploymentStatus: "Live on Vercel",
      docsScore: 88,
      qualitySignal: "Strong product polish with visible deployment proof.",
      freshness: "recent",
      recommendations: ["Add testing screenshots or coverage notes", "Document architecture decisions in the README"],
      liveUrl: "https://skillsync.example.com",
      repoUrl: "https://github.com/ayeshakhan/skillsync-dashboard",
      stars: 12,
    },
    {
      id: "seed-project-2",
      title: "Campus Blog",
      summary: "UI quality is clean, but there is no backend depth, metrics layer, or production deployment.",
      complexity: 4,
      recruiterScore: 52,
      deploymentStatus: "No live demo",
      docsScore: 54,
      qualitySignal: "Readable UI work, but weak proof of production readiness.",
      freshness: "stale",
      recommendations: ["Add deployment proof", "Introduce backend or analytics depth", "Rewrite the README around impact"],
      liveUrl: null,
      repoUrl: "https://github.com/ayeshakhan/campus-blog",
      stars: 8,
    },
    {
      id: "seed-project-3",
      title: "Issue Tracker API",
      summary: "Strong backend fundamentals; needs tests, docs, and public demo credibility.",
      complexity: 7,
      recruiterScore: 74,
      deploymentStatus: "Staging only",
      docsScore: 76,
      qualitySignal: "Solid engineering depth with room to improve public storytelling.",
      freshness: "recent",
      recommendations: ["Add example requests and architecture notes", "Expose a stable live demo endpoint"],
      liveUrl: "https://staging.example.com",
      repoUrl: "https://github.com/ayeshakhan/issue-tracker-api",
      stars: 9,
    },
  ],
};

export const seededInterviewPrep: InterviewPrepResponse = {
  confidenceScore: 69,
  focusAreas: ["System design basics", "Debugging walkthroughs", "Quantified project storytelling"],
  checklist: interviewChecklist.map((item) => ({
    label: item.label,
    status: item.status as "Ready" | "Needs work" | "Improving",
  })),
  spotlightQuestion: {
    question: "Tell me about a time you improved a product under pressure.",
    guidance: "Anchor your answer in the problem, the tradeoff you chose, and a measurable outcome.",
  },
  technicalQuestions: [
    "How would you debug a slow React dashboard rendering multiple charts?",
    "When would you choose server components versus client components in Next.js?",
    "How would you introduce testing into a project that currently has none?",
  ],
  answerFramework: ["Situation", "Task", "Action", "Result"],
  sampleAnswer:
    "Start with the problem and constraint, explain the tradeoff you chose, then finish with a measurable result and what you learned.",
  provider: "fallback",
};

export const seededRoadmap: RoadmapResponse = {
  totalXp: 1280,
  progress: 37,
  currentFocus: "Deploy SaaS",
  milestones: [
    { day: 1, title: "JavaScript Deep Dive", description: "Refresh closures, async flows, and event-loop fundamentals.", xp: 120, done: true },
    { day: 7, title: "Build Weather App", description: "Ship a polished dashboard with API caching and responsive states.", xp: 180, done: true },
    { day: 14, title: "API + Auth", description: "Add protected routes, session state, and role-aware navigation.", xp: 210, done: true },
    { day: 21, title: "Deploy SaaS", description: "Deploy on Vercel with env vars, analytics, and a monitored pipeline.", xp: 260, done: false },
    { day: 30, title: "GitHub Polish", description: "Improve README depth, issue templates, labels, and CI checks.", xp: 150, done: false },
    { day: 45, title: "Build AI Project", description: "Create an LLM-powered feature with prompt evaluation and fallbacks.", xp: 340, done: false },
    { day: 60, title: "System Design Basics", description: "Study caching, queues, load balancing, and data modeling tradeoffs.", xp: 220, done: false },
    { day: 90, title: "Apply for Internships", description: "Finalize ATS resume, recruiter profile, and curated application targets.", xp: 500, done: false },
  ],
  planSummary:
    "This roadmap prioritizes shipping proof, resume alignment, and stronger public engineering signals before application season.",
  coachTip: "Treat each milestone as application evidence, not just study time.",
  provider: "fallback",
};

export const seededAuthSession = {
  authenticated: false,
  provider: "supabase",
  recommendedNextStep: "Connect Supabase auth and create a user session flow.",
  user: null,
};

export const seededAtsFindings = atsFindings;
