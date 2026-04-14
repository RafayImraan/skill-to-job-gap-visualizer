"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  ChevronRight,
  FileText,
  Flame,
  Github,
  Radar,
  Sparkles,
  Target,
  Trophy,
  WandSparkles,
} from "lucide-react";
import { HeroSkillGraph } from "@/components/hero-skill-graph";
import {
  atsFindings,
  brandStory,
  heroStats,
  interviewChecklist,
  kpis,
  marketTrends,
  orbitRings,
  pageIntros,
  profileHighlights,
  projects,
  quickFacts,
  roadmapMilestones,
  sampleResumeBullets,
  settings,
  skillNodes,
} from "@/lib/mock-data";
import {
  createProject,
  deleteProject,
  generateResumeRewrite,
  persistResumeRewrite,
  restoreResumeVersion,
  updateProject as updateProjectEntry,
  updateRoadmapMilestone,
  uploadResume,
  useDashboardQueryClient,
  updateProfile,
  useAuthSession,
  useDashboardOverview,
  useGithubAnalysis,
  useGithubProjectSuggestions,
  useInterviewPrep,
  useMarketTrends,
  useProjectAnalysis,
  useProfileMe,
  useProfileSummary,
  useRoadmap,
  useResumePreview,
  useSettingsData,
  useSkillGaps,
} from "@/lib/api";
import type { RoadmapMilestoneItem } from "@/lib/types";

const GithubRadar = dynamic(() => import("@/components/data-charts").then((mod) => mod.GithubRadar), {
  ssr: false,
  loading: () => <div className="surface panel" style={{ minHeight: 260 }} />,
});

const KpiSparkline = dynamic(() => import("@/components/data-charts").then((mod) => mod.KpiSparkline), {
  ssr: false,
  loading: () => <div style={{ height: 72 }} />,
});

const MarketBarChart = dynamic(() => import("@/components/data-charts").then((mod) => mod.MarketBarChart), {
  ssr: false,
  loading: () => <div className="surface panel" style={{ minHeight: 220 }} />,
});

function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={`surface panel ${className}`}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
    >
      {children}
    </motion.div>
  );
}

function QueryMessage({ message }: { message: string }) {
  return <p className="section-copy">{message}</p>;
}

function getRewriteDiffHints(currentBullet: string, rewrittenBullet: string) {
  const hints: string[] = [];

  if (/responsible for|worked on|helped with|involved in/i.test(currentBullet) && !/responsible for|worked on|helped with|involved in/i.test(rewrittenBullet)) {
    hints.push("Stronger action verb");
  }

  if (!/\d/.test(currentBullet) && /\d/.test(rewrittenBullet)) {
    hints.push("Added measurable outcome");
  }

  if (rewrittenBullet.length > currentBullet.length + 20) {
    hints.push("More context");
  }

  if (hints.length === 0) {
    hints.push("Sharper phrasing");
  }

  return hints;
}

function PageHeader({ page }: { page: keyof typeof pageIntros }) {
  const intro = pageIntros[page];

  return (
    <div className="topbar surface panel">
      <div>
        <div className="eyebrow">
          <Sparkles size={14} />
          AI-guided progress
        </div>
        <h1 className="section-title" style={{ fontSize: "2rem", marginTop: 16 }}>
          {intro.title}
        </h1>
        <p className="section-copy">{intro.copy}</p>
      </div>

      <div className="topbar-actions">
        <div className="pill">Target role: {brandStory.target}</div>
        <div className="pill">Streak: {brandStory.streak}</div>
      </div>
    </div>
  );
}

export function LandingHero() {
  return (
    <div className="page-shell" style={{ padding: "32px 0 64px" }}>
      <section className="surface panel hero-grid" style={{ minHeight: "84vh", borderRadius: "32px" }}>
        <div>
          <div className="eyebrow">
            <Sparkles size={14} />
            Flagship AI-driven student career dashboard
          </div>
          <h1 style={{ fontSize: "clamp(2.8rem, 6vw, 5.4rem)", lineHeight: 0.95, margin: "18px 0 16px" }}>
            See why you are not getting shortlisted.
          </h1>
          <p className="section-copy" style={{ fontSize: "1.05rem", maxWidth: 640 }}>
            Compare your skills, projects, resume, and GitHub presence against real market expectations. Get an
            interactive gap report, premium visuals, and a 90-day roadmap built to raise your odds.
          </p>

          <div className="cta-row" style={{ marginTop: 24 }}>
            <a className="button-primary" href="/auth/sign-in">
              Sign in to continue
            </a>
            <a className="button-secondary" href="#feature-preview">
              Explore the build <ArrowRight size={16} style={{ marginLeft: 8, verticalAlign: "middle" }} />
            </a>
          </div>

          <div className="tag-row" style={{ marginTop: 28 }}>
            {quickFacts.map((fact) => (
              <span key={fact} className="pill">
                {fact}
              </span>
            ))}
          </div>
        </div>

        <div className="surface panel" style={{ minHeight: 520 }}>
          <div className="row-between">
            <div>
              <div className="muted">3D skill graph preview</div>
              <div className="stat-value" style={{ fontSize: "1.9rem", marginTop: 6 }}>
                Skill constellation
              </div>
            </div>
            <Target color="var(--cyan)" />
          </div>

          <HeroSkillGraph />

          <div className="grid-3">
            {heroStats.map((stat) => (
              <div key={stat.label} className="surface panel">
                <div className="muted">{stat.label}</div>
                <div className="stat-value">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="feature-preview" className="grid-3" style={{ marginTop: 24 }}>
        <GlassCard>
          <Github size={20} color="var(--cyan)" />
          <h3 className="section-title" style={{ marginTop: 16 }}>
            GitHub intelligence
          </h3>
          <p className="section-copy">Analyze commit consistency, docs, CI, repo freshness, and deployment proof.</p>
        </GlassCard>
        <GlassCard>
          <FileText size={20} color="var(--amber)" />
          <h3 className="section-title" style={{ marginTop: 16 }}>
            Resume ATS feedback
          </h3>
          <p className="section-copy">Catch missing keywords, weak verbs, impact gaps, and rewrite opportunities.</p>
        </GlassCard>
        <GlassCard>
          <Trophy size={20} color="var(--green)" />
          <h3 className="section-title" style={{ marginTop: 16 }}>
            90-day quest map
          </h3>
          <p className="section-copy">Move through milestones, earn XP, and unlock roadmap wins on a visible timeline.</p>
        </GlassCard>
      </section>
    </div>
  );
}

export function DashboardOverview() {
  const auth = useAuthSession();
  const overview = useDashboardOverview();
  const data = overview.data;

  return (
    <>
      <PageHeader page="dashboard" />
      <section className="grid-3">
        {(data?.kpis ?? kpis).map((kpi) => (
          <GlassCard key={kpi.title}>
            <div className="kpi-header">
              <div className="muted">{kpi.title}</div>
              <div className="pill">{kpi.change}</div>
            </div>
            <div className="stat-value">
              {kpi.value}
              <span style={{ fontSize: "1rem", color: "var(--muted)", marginLeft: 4 }}>{kpi.suffix}</span>
            </div>
            <p className="section-copy">{kpi.insight}</p>
            <KpiSparkline values={kpi.trend} />
          </GlassCard>
        ))}
      </section>

      <section className="grid-2">
        <GlassCard>
          <div className="row-between">
            <div>
              <div className="muted">Career focus</div>
              <div className="stat-value" style={{ fontSize: "2rem" }}>
                {data?.role ?? brandStory.role}
              </div>
            </div>
            <WandSparkles color="var(--violet)" />
          </div>
          <p className="section-copy">{data?.focus ?? brandStory.focus}</p>
          <div className="bar" style={{ marginTop: 18 }}>
            <span style={{ width: `${data?.roadmapProgress ?? 74}%` }} />
          </div>
          <div className="row-between" style={{ marginTop: 10 }}>
            <span className="muted">Roadmap progress</span>
            <span>{data?.roadmapProgress ?? 74}%</span>
          </div>
          <div className="tag-row" style={{ marginTop: 12 }}>
            <span className="pill">{auth.data?.authenticated ? "Authenticated session" : "Sign-in required"}</span>
            <span className="pill">{auth.data?.provider ?? "supabase"}</span>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="row-between">
            <div>
              <div className="muted">Priority next moves</div>
              <h3 className="section-title" style={{ marginTop: 10 }}>
                Close your shortlist blockers
              </h3>
            </div>
            <BadgeCheck color="var(--amber)" />
          </div>
          <div className="checklist">
            {(data?.priorityActions ?? []).length > 0 ? (
              (data?.priorityActions ?? []).map((item) => (
                <div key={item} className="check-item">
                  <span>{item}</span>
                  <ChevronRight size={16} color="var(--muted)" />
                </div>
              ))
            ) : overview.isLoading ? (
              <QueryMessage message="Loading priority actions..." />
            ) : (
              ["Ship one deployed full-stack app", "Add TypeScript + testing proof", "Rewrite 3 resume bullets with quantified impact"].map(
                (item) => (
                  <div key={item} className="check-item">
                    <span>{item}</span>
                    <ChevronRight size={16} color="var(--muted)" />
                  </div>
                ),
              )
            )}
          </div>
        </GlassCard>
      </section>
    </>
  );
}

export function GapAnalysisPage() {
  const skillGaps = useSkillGaps();

  return (
    <>
      <PageHeader page="gap-analysis" />
      <section className="grid-2">
        <GlassCard>
          <div className="row-between">
            <div>
              <div className="muted">Interactive galaxy</div>
              <h2 className="section-title" style={{ marginTop: 10 }}>
                Skill orbit map
              </h2>
            </div>
            <Radar color="var(--cyan)" />
          </div>
          <div className="galaxy">
            {orbitRings.map((size) => (
              <div key={size} className="orbit-ring" style={{ width: size, height: size }} />
            ))}
            {skillNodes.map((node) => (
              <motion.div
                key={node.label}
                className={`skill-node ${node.state}`}
                style={{ left: `${node.x}%`, top: `${node.y}%`, transform: "translate(-50%, -50%)" }}
                animate={node.state === "missing" ? { scale: [1, 1.06, 1] } : { y: [0, -5, 0] }}
                transition={{ duration: 3.5, repeat: Infinity }}
              >
                {node.label}
              </motion.div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <div className="muted">Gap explanation side panel</div>
          <h2 className="section-title" style={{ marginTop: 10 }}>
            Missing path details
          </h2>
          <div className="feedback-list">
            {skillGaps.isError ? <QueryMessage message="Could not load skill-gap insights right now." /> : null}
            {(skillGaps.data?.missingSkills ?? ["TypeScript", "Testing", "Docker + AWS"]).map((skill) => (
              <div key={skill} className="feedback-item">
                <strong>{skill}</strong>
                <p className="section-copy">
                  {skill === "TypeScript"
                    ? "Required by matched frontend roles. Add strict typing and one deployed proof piece."
                    : skill === "Testing"
                      ? "Visible test coverage is lowering GitHub credibility. Start with component and API integration flows."
                      : "This missing capability is limiting progression into stronger full-stack and platform-fit roles."}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>
    </>
  );
}

export function RoadmapPage() {
  const roadmap = useRoadmap();
  const roadmapData = roadmap.data;
  const roadmapItems = (roadmapData?.milestones ?? roadmapMilestones) as RoadmapMilestoneItem[];
  const milestones: RoadmapMilestoneItem[] = roadmapItems.map((item) => ({
    ...item,
    unlocked: item.unlocked ?? true,
  }));
  const queryClient = useDashboardQueryClient();
  const [roadmapActionState, setRoadmapActionState] = useState<"idle" | "saving" | "error">("idle");
  const [roadmapActionError, setRoadmapActionError] = useState("");

  async function handleMilestoneToggle(dayNumber: number, isCompleted: boolean) {
    try {
      setRoadmapActionState("saving");
      setRoadmapActionError("");
      await updateRoadmapMilestone({ dayNumber, isCompleted });
      await Promise.all([
        roadmap.refetch(),
        queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] }),
        queryClient.invalidateQueries({ queryKey: ["interview-prep"] }),
        queryClient.invalidateQueries({ queryKey: ["profile-summary"] }),
      ]);
      setRoadmapActionState("idle");
    } catch (error) {
      setRoadmapActionState("error");
      setRoadmapActionError(error instanceof Error ? error.message : "Could not update roadmap milestone.");
    }
  }

  return (
    <>
      <PageHeader page="roadmap" />
      <section className="grid-2">
        <GlassCard>
          <div className="row-between">
            <div>
              <div className="muted">Quest progress</div>
              <div className="stat-value" style={{ fontSize: "2rem" }}>
                {roadmapData?.totalXp ?? 1280} XP
              </div>
            </div>
            <Trophy color="var(--violet)" />
          </div>
          <div className="bar">
            <span style={{ width: `${roadmapData?.progress ?? 37}%` }} />
          </div>
        </GlassCard>

        <GlassCard>
          <div className="row-between">
            <div>
              <div className="muted">Current objective</div>
              <h3 className="section-title" style={{ marginTop: 10 }}>
                {roadmapData?.currentFocus ?? "Deploy SaaS"}
              </h3>
            </div>
            <Flame color="var(--green)" />
          </div>
          <p className="section-copy">Connect env vars, ship analytics, verify mobile polish, and document the architecture decisions.</p>
          <div className="tag-row" style={{ marginTop: 14 }}>
            <span className="pill">Provider: {roadmapData?.provider ?? "fallback"}</span>
          </div>
        </GlassCard>
      </section>

      <section className="grid-2" style={{ marginTop: 24 }}>
        <GlassCard>
          <div className="muted">Roadmap brief</div>
          <p className="section-copy" style={{ marginTop: 12 }}>
            {roadmapData?.planSummary ?? "This roadmap prioritizes shipping proof, resume alignment, and stronger public engineering signals before application season."}
          </p>
        </GlassCard>
        <GlassCard>
          <div className="muted">Coach tip</div>
          <p className="section-copy" style={{ marginTop: 12 }}>
            {roadmapData?.coachTip ?? "Treat each milestone as application evidence, not just study time."}
          </p>
          <div className="tag-row" style={{ marginTop: 14 }}>
            <span className="pill">{roadmapActionState === "saving" ? "Updating progress..." : "Progress synced"}</span>
          </div>
        </GlassCard>
      </section>
      {roadmapActionError ? <p style={{ color: "var(--red)", marginTop: 16 }}>{roadmapActionError}</p> : null}

      <GlassCard>
        <div className="roadmap-line">
          {milestones.map((item) => (
            <div key={item.day} className="roadmap-step">
              <div className="roadmap-step-badge">{item.day}</div>
              <div className="surface panel" style={{ padding: 18 }}>
                <div className="row-between">
                  <strong>{item.title}</strong>
                  <span className="pill">{item.done ? "Completed" : `${item.xp} XP`}</span>
                </div>
                  <p className="section-copy" style={{ marginTop: 10 }}>
                    {item.description}
                  </p>
                  <div className="cta-row" style={{ marginTop: 14 }}>
                    <button
                      className="button-primary"
                      type="button"
                      disabled={roadmapActionState === "saving" || item.unlocked === false}
                      onClick={() => handleMilestoneToggle(item.day, !item.done)}
                    >
                      {item.done ? "Mark Incomplete" : item.unlocked === false ? "Locked" : "Mark Complete"}
                    </button>
                    <span className="pill">{item.unlocked === false ? "Locked" : item.done ? "Completed" : "Available"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
      </GlassCard>
    </>
  );
}

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
          docs={githubData?.readmeScore ?? 78}
          ci={githubData?.ciCoverage ?? 44}
          structure={
            repos.length > 0
              ? Math.round(repos.reduce((sum, repo) => sum + repo.structure, 0) / repos.length)
              : 74
          }
          deployment={githubData?.deploymentCoverage ?? 67}
        />
      </GlassCard>

      <GlassCard>
        {github.isError ? <QueryMessage message="GitHub analysis is temporarily unavailable." /> : null}
        {!githubData?.connected ? (
          <QueryMessage message="Live GitHub insights are using fallback data. Add a valid GitHub username in your profile and keep the server token configured." />
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
          <span className="pill">Commits: {githubData?.commitCount ?? 246}</span>
          <span className="pill">Stars: {githubData?.stars ?? 29}</span>
          <span className="pill">README score: {githubData?.readmeScore ?? 78}</span>
          <span className="pill">Deployment: {githubData?.deploymentCoverage ?? 67}%</span>
        </div>
      </GlassCard>
    </>
  );
}

export function ResumePage() {
  const resume = useResumePreview();
  const profileMe = useProfileMe();
  const resumeData = resume.data;
  const [resumeTextInput, setResumeTextInput] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "error" | "success">("idle");
  const [uploadError, setUploadError] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [rewriteState, setRewriteState] = useState<"idle" | "generating" | "error" | "success">("idle");
  const [rewriteError, setRewriteError] = useState("");
  const [rewriteResult, setRewriteResult] = useState<Awaited<ReturnType<typeof generateResumeRewrite>> | null>(null);
  const [rewriteSaveState, setRewriteSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [rewriteSaveError, setRewriteSaveError] = useState("");
  const [restoreState, setRestoreState] = useState<"idle" | "restoring" | "error" | "success">("idle");
  const [restoreError, setRestoreError] = useState("");

  useEffect(() => {
    if (!targetRole && profileMe.data?.role) {
      setTargetRole(profileMe.data.role);
    }
  }, [profileMe.data?.role, targetRole]);

  async function handleResumeUpload() {
    try {
      setUploadState("uploading");
      setUploadError("");
      await uploadResume({
        file: resumeFile ?? undefined,
        text: resumeTextInput.trim() || undefined,
      });
      await resume.refetch();
      setResumeTextInput("");
      setResumeFile(null);
      setUploadState("success");
    } catch (error) {
      setUploadState("error");
      setUploadError(error instanceof Error ? error.message : "Resume upload failed.");
    }
  }

  async function handleGenerateRewrite() {
    try {
      setRewriteState("generating");
      setRewriteError("");
      const response = await generateResumeRewrite({
        targetRole: targetRole.trim() || undefined,
        jobDescription: jobDescription.trim() || undefined,
      });
      setRewriteResult(response);
      setRewriteState("success");
    } catch (error) {
      setRewriteState("error");
      setRewriteError(error instanceof Error ? error.message : "Rewrite generation failed.");
    }
  }

  async function handlePersistRewrite(apply: boolean) {
    if (!rewriteResult) {
      return;
    }

    try {
      setRewriteSaveState("saving");
      setRewriteSaveError("");
      await persistResumeRewrite({
        rewriteText: rewriteResult.improvedBullets.join("\n"),
        label: apply ? "Applied AI rewrite" : "Saved AI rewrite draft",
        apply,
      });
      await resume.refetch();
      if (apply) {
        setRewriteResult(null);
      }
      setRewriteSaveState("saved");
    } catch (error) {
      setRewriteSaveState("error");
      setRewriteSaveError(error instanceof Error ? error.message : "Could not save rewrite.");
    }
  }

  async function handleRestoreVersion(snapshotId: string) {
    try {
      setRestoreState("restoring");
      setRestoreError("");
      await restoreResumeVersion(snapshotId);
      await resume.refetch();
      setRewriteResult(null);
      setRestoreState("success");
    } catch (error) {
      setRestoreState("error");
      setRestoreError(error instanceof Error ? error.message : "Could not restore resume version.");
    }
  }

  return (
    <>
      <PageHeader page="resume-ats" />
      <section className="resume-panel">
        <GlassCard>
          <div className="muted">Resume preview</div>
          <div className="feedback-list" style={{ marginTop: 16 }}>
            <label className="feedback-item">
              <div className="muted">Upload PDF or text file</div>
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={(event) => setResumeFile(event.target.files?.[0] ?? null)}
                style={{ marginTop: 10, color: "var(--text)" }}
              />
            </label>
            <label className="feedback-item">
              <div className="muted">Or paste resume text</div>
              <textarea
                value={resumeTextInput}
                onChange={(event) => setResumeTextInput(event.target.value)}
                style={{
                  width: "100%",
                  minHeight: 120,
                  marginTop: 10,
                  background: "transparent",
                  border: 0,
                  color: "var(--text)",
                  resize: "vertical",
                }}
              />
            </label>
            <div className="cta-row">
              <button className="button-primary" onClick={handleResumeUpload} disabled={uploadState === "uploading"}>
                {uploadState === "uploading" ? "Uploading..." : "Upload Resume"}
              </button>
              <span className="pill">
                {uploadState === "success"
                  ? "Resume saved"
                  : uploadState === "error"
                    ? "Upload failed"
                    : resumeFile
                      ? resumeFile.name
                      : "Awaiting upload"}
              </span>
            </div>
            {uploadError ? <p style={{ color: "var(--red)", margin: 0 }}>{uploadError}</p> : null}
          </div>
          <div className="pdf-preview" style={{ marginTop: 16 }}>
            <strong>Software Engineer Intern Resume.pdf</strong>
            <div className="feedback-list" style={{ marginTop: 16 }}>
              {(resumeData?.extractedText
                ? resumeData.extractedText.split(". ").filter(Boolean).map((item) => `${item.trim().replace(/\.$/, "")}.`)
                : sampleResumeBullets
              ).map((bullet) => (
                <div key={bullet} className="feedback-item">
                  {bullet}
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

          <GlassCard>
            <div className="row-between">
              <div>
                <div className="muted">ATS insights</div>
              <h2 className="section-title" style={{ marginTop: 10 }}>
                AI feedback panel
              </h2>
            </div>
            <FileText color="var(--red)" />
          </div>
          <div className="feedback-list">
            {resume.isLoading ? <QueryMessage message="Scanning resume content and extracting ATS signals..." /> : null}
            {(resumeData?.findings ?? atsFindings).map((finding) => (
              <div key={finding.title} className="feedback-item">
                <div className="row-between">
                  <strong>{finding.title}</strong>
                  <span className="pill">{finding.confidence}</span>
                </div>
                <p className="section-copy" style={{ marginTop: 8 }}>
                  {finding.detail}
                </p>
              </div>
            ))}
            <div className="feedback-item">
              <div className="row-between">
                <strong>Suggested skills from parser</strong>
                <span className="pill">ATS {resumeData?.atsScore ?? 63}</span>
              </div>
              <div className="tag-row" style={{ marginTop: 10 }}>
                {(resumeData?.suggestedSkills ?? []).map((skill) => (
                  <span key={skill} className="pill">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
              <div className="feedback-item">
                <div className="row-between">
                  <strong>Keyword coverage</strong>
                  <span className="pill">{resumeData?.keywordCoverage ?? 63}%</span>
                </div>
              <div className="tag-row" style={{ marginTop: 10 }}>
                {(resumeData?.missingKeywords ?? []).map((keyword) => (
                  <span key={keyword} className="pill">
                    Missing: {keyword}
                  </span>
                ))}
                </div>
              </div>
              <div className="feedback-item">
                <div className="row-between">
                  <strong>Version delta</strong>
                  <span className="pill">
                    {resumeData?.comparison.delta && resumeData.comparison.delta > 0
                      ? `+${resumeData.comparison.delta}`
                      : resumeData?.comparison.delta ?? 0} ATS
                  </span>
                </div>
                <p className="section-copy" style={{ marginTop: 8 }}>
                  Previous score: {resumeData?.comparison.previousAtsScore ?? "n/a"} | Current score:{" "}
                  {resumeData?.comparison.currentAtsScore ?? resumeData?.atsScore ?? 63}
                </p>
              </div>
            </div>
          </GlassCard>
        </section>

        <div style={{ marginTop: 24 }}>
        <GlassCard>
          <div className="row-between">
            <div>
              <div className="muted">Resume version history</div>
              <h2 className="section-title" style={{ marginTop: 10 }}>
                Before / after proof
              </h2>
            </div>
            <FileText color="var(--amber)" />
          </div>
          <div className="feedback-list" style={{ marginTop: 16 }}>
            {(resumeData?.history ?? []).map((version) => (
              <div key={version.id} className="feedback-item">
                <div className="row-between">
                  <strong>{version.label}</strong>
                  <span className="pill">{version.isCurrent ? `Current · ATS ${version.atsScore}` : `ATS ${version.atsScore}`}</span>
                </div>
                <p className="section-copy" style={{ marginTop: 8 }}>
                  {new Date(version.createdAt).toLocaleString()} | Keyword coverage {version.keywordCoverage}%
                </p>
                <p className="section-copy" style={{ marginTop: 8 }}>{version.excerpt}</p>
                <div className="cta-row" style={{ marginTop: 12 }}>
                  <button
                    className="button-secondary"
                    type="button"
                    disabled={restoreState === "restoring" || version.isCurrent}
                    onClick={() => handleRestoreVersion(version.id)}
                  >
                    {version.isCurrent ? "Current Version" : "Restore This Version"}
                  </button>
                </div>
              </div>
            ))}
            {(resumeData?.history ?? []).length === 0 ? (
              <QueryMessage message="Upload a resume to start tracking version history and ATS score improvements." />
            ) : null}
            {restoreError ? <p style={{ color: "var(--red)", margin: 0 }}>{restoreError}</p> : null}
          </div>
        </GlassCard>
        </div>

        <section className="grid-2" style={{ marginTop: 24 }}>
        <GlassCard>
          <div className="row-between">
            <div>
              <div className="muted">Job-targeted rewrite studio</div>
              <h2 className="section-title" style={{ marginTop: 10 }}>
                Generate a sharper resume version
              </h2>
            </div>
            <WandSparkles color="var(--violet)" />
          </div>

          <div className="feedback-list" style={{ marginTop: 16 }}>
            <label className="feedback-item">
              <div className="muted">Target role</div>
              <input
                value={targetRole}
                onChange={(event) => setTargetRole(event.target.value)}
                placeholder="Frontend Engineer"
                style={{ width: "100%", marginTop: 10, background: "transparent", border: 0, color: "var(--text)" }}
              />
            </label>

            <label className="feedback-item">
              <div className="muted">Optional job description</div>
              <textarea
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                placeholder="Paste a job post to tune the rewrite and keyword targeting."
                style={{
                  width: "100%",
                  minHeight: 180,
                  marginTop: 10,
                  background: "transparent",
                  border: 0,
                  color: "var(--text)",
                  resize: "vertical",
                }}
              />
            </label>

            <div className="cta-row">
              <button className="button-primary" onClick={handleGenerateRewrite} disabled={rewriteState === "generating"}>
                {rewriteState === "generating" ? "Generating..." : "Generate Rewrite"}
              </button>
              <span className="pill">
                {rewriteResult ? `Mode: ${rewriteResult.mode}` : profileMe.data?.resumeText ? "Ready" : "Upload resume first"}
              </span>
            </div>

            {rewriteError ? <p style={{ color: "var(--red)", margin: 0 }}>{rewriteError}</p> : null}
            <p className="section-copy" style={{ margin: 0 }}>
              Uses your stored resume text and falls back to heuristic rewriting if the AI provider is unavailable.
            </p>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="row-between">
            <div>
              <div className="muted">Rewrite output</div>
              <h2 className="section-title" style={{ marginTop: 10 }}>
                Match summary and upgraded bullets
              </h2>
            </div>
            <Target color="var(--green)" />
          </div>

          {rewriteState === "generating" ? <QueryMessage message="Generating recruiter-ready bullets and role match guidance..." /> : null}

          {rewriteResult ? (
            <div className="feedback-list" style={{ marginTop: 16 }}>
              <div className="feedback-item">
                <div className="row-between">
                  <strong>Current vs rewritten</strong>
                  <span className="pill">{rewriteSaveState === "saving" ? "Saving..." : rewriteSaveState === "saved" ? "Saved" : "Preview"}</span>
                </div>
                <div className="grid-2" style={{ marginTop: 12 }}>
                  <div className="feedback-item">
                    <div className="muted">Current</div>
                    <div className="feedback-list" style={{ marginTop: 10 }}>
                      {(resumeData?.extractedText
                        ? resumeData.extractedText.split(". ").filter(Boolean).slice(0, rewriteResult.improvedBullets.length)
                        : sampleResumeBullets
                      ).map((bullet, index) => (
                        <div key={`current-${bullet}`} className="feedback-item">
                          {bullet.trim().replace(/\.$/, "")}.
                          <div className="tag-row" style={{ marginTop: 8 }}>
                            {getRewriteDiffHints(bullet, rewriteResult.improvedBullets[index] ?? "").map((hint) => (
                              <span key={`${bullet}-${hint}`} className="pill">
                                {hint}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="feedback-item">
                    <div className="muted">Rewritten</div>
                    <div className="feedback-list" style={{ marginTop: 10 }}>
                      {rewriteResult.improvedBullets.map((bullet) => (
                        <div key={`rewrite-${bullet}`} className="feedback-item">
                          {bullet}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="feedback-item">
                <div className="row-between">
                  <strong>{rewriteResult.targetRole}</strong>
                  <span className="pill">Match {rewriteResult.matchScore}%</span>
                </div>
                <p className="section-copy" style={{ marginTop: 8 }}>
                  {rewriteResult.summary}
                </p>
              </div>

              <div className="feedback-item">
                <div className="row-between">
                  <strong>Improved bullets</strong>
                  <span className="pill">{rewriteResult.improvedBullets.length} bullets</span>
                </div>
                <div className="feedback-list" style={{ marginTop: 12 }}>
                  {rewriteResult.improvedBullets.map((bullet) => (
                    <div key={bullet} className="feedback-item">
                      {bullet}
                    </div>
                  ))}
                </div>
              </div>

              <div className="feedback-item">
                <strong>Recommended keywords</strong>
                <div className="tag-row" style={{ marginTop: 10 }}>
                  {rewriteResult.recommendedKeywords.map((keyword) => (
                    <span key={keyword} className="pill">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div className="feedback-item">
                <strong>Strengths already visible</strong>
                <div className="tag-row" style={{ marginTop: 10 }}>
                  {rewriteResult.strengths.map((strength) => (
                    <span key={strength} className="pill">
                      {strength}
                    </span>
                  ))}
                </div>
              </div>

              <div className="feedback-item">
                <strong>Still missing</strong>
                <div className="tag-row" style={{ marginTop: 10 }}>
                  {rewriteResult.missingKeywords.map((keyword) => (
                    <span key={keyword} className="pill">
                      Missing: {keyword}
                    </span>
                  ))}
                </div>
              </div>
              <div className="cta-row">
                <button className="button-primary" type="button" onClick={() => handlePersistRewrite(true)}>
                  Apply As Current Resume
                </button>
                <button className="button-secondary" type="button" onClick={() => handlePersistRewrite(false)}>
                  Save As Version
                </button>
              </div>
              {rewriteSaveError ? <p style={{ color: "var(--red)", margin: 0 }}>{rewriteSaveError}</p> : null}
            </div>
          ) : (
            <QueryMessage message="Generate a rewrite to see role match scoring, improved bullets, and keyword guidance here." />
          )}
        </GlassCard>
      </section>
    </>
  );
}

export function MarketPage() {
  const trends = useMarketTrends();
  const trendRoles =
    trends.data?.roles ??
    marketTrends.map((role) => ({
      ...role,
      missingSkills: [],
      rationale: "Role-fit rationale is based on your current portfolio and benchmarked skill coverage.",
    }));

  return (
    <>
      <PageHeader page="market-trends" />
      <GlassCard>
        <MarketBarChart roles={trendRoles.map((role) => ({ role: role.role, match: role.match ?? role.demand }))} />
        <div className="chart-bars">
          {trendRoles.map((role) => (
            <div key={role.role} className="chart-row">
              <strong>{role.role}</strong>
              <div className="bar">
                <span style={{ width: `${role.match ?? role.demand}%` }} />
              </div>
              <span>{role.match ?? role.demand}%</span>
            </div>
          ))}
        </div>
        <div className="feedback-list" style={{ marginTop: 20 }}>
          {trendRoles.map((role) => (
            <div key={`${role.role}-details`} className="feedback-item">
              <div className="row-between">
                <strong>{role.role}</strong>
                <span className="pill">{role.salary}</span>
              </div>
              <p className="section-copy" style={{ marginTop: 8 }}>
                {role.rationale ?? "Role-fit rationale is based on your current portfolio and benchmarked skill coverage."}
              </p>
              <div className="tag-row" style={{ marginTop: 10 }}>
                {(role.missingSkills ?? []).map((skill: string) => (
                  <span key={`${role.role}-${skill}`} className="pill">
                    Gap: {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </>
  );
}

export function ProjectsPage() {
  const projectAnalysis = useProjectAnalysis();
  const githubSuggestions = useGithubProjectSuggestions();
  const projectData = projectAnalysis.data;
  const [formState, setFormState] = useState({
    projectId: "",
    title: "",
    description: "",
    complexityLevel: "6",
    repoUrl: "",
    liveUrl: "",
    readmeScore: "70",
  });
  const [projectActionState, setProjectActionState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [projectActionError, setProjectActionError] = useState("");

  function resetProjectForm() {
    setFormState({
      projectId: "",
      title: "",
      description: "",
      complexityLevel: "6",
      repoUrl: "",
      liveUrl: "",
      readmeScore: "70",
    });
  }

  async function handleProjectSave() {
    try {
      setProjectActionState("saving");
      setProjectActionError("");
      const payload = {
        title: formState.title,
        description: formState.description,
        complexityLevel: Number(formState.complexityLevel),
        repoUrl: formState.repoUrl,
        liveUrl: formState.liveUrl,
        readmeScore: Number(formState.readmeScore),
      };

      if (formState.projectId) {
        await updateProjectEntry(formState.projectId, payload);
      } else {
        await createProject(payload);
      }

      await projectAnalysis.refetch();
      resetProjectForm();
      setProjectActionState("saved");
    } catch (error) {
      setProjectActionState("error");
      setProjectActionError(error instanceof Error ? error.message : "Could not save project.");
    }
  }

  async function handleProjectDelete(projectId: string) {
    try {
      setProjectActionState("saving");
      setProjectActionError("");
      await deleteProject(projectId);
      await projectAnalysis.refetch();
      if (formState.projectId === projectId) {
        resetProjectForm();
      }
      setProjectActionState("saved");
    } catch (error) {
      setProjectActionState("error");
      setProjectActionError(error instanceof Error ? error.message : "Could not delete project.");
    }
  }

  return (
    <>
      <PageHeader page="projects" />
      <section className="grid-2">
        <GlassCard>
          <div className="muted">Portfolio signal score</div>
          <div className="stat-value" style={{ fontSize: "2.2rem", marginTop: 12 }}>
            {projectData?.overallScore ?? 72}%
          </div>
          <div className="bar">
            <span style={{ width: `${projectData?.overallScore ?? 72}%` }} />
          </div>
          <p className="section-copy" style={{ marginTop: 14 }}>
            {projectData?.strongestSignal ?? "Two projects already show deployment proof and mid-to-high complexity."}
          </p>
          <div className="feedback-item" style={{ marginTop: 16 }}>
            <strong>Best next upgrade</strong>
            <p className="section-copy" style={{ marginTop: 8 }}>
              {projectData?.nextUpgrade ?? "Add stronger README depth, test evidence, and measurable project outcomes to your weakest project."}
            </p>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="muted">Recruiter scoring rubric</div>
          <div className="checklist" style={{ marginTop: 16 }}>
            {[
              "Complexity and technical depth",
              "Deployment proof and public demo access",
              "README and architecture storytelling",
              "CI, test, and code quality evidence",
              "Freshness and public traction",
            ].map((item) => (
              <div key={item} className="check-item">
                <span>{item}</span>
                <span className="pill">Tracked</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>

      <div style={{ marginTop: 24 }}>
      <GlassCard>
        <div className="row-between">
          <div>
            <h2 className="section-title">Manage Projects</h2>
            <p className="section-copy">Add or update the projects that power your recruiter-facing analysis.</p>
          </div>
          <span className="pill">
            {projectActionState === "saving"
              ? "Saving..."
              : projectActionState === "saved"
                ? "Saved"
                : projectActionState === "error"
                  ? "Action failed"
                  : formState.projectId
                    ? "Editing"
                    : "New project"}
          </span>
        </div>

        <div className="grid-2" style={{ marginTop: 20 }}>
          <label className="feedback-item">
            <div className="muted">Project title</div>
            <input
              value={formState.title}
              onChange={(event) => setFormState((state) => ({ ...state, title: event.target.value }))}
              style={{ width: "100%", marginTop: 10, background: "transparent", border: 0, color: "var(--text)" }}
            />
          </label>
          <label className="feedback-item">
            <div className="muted">Complexity (1-10)</div>
            <input
              type="number"
              min={1}
              max={10}
              value={formState.complexityLevel}
              onChange={(event) => setFormState((state) => ({ ...state, complexityLevel: event.target.value }))}
              style={{ width: "100%", marginTop: 10, background: "transparent", border: 0, color: "var(--text)" }}
            />
          </label>
          <label className="feedback-item">
            <div className="muted">Repository URL</div>
            <input
              value={formState.repoUrl}
              onChange={(event) => setFormState((state) => ({ ...state, repoUrl: event.target.value }))}
              style={{ width: "100%", marginTop: 10, background: "transparent", border: 0, color: "var(--text)" }}
            />
          </label>
          <label className="feedback-item">
            <div className="muted">Live URL</div>
            <input
              value={formState.liveUrl}
              onChange={(event) => setFormState((state) => ({ ...state, liveUrl: event.target.value }))}
              style={{ width: "100%", marginTop: 10, background: "transparent", border: 0, color: "var(--text)" }}
            />
          </label>
          <label className="feedback-item">
            <div className="muted">README score (0-100)</div>
            <input
              type="number"
              min={0}
              max={100}
              value={formState.readmeScore}
              onChange={(event) => setFormState((state) => ({ ...state, readmeScore: event.target.value }))}
              style={{ width: "100%", marginTop: 10, background: "transparent", border: 0, color: "var(--text)" }}
            />
          </label>
        </div>

        <label className="feedback-item" style={{ display: "block", marginTop: 20 }}>
          <div className="muted">Description</div>
          <textarea
            value={formState.description}
            onChange={(event) => setFormState((state) => ({ ...state, description: event.target.value }))}
            style={{
              width: "100%",
              minHeight: 120,
              marginTop: 10,
              background: "transparent",
              border: 0,
              color: "var(--text)",
              resize: "vertical",
            }}
          />
        </label>

        <div className="cta-row" style={{ marginTop: 20 }}>
          <button className="button-primary" onClick={handleProjectSave}>
            {formState.projectId ? "Update Project" : "Add Project"}
          </button>
          <button className="button-secondary" onClick={resetProjectForm} type="button">
            Clear Form
          </button>
        </div>
        {projectActionError ? <p style={{ color: "var(--red)", marginTop: 12 }}>{projectActionError}</p> : null}
        </GlassCard>
      </div>

      <div style={{ marginTop: 24 }}>
      <GlassCard>
        <div className="row-between">
          <div>
            <h2 className="section-title">Import From GitHub</h2>
            <p className="section-copy">Use recent repositories as a starting point for project entries.</p>
          </div>
          <span className="pill">
            {githubSuggestions.isLoading ? "Loading repos..." : `${githubSuggestions.data?.length ?? 0} suggestions`}
          </span>
        </div>

        <div className="feedback-list" style={{ marginTop: 20 }}>
          {(githubSuggestions.data ?? []).length > 0 ? (
            (githubSuggestions.data ?? []).map((repo) => (
              <div key={repo.repoUrl} className="feedback-item">
                <div className="row-between">
                  <strong>{repo.name}</strong>
                  <span className="pill">{repo.freshness}</span>
                </div>
                <p className="section-copy" style={{ marginTop: 8 }}>
                  {repo.description}
                </p>
                <div className="tag-row" style={{ marginTop: 10 }}>
                  <span className="pill">Complexity {repo.complexityLevel}/10</span>
                  <span className="pill">README {repo.readmeScore}</span>
                  <span className="pill">Stars {repo.stars}</span>
                  <span className="pill">{repo.liveUrl ? "Live URL found" : "No homepage"}</span>
                </div>
                <div className="cta-row" style={{ marginTop: 14 }}>
                  <button
                    className="button-secondary"
                    type="button"
                    onClick={() =>
                      setFormState({
                        projectId: "",
                        title: repo.name,
                        description: repo.description,
                        complexityLevel: String(repo.complexityLevel),
                        repoUrl: repo.repoUrl,
                        liveUrl: repo.liveUrl,
                        readmeScore: String(repo.readmeScore),
                      })
                    }
                  >
                    Use In Form
                  </button>
                </div>
              </div>
            ))
          ) : (
            <QueryMessage message="Add your GitHub username in the profile page and keep the server GitHub token configured to import repo suggestions here." />
          )}
        </div>
      </GlassCard>
      </div>

      <section className="grid-3" style={{ marginTop: 24 }}>
        {(projectData?.projects ??
          projects.map((project, index) => ({
            id: `mock-${index}`,
            title: project.title,
            summary: project.summary,
            complexity: project.complexity,
            recruiterScore: 68 + index * 6,
            deploymentStatus: project.deployment,
            docsScore: 70,
            qualitySignal: "Fallback project insight while live analysis loads.",
            freshness: "recent",
            recommendations: ["Add clearer outcomes and deployment proof in the README."],
            liveUrl: null,
            repoUrl: null,
            stars: 0,
          }))).map((project) => (
          <GlassCard key={project.id}>
            <div className="row-between">
              <strong>{project.title}</strong>
              <span className="pill">Score {project.recruiterScore}</span>
            </div>
            <p className="section-copy">{project.summary}</p>
            <div className="tag-row" style={{ marginTop: 14 }}>
              <span className="pill">Complexity {project.complexity}/10</span>
              <span className="pill">{project.deploymentStatus}</span>
              <span className="pill">Docs {project.docsScore}</span>
              <span className="pill">{project.freshness}</span>
              <span className="pill">Stars {project.stars}</span>
            </div>
            <p className="section-copy" style={{ marginTop: 14 }}>
              {project.qualitySignal}
            </p>
            <div className="feedback-list" style={{ marginTop: 16 }}>
              {project.recommendations.map((recommendation) => (
                <div key={recommendation} className="feedback-item">
                  {recommendation}
                </div>
              ))}
            </div>
            <div className="row-between" style={{ marginTop: 18 }}>
              <span>{project.liveUrl ? "Live demo available" : project.repoUrl ? "Repo linked" : "Needs public proof"}</span>
              <Briefcase size={16} color="var(--muted)" />
            </div>
            <div className="cta-row" style={{ marginTop: 16 }}>
              <button
                className="button-secondary"
                type="button"
                onClick={() =>
                  setFormState({
                    projectId: project.id,
                    title: project.title,
                    description: project.summary,
                    complexityLevel: String(project.complexity),
                    repoUrl: project.repoUrl ?? "",
                    liveUrl: project.liveUrl ?? "",
                    readmeScore: String(project.docsScore),
                  })
                }
              >
                Edit
              </button>
              <button className="button-secondary" type="button" onClick={() => handleProjectDelete(project.id)}>
                Delete
              </button>
            </div>
          </GlassCard>
        ))}
      </section>
    </>
  );
}

export function InterviewPage() {
  const interview = useInterviewPrep();
  const interviewData = interview.data;

  return (
    <>
      <PageHeader page="interview-prep" />
      <section className="grid-2">
        <GlassCard>
          <div className="muted">Confidence meter</div>
          <div className="stat-value" style={{ fontSize: "2.2rem", marginTop: 12 }}>
            {interviewData?.confidenceScore ?? 69}%
          </div>
            <div className="bar">
              <span style={{ width: `${interviewData?.confidenceScore ?? 69}%` }} />
            </div>
            <div className="tag-row" style={{ marginTop: 14 }}>
              {(interviewData?.focusAreas ?? ["System design basics", "Debugging walkthroughs"]).map((area) => (
                <span key={area} className="pill">
                  {area}
                </span>
              ))}
            </div>
        </GlassCard>

          <GlassCard>
            <div className="muted">Simulated Q&A card</div>
            <h3 className="section-title" style={{ marginTop: 10 }}>
              {interviewData?.spotlightQuestion.question ?? "Tell me about a time you improved a product under pressure."}
            </h3>
            <p className="section-copy">
              {interviewData?.spotlightQuestion.guidance ??
                "Anchor your answer in a measurable problem, your tradeoff reasoning, and a quantifiable outcome."}
            </p>
            <div className="tag-row" style={{ marginTop: 14 }}>
              <span className="pill">Provider: {interviewData?.provider ?? "fallback"}</span>
            </div>
          </GlassCard>
        </section>

        <section className="grid-2">
        <GlassCard>
          {interview.isLoading ? <QueryMessage message="Building your interview prep stack from current dashboard signals..." /> : null}
          <div className="checklist">
            {(interviewData?.checklist ?? interviewChecklist).map((item) => (
              <div key={item.label} className="check-item">
                <span>{item.label}</span>
                <span className="pill">{item.status}</span>
              </div>
            ))}
          </div>
        </GlassCard>

          <GlassCard>
            <div className="muted">Technical prompts to rehearse</div>
            <div className="feedback-list" style={{ marginTop: 16 }}>
              {(
                interviewData?.technicalQuestions ?? [
                  "How would you debug a slow React dashboard rendering multiple charts?",
                  "When would you choose server components versus client components in Next.js?",
                  "How would you introduce testing into a project that currently has none?",
                ]
              ).map((question) => (
                <div key={question} className="feedback-item">
                  {question}
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="muted">Answer framework</div>
            <div className="tag-row" style={{ marginTop: 16 }}>
              {(interviewData?.answerFramework ?? ["Situation", "Task", "Action", "Result"]).map((step) => (
                <span key={step} className="pill">
                  {step}
                </span>
              ))}
            </div>
            <div className="feedback-item" style={{ marginTop: 18 }}>
              <strong>Sample answer</strong>
              <p className="section-copy" style={{ marginTop: 8 }}>
                {interviewData?.sampleAnswer ??
                  "Start with the problem and constraint, explain the tradeoff you chose, then finish with a measurable result and what you learned."}
              </p>
            </div>
          </GlassCard>
        </section>
        </>
      );
    }

export function ProfilePage() {
  const profile = useProfileSummary();
  const profileData = profile.data;
  const profileMe = useProfileMe();
  const [formState, setFormState] = useState({
    name: "",
    role: "",
    linkedinUrl: "",
    githubUsername: "",
    resumeText: "",
  });
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    if (!profileMe.data) {
      return;
    }

    setFormState({
      name: profileMe.data.name ?? "",
      role: profileMe.data.role ?? "",
      linkedinUrl: profileMe.data.linkedinUrl ?? "",
      githubUsername: profileMe.data.githubUsername ?? "",
      resumeText: profileMe.data.resumeText ?? "",
    });
  }, [profileMe.data]);

  async function handleSave() {
    try {
      setSaveState("saving");
      await updateProfile(formState);
      await profileMe.refetch();
      await profile.refetch();
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }

  return (
    <>
      <PageHeader page="profile" />
      <section className="grid-2">
        <GlassCard>
          <div className="muted">Recruiter profile view</div>
          <div className="stat-value" style={{ fontSize: "2rem", marginTop: 10 }}>
            {profileData?.name ?? brandStory.role}
          </div>
          <p className="section-copy">{profileData?.target ?? brandStory.target}</p>
          <div className="tag-row" style={{ marginTop: 12 }}>
            <span className="pill">{profileData?.strongestFit ?? "Product-minded frontend roles"}</span>
            <span className="pill">{profileData?.roadmapProjection ?? "Projected roadmap completion in 11 weeks"}</span>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="feedback-list">
            {(profileData?.highlights ?? profileHighlights).map((highlight) => (
              <div key={highlight} className="feedback-item">
                {highlight}
              </div>
            ))}
          </div>
        </GlassCard>
      </section>

      <GlassCard>
        <div className="row-between">
          <div>
            <h2 className="section-title">Edit Your Profile</h2>
            <p className="section-copy">Update the recruiter-facing details used across the dashboard and profile surfaces.</p>
          </div>
          <span className="pill">
            {saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved" : saveState === "error" ? "Save failed" : "Editable"}
          </span>
        </div>

        <div className="grid-2" style={{ marginTop: 20 }}>
          <label className="feedback-item">
            <div className="muted">Name</div>
            <input
              value={formState.name}
              onChange={(event) => setFormState((state) => ({ ...state, name: event.target.value }))}
              style={{ width: "100%", marginTop: 10, background: "transparent", border: 0, color: "var(--text)" }}
            />
          </label>
          <label className="feedback-item">
            <div className="muted">Role</div>
            <input
              value={formState.role}
              onChange={(event) => setFormState((state) => ({ ...state, role: event.target.value }))}
              style={{ width: "100%", marginTop: 10, background: "transparent", border: 0, color: "var(--text)" }}
            />
          </label>
          <label className="feedback-item">
            <div className="muted">LinkedIn URL</div>
            <input
              value={formState.linkedinUrl}
              onChange={(event) => setFormState((state) => ({ ...state, linkedinUrl: event.target.value }))}
              style={{ width: "100%", marginTop: 10, background: "transparent", border: 0, color: "var(--text)" }}
            />
          </label>
          <label className="feedback-item">
            <div className="muted">GitHub Username</div>
            <input
              value={formState.githubUsername}
              onChange={(event) => setFormState((state) => ({ ...state, githubUsername: event.target.value }))}
              style={{ width: "100%", marginTop: 10, background: "transparent", border: 0, color: "var(--text)" }}
            />
          </label>
        </div>

        <label className="feedback-item" style={{ display: "block", marginTop: 20 }}>
          <div className="muted">Resume Text</div>
          <textarea
            value={formState.resumeText}
            onChange={(event) => setFormState((state) => ({ ...state, resumeText: event.target.value }))}
            style={{
              width: "100%",
              minHeight: 160,
              marginTop: 10,
              background: "transparent",
              border: 0,
              color: "var(--text)",
              resize: "vertical",
            }}
          />
        </label>

        <div className="cta-row" style={{ marginTop: 20 }}>
          <button className="button-primary" onClick={handleSave}>
            Save Profile
          </button>
        </div>
      </GlassCard>
    </>
  );
}

export function SettingsPage() {
  const auth = useAuthSession();
  const settingsQuery = useSettingsData();

  return (
    <>
      <PageHeader page="settings" />
      <GlassCard>
        <div className="feedback-item" style={{ marginBottom: 12 }}>
          <div className="row-between">
            <strong>Integration readiness</strong>
            <span className="pill">{auth.data?.configured ? "Configured" : "Needs env setup"}</span>
          </div>
          <p className="section-copy" style={{ marginTop: 8 }}>
            {auth.data?.recommendedNextStep ?? "Connect Supabase auth and create a user session flow."}
          </p>
        </div>
        <div className="checklist">
          {(settingsQuery.data?.items ?? settings).map((item) => (
            <div key={item.label} className="check-item">
              <span>{item.label}</span>
              <span className="pill">{item.value}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </>
  );
}
