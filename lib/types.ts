export type KpiCard = {
  title: string;
  value: string;
  suffix: string;
  tone: string;
  change: string;
  insight: string;
  trend: number[];
};

export type DashboardOverviewResponse = {
  role: string;
  target: string;
  focus: string;
  streak: string;
  roadmapProgress: number;
  priorityActions: string[];
  kpis: KpiCard[];
};

export type SkillGapResponse = {
  userId: string | null;
  missingSkills: string[];
  weakProjects: string[];
  domainFocus: string;
  gapScores: {
    skills: number;
    projects: number;
    ats: number;
  };
  internshipFitScore: number;
  marketMatchScore: number;
};

export type GithubAnalysisResponse = {
  username: string | null;
  commitCount: number;
  languages: Array<{
    label: string;
    value: number;
  }>;
  stars: number;
  readmeScore: number;
  deploymentCoverage: number;
  ciCoverage: number;
  repos: Array<{
    name: string;
    structure: number;
    docs: number;
    ci: number;
    freshness: string;
    deployment: string;
    stars: number;
  }>;
  heatmap: number[];
  connected: boolean;
};

export type MarketTrendsResponse = {
  roles: Array<{
    role: string;
    demand: number;
    salary: string;
    match: number;
    missingSkills?: string[];
    rationale?: string;
  }>;
};

export type ResumeUploadResponse = {
  extractedText: string;
  suggestedSkills: string[];
  atsScore: number;
  findings: Array<{
    title: string;
    detail: string;
    confidence: string;
    severity: "green" | "amber" | "red" | "violet";
  }>;
  keywordCoverage: number;
  missingKeywords: string[];
  weakPhrases: string[];
  history: Array<{
    id: string;
    createdAt: string;
    label: string;
    atsScore: number;
    keywordCoverage: number;
    excerpt: string;
    isCurrent: boolean;
  }>;
  comparison: {
    previousAtsScore: number | null;
    currentAtsScore: number;
    delta: number;
  };
};

export type ResumeRewriteResponse = {
  mode: "ai" | "fallback";
  targetRole: string;
  matchScore: number;
  summary: string;
  improvedBullets: string[];
  recommendedKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
};

export type RoadmapMilestoneItem = {
  id?: string;
  day: number;
  title: string;
  description: string;
  xp: number;
  done: boolean;
  unlocked?: boolean;
};

export type RoadmapResponse = {
  totalXp: number;
  progress: number;
  currentFocus: string;
  milestones: RoadmapMilestoneItem[];
  planSummary: string;
  coachTip: string;
  provider: "ai" | "fallback";
};

export type InterviewPrepResponse = {
  confidenceScore: number;
  focusAreas: string[];
  checklist: Array<{
    label: string;
    status: "Ready" | "Needs work" | "Improving";
  }>;
  spotlightQuestion: {
    question: string;
    guidance: string;
  };
  technicalQuestions: string[];
  answerFramework: string[];
  sampleAnswer: string;
  provider: "ai" | "fallback";
};

export type ProjectAnalysisResponse = {
  overallScore: number;
  strongestSignal: string;
  nextUpgrade: string;
  projects: Array<{
    id: string;
    title: string;
    summary: string;
    complexity: number;
    recruiterScore: number;
    deploymentStatus: string;
    docsScore: number;
    qualitySignal: string;
    freshness: string;
    recommendations: string[];
    liveUrl: string | null;
    repoUrl: string | null;
    stars: number;
  }>;
};

export type ProjectInput = {
  title: string;
  description: string;
  complexityLevel: number;
  repoUrl: string;
  liveUrl: string;
  readmeScore: number;
};

export type GithubProjectSuggestion = {
  name: string;
  description: string;
  repoUrl: string;
  liveUrl: string;
  readmeScore: number;
  complexityLevel: number;
  freshness: string;
  stars: number;
};

export type ProfileSummaryResponse = {
  name: string;
  target: string;
  highlights: string[];
  strongestFit: string;
  roadmapProjection: string;
};

export type SettingsResponse = {
  items: Array<{
    label: string;
    value: string;
  }>;
};

export type AuthSessionResponse = {
  authenticated: boolean;
  provider: string;
  recommendedNextStep: string;
  configured: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role: string | null;
  } | null;
};

export type ProfileMeResponse = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  linkedinUrl: string | null;
  githubUsername: string | null;
  resumeText: string | null;
};

export type AuthCredentialsInput = {
  email: string;
  password: string;
  name?: string;
};

export type ProfileUpdateInput = {
  name?: string;
  role?: string;
  linkedinUrl?: string;
  githubUsername?: string;
  resumeText?: string;
};
