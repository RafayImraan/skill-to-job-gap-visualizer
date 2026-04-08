import {
  Briefcase,
  Compass,
  FileSearch,
  Github,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  Settings,
  Sparkles,
  Target,
} from "lucide-react";

export const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/gap-analysis", label: "Gap Analysis", icon: Sparkles },
  { href: "/dashboard/github-intelligence", label: "GitHub Intelligence", icon: Github },
  { href: "/dashboard/resume-ats", label: "Resume ATS", icon: FileSearch },
  { href: "/dashboard/market-trends", label: "Market Trends", icon: LineChart },
  { href: "/dashboard/roadmap", label: "90-Day Roadmap", icon: Compass },
  { href: "/dashboard/projects", label: "Projects", icon: Briefcase },
  { href: "/dashboard/interview-prep", label: "Interview Prep", icon: GraduationCap },
  { href: "/dashboard/profile", label: "Public Profile", icon: Target },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

export const topNavItems = navItems.filter((item) =>
  ["/dashboard", "/dashboard/gap-analysis", "/dashboard/projects", "/dashboard/settings", "/dashboard/profile"].includes(item.href),
);

export const brandStory = {
  role: "Ayesha Khan",
  target: "Frontend / Product Engineer",
  focus: "Dream role path: Frontend core -> TypeScript -> Testing -> System Design -> Cloud fluency",
  streak: "12-day learning streak",
};

export const pageIntros: Record<string, { title: string; copy: string }> = {
  dashboard: {
    title: "Command center for job readiness",
    copy: "Track your strongest signals, weakest gaps, and the exact next moves that improve shortlisting odds.",
  },
  "gap-analysis": {
    title: "Skill galaxy and missing path analysis",
    copy: "See your core strengths, missing prerequisites, and the learning path that unlocks the role you want.",
  },
  "github-intelligence": {
    title: "GitHub strength, freshness, and repo quality",
    copy: "Turn public repos into evidence recruiters can trust with clearer quality signals and deployment proof.",
  },
  "resume-ats": {
    title: "Resume alignment with ATS and hiring teams",
    copy: "Close the keyword, phrasing, and quantified-impact gaps that hold your resume back.",
  },
  "market-trends": {
    title: "Market demand and salary direction",
    copy: "Aim your effort at the roles, tools, and salary ranges that best match your momentum.",
  },
  roadmap: {
    title: "90-day roadmap with milestones and XP",
    copy: "A gamified quest-map that sequences skill building, project shipping, and interview preparation.",
  },
  projects: {
    title: "Project depth, polish, and deployment signal",
    copy: "Upgrade simple coursework into credible portfolio evidence with higher complexity and better shipping habits.",
  },
  "interview-prep": {
    title: "Interview prep and confidence builders",
    copy: "Prepare stories, technical explanations, and simulations that move confidence from fragile to repeatable.",
  },
  profile: {
    title: "Recruiter-facing public profile",
    copy: "A polished profile view that translates your metrics, projects, and roadmap progress into hiring signal.",
  },
  settings: {
    title: "Preferences and accessibility",
    copy: "Control motion, reminders, sync cadence, and the level of automated assistance you want.",
  },
};

export const quickFacts = [
  "Next.js 15 app-router foundation",
  "Premium dark glassmorphism design system",
  "API contracts and schema scaffolding aligned to the PDF",
];

export const heroStats = [
  { label: "Job readiness", value: "74%", tone: "cyan" },
  { label: "Gaps detected", value: "11", tone: "amber" },
  { label: "Roadmap XP", value: "1,280", tone: "violet" },
];

export const kpis = [
  {
    title: "Job Readiness Score",
    value: "74",
    suffix: "%",
    tone: "cyan",
    change: "+8.4%",
    insight: "Your strongest lift comes from shipped projects and improving ATS keyword coverage.",
    trend: [32, 38, 41, 49, 55, 60, 68, 74],
  },
  {
    title: "ATS Alignment",
    value: "63",
    suffix: "%",
    tone: "violet",
    change: "+12.1%",
    insight: "You are missing role-specific keywords like Docker, SQL, and observability.",
    trend: [24, 26, 31, 35, 40, 48, 58, 63],
  },
  {
    title: "GitHub Strength",
    value: "71",
    suffix: "/100",
    tone: "green",
    change: "+5.8%",
    insight: "Commit frequency is healthy, but test coverage and README polish are pulling the score down.",
    trend: [30, 35, 37, 43, 52, 60, 66, 71],
  },
  {
    title: "Market Match",
    value: "78",
    suffix: "%",
    tone: "amber",
    change: "+6.2%",
    insight: "Frontend and product-minded roles fit well; cloud depth is the clearest missing differentiator.",
    trend: [28, 34, 40, 52, 57, 63, 72, 78],
  },
  {
    title: "Interview Confidence",
    value: "69",
    suffix: "%",
    tone: "red",
    change: "+3.5%",
    insight: "Behavioral storytelling is solid. System design and debugging pressure rounds need work.",
    trend: [22, 25, 29, 38, 44, 53, 61, 69],
  },
  {
    title: "Salary Potential",
    value: "$60k-$84k",
    suffix: "",
    tone: "green",
    change: "+$6k",
    insight: "Adding TypeScript, Docker, and one production-grade deployed project lifts your upper band.",
    trend: [42, 44, 46, 50, 58, 63, 72, 80],
  },
];

export const orbitRings = [140, 220, 300];

export const skillNodes = [
  { label: "Frontend Core", x: 50, y: 50, state: "core" },
  { label: "React", x: 28, y: 28, state: "completed" },
  { label: "TypeScript", x: 54, y: 18, state: "missing" },
  { label: "Next.js", x: 74, y: 30, state: "completed" },
  { label: "Testing", x: 78, y: 56, state: "missing" },
  { label: "DSA", x: 66, y: 74, state: "missing" },
  { label: "System Design", x: 47, y: 82, state: "missing" },
  { label: "Node API", x: 24, y: 70, state: "completed" },
  { label: "SQL", x: 16, y: 50, state: "missing" },
  { label: "Docker", x: 22, y: 18, state: "missing" },
  { label: "AWS", x: 86, y: 42, state: "missing" },
] as const;

export const roadmapMilestones = [
  { day: 1, title: "JavaScript Deep Dive", description: "Refresh closures, async flows, and event-loop fundamentals.", xp: 120, done: true },
  { day: 7, title: "Build Weather App", description: "Ship a polished dashboard with API caching and responsive states.", xp: 180, done: true },
  { day: 14, title: "API + Auth", description: "Add protected routes, session state, and role-aware navigation.", xp: 210, done: true },
  { day: 21, title: "Deploy SaaS", description: "Deploy on Vercel with env vars, analytics, and a monitored pipeline.", xp: 260, done: false },
  { day: 30, title: "GitHub Polish", description: "Improve README depth, issue templates, labels, and CI checks.", xp: 150, done: false },
  { day: 45, title: "Build AI Project", description: "Create an LLM-powered feature with prompt evaluation and fallbacks.", xp: 340, done: false },
  { day: 60, title: "System Design Basics", description: "Study caching, queues, load balancing, and data modeling tradeoffs.", xp: 220, done: false },
  { day: 90, title: "Apply for Internships", description: "Finalize ATS resume, recruiter profile, and curated application targets.", xp: 500, done: false },
];

export const githubRepos = [
  { name: "skill-graph-lab", structure: 84, docs: 72, ci: 65 },
  { name: "campus-marketplace", structure: 71, docs: 58, ci: 40 },
  { name: "portfolio-next", structure: 88, docs: 91, ci: 74 },
];

export const languageShare = [
  { label: "TypeScript", value: 42 },
  { label: "JavaScript", value: 28 },
  { label: "Python", value: 16 },
  { label: "CSS", value: 9 },
  { label: "SQL", value: 5 },
];

export const atsFindings = [
  {
    title: "Missing role keywords",
    detail: "Add Docker, REST API, SQL, observability, and CI/CD to match current internship descriptions.",
    confidence: "High confidence",
  },
  {
    title: "Weak action verbs",
    detail: "Replace 'responsible for' and 'worked on' with stronger outcomes-driven verbs.",
    confidence: "Medium confidence",
  },
  {
    title: "Impact statements underpowered",
    detail: "Quantify speed gains, user counts, bug reduction, and deployment uptime where possible.",
    confidence: "High confidence",
  },
];

export const marketTrends = [
  { role: "Frontend Engineer", demand: 86, salary: "$58k-$82k", match: 81 },
  { role: "Full Stack Intern", demand: 91, salary: "$62k-$88k", match: 76 },
  { role: "Platform Engineering Intern", demand: 67, salary: "$70k-$96k", match: 44 },
  { role: "AI Product Engineer", demand: 79, salary: "$72k-$108k", match: 59 },
];

export const projects = [
  {
    title: "SkillSync Dashboard",
    complexity: 8,
    deployment: "Live on Vercel",
    summary: "Analytics-rich student dashboard with roadmap and recruiter-facing profile surfaces.",
  },
  {
    title: "Campus Blog",
    complexity: 4,
    deployment: "No live demo",
    summary: "UI quality is clean, but there is no backend depth, metrics layer, or production deployment.",
  },
  {
    title: "Issue Tracker API",
    complexity: 7,
    deployment: "Staging only",
    summary: "Strong backend fundamentals; needs tests, docs, and public demo credibility.",
  },
];

export const interviewChecklist = [
  { label: "Behavioral stories mapped to STAR", status: "Ready" },
  { label: "Debugging walkthrough practice", status: "Needs work" },
  { label: "System design basics", status: "Needs work" },
  { label: "Frontend performance tradeoffs", status: "Ready" },
  { label: "Live coding confidence", status: "Improving" },
];

export const profileHighlights = [
  "Top 15% momentum in frontend-market readiness",
  "3 shipped projects with deployment evidence",
  "Roadmap completion projected in 11 weeks",
  "Strongest fit: product-minded frontend roles",
];

export const settings = [
  { label: "Reduce motion", value: "Off" },
  { label: "Theme", value: "Dark default" },
  { label: "Resume auto-fix", value: "Ask before applying" },
  { label: "GitHub sync cadence", value: "Daily" },
  { label: "Roadmap reminders", value: "3 times / week" },
];

export const heatmapCells = Array.from({ length: 72 }, (_, index) => (index * 7) % 5);
export const sparklineMax = 100;

export const sampleResumeBullets = [
  "Built and maintained a student dashboard used by campus clubs.",
  "Responsible for improving the frontend experience and deployment setup.",
  "Worked on API integration and project collaboration across a small team.",
];
