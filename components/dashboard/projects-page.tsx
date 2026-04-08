"use client";

import { useState } from "react";
import { Briefcase } from "lucide-react";
import { projects } from "@/lib/mock-data";
import {
  createProject,
  deleteProject,
  updateProject as updateProjectEntry,
  useGithubProjectSuggestions,
  useProjectAnalysis,
} from "@/lib/api";
import { GlassCard, PageHeader, QueryMessage } from "@/components/dashboard/shared-ui";

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
              {projectData?.nextUpgrade ??
                "Add stronger README depth, test evidence, and measurable project outcomes to your weakest project."}
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
