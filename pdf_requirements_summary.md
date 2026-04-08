# Skill-to-Job Gap Visualizer - PDF Summary

## Source
- `Skill-to-Job Gap Visualizer – Development Prompt.pdf`

## Product Goal
- Build a full-stack AI-driven student career dashboard that explains why a student is not getting shortlisted.
- Compare a user's skills, projects, resume, and GitHub profile against job-market expectations.
- Deliver actionable recommendations, premium visuals, smooth animation, and gamified motivation.

## Core Features
- Skill gap analysis with missing technical/domain skills and market demand scores.
- Project quality analysis with complexity checks, deployment/live-demo checks, and weak-project detection.
- GitHub intelligence with repo quality, commit frequency, language diversity, docs/tests/CI/deployment evaluation.
- Resume ATS analysis with keyword coverage, weak verbs, missing impact, formatting issues, and ATS alignment score.
- Roadmap feedback with better learning order and a personalized 90-day learning roadmap.
- Specialization and fit analysis for domain focus and internship fit.
- Dashboard KPIs including Job Readiness, ATS Alignment, GitHub Strength, Market Match, Interview Confidence, and Salary Range.
- Responsive mobile-friendly experience.

## UI and Design Requirements
- Dark theme by default.
- Background: `#0A0A0F`
- Card background: `#11131A`
- Glass overlay: `rgba(255,255,255,0.06)`
- Primary accent: `#5EE9FF`
- Success: `#00E38C`
- Warning: `#FFB020`
- Danger: `#FF5A7A`
- AI highlight: violet
- Primary text: `#F8FAFC`
- Secondary text: `#94A3B8`
- Glassmorphism with blur, transparency, thin borders, and legibility overlays.
- Purposeful motion using Framer Motion and GSAP.
- Gamification using XP bars, badges, streaks, confetti, and level-up moments.

## Navigation and Layout
- Animated left sidebar for:
  - Dashboard
  - Gap Analysis
  - GitHub Intelligence
  - Resume ATS
  - Market Trends
  - 90-Day Roadmap
  - Projects
  - Interview Prep
  - Settings
- Multi-column desktop layout with elevated glass cards and subtle grain/noise texture.
- Mobile bottom navigation with touch-friendly interactions and simplified widgets.

## Major Screens

### Landing Hero
- Full-screen 3D skill constellation graph using Three.js / React Three Fiber.
- Core user skill in center, category-based orbital rings around it.
- Dream job skill placed on outer edge.
- Missing skill paths highlighted in amber/red.
- Floating particles/stars, glowing nodes, pulsing connectors.
- Scroll-triggered transition from hero graph into dashboard view.

### Dashboard Overview
- Six top KPI cards:
  - Job Readiness Score
  - ATS Alignment Score
  - GitHub Strength
  - Market Match %
  - Interview Confidence
  - Salary Range
- Count-up animations on load.
- Hover lift, glow, sparklines, AI explanation tooltips.
- Accessibility option to reduce/disable animations.

### Skill Galaxy Map
- Interactive orbital skill map with categories like Frontend, Backend, Cloud, AI, System Design, Deployment, DSA, Testing, Product.
- Completed skills shown as green stars.
- Missing skills shown as amber/red pulsing nodes.
- Hover-animated prerequisite edges.
- Zoom, pan, and click for side-drawer details, resources, and roadmap fit.

### 90-Day Roadmap
- Curved quest-map timeline with milestone nodes from Day 1 to Day 90.
- Example milestones:
  - Day 1: JavaScript Deep Dive
  - Day 7: Build Weather App
  - Day 14: API + Auth
  - Day 21: Deploy SaaS
  - Day 30: GitHub Polish
  - Day 45: Build AI Project
  - Day 60: System Design Basics
  - Day 90: Apply for Internships
- XP/progress bar, badges, unlock animations, confetti/level-up effects, clickable detail panel.

### GitHub Intelligence
- GitHub data fetched via OAuth or token.
- Data points:
  - public repos
  - commit history
  - languages
  - stars/forks
  - open issues
  - CI presence
  - README quality
  - test presence
  - repo freshness
  - deployment links
- Visuals:
  - contribution heatmap
  - language bubble chart
  - repo radar/bar chart
  - README meter

### Resume ATS Analysis
- Split-screen layout with resume preview on left and AI feedback panel on right.
- Detect:
  - missing keywords
  - weak verbs
  - lack of quantified impact
  - skill mismatch
  - redundant skills
  - formatting issues
- Inline rewrite suggestions, confidence badges, auto-fix option, before/after comparison slider.

### Market Trends
- Trending skills and average salaries by role.
- Used to compute market match score.

### Projects Page
- Analyze project complexity, repo presence, deployment/live-demo coverage, and quality.

### Interview Prep
- Included in sidebar and acceptance criteria, but minimally specified in the PDF.
- Should support interview-readiness display tied to confidence metrics.

### Public/Profile View
- User profile data, saved projects, and preferences are part of the API/data model.
- Recruiter-style public presentation is a logical extension of the dashboard and profile data.

## Data Model
- PostgreSQL via Supabase with Prisma ORM.
- Main entities:
  - User
  - Skill
  - UserSkill
  - SkillDependency
  - Project
  - RoadmapMilestone
  - JobRole
  - Optional: Team, Mentor, Notification

## API Requirements
- Auth endpoints for signup/login.
- `POST /api/uploadResume`
- `GET /api/skills/gaps?userId={id}`
- `GET /api/github/analyze?username={username}`
- `POST /api/roadmap/generate`
- `GET /api/market/trends`
- User profile CRUD endpoints
- JSON responses, validation, loading/error handling via TanStack Query.

## Backend Architecture
- Async pipeline with Redis queues/background jobs.
- Resume parsing + AI-based skill extraction.
- GitHub scan via Octokit with caching.
- Job benchmarking from job-posting data.
- Gap analysis engine for skill gap, project gap, ATS gap, specialization.
- Roadmap generation through LLM.
- Dashboard snapshots/versioning.
- Retries, backoff, rate-limit handling, caching, and fallback logic.
- Use `pgvector` for embeddings and semantic matching.

## Frontend Architecture
- Next.js 15 with TypeScript.
- Zustand for global state.
- TanStack Query for async data.
- Tailwind CSS and/or shadcn/ui.
- `@react-three/fiber` + Drei for 3D graph.
- Recharts or D3 for charts.
- Framer Motion + GSAP ScrollTrigger for animations.
- Protected app routes, public landing/auth routes.

## Mobile Requirements
- Bottom tab navigation.
- One-primary-panel mobile views.
- Swipe interactions where helpful.
- Minimum 44x44 touch targets.
- Cached recent roadmap/analysis for offline or degraded connectivity.

## Testing and Quality
- Jest unit tests.
- React Testing Library integration tests.
- Cypress end-to-end tests.
- ESLint + Prettier.
- Strict TypeScript with minimal `any`.
- Coverage target: over 80%.

## Deployment and Operations
- Vercel or Netlify hosting.
- Supabase for PostgreSQL.
- GitHub Actions for CI/CD.
- Sentry for monitoring.
- Release tags and CHANGELOG.

## Edge Cases
- No GitHub linked.
- Empty resume.
- No skills entered.
- Large input data with progress indicators and retry handling.
- GitHub API rate limits.
- AI failure fallback to keyword matching/default guidance.

## Acceptance Criteria
- All major sections implemented and reachable.
- Personalized analysis works for resume/GitHub/profile data.
- Visual system matches premium dark glassmorphic brief.
- 3D hero graph and animations are smooth.
- Gamification elements work.
- Tech stack matches spec.
- Responsive on desktop and mobile.
- Tests pass and CI/CD works.
- Product should clearly explain the user's shortlisting gaps.

## Alignment With Proposed Image Generation Workflow
- Landing Page Hero: matches the PDF exactly and should emphasize the 3D skill graph, particles, glass cards, and animated scroll transform.
- Dashboard Overview: matches the KPI row, count-up stats, hover lifts, and sparklines.
- Skill Galaxy Map: directly matches the signature gap visualizer.
- 90-Day Roadmap: directly matches the curved timeline, milestones, badges, XP bar, and completion animation.
- GitHub Intelligence: directly matches the heatmap, language bubbles, and repo-quality charts.
- Resume ATS Analysis: directly matches split-screen preview, AI panel, color-coded feedback, and before/after improvements.
- Market Trends: aligns with trending skills, salaries, and market match visualization.
- Projects Page: aligns with project cards, quality scoring, repo/live-demo checks, and project complexity.
- Interview Prep: not deeply detailed in the PDF, but it fits naturally with interview confidence, checklist flows, and simulated Q&A.
- Public Profile: not explicitly named as a page in the PDF, but consistent with user profile, recruiter visibility, and dashboard-summary presentation.

## Recommended Priority Order
- Landing Hero
- Dashboard Overview
- Skill Galaxy Map
- Resume ATS Analysis
- GitHub Intelligence
- 90-Day Roadmap
- Market Trends
- Projects
- Interview Prep
- Public Profile
