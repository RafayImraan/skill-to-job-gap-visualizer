"use client";

import { useEffect, useState } from "react";
import { FileText, Target, WandSparkles } from "lucide-react";
import { atsFindings, sampleResumeBullets } from "@/lib/mock-data";
import {
  generateResumeRewrite,
  persistResumeRewrite,
  restoreResumeVersion,
  uploadResume,
  useProfileMe,
  useResumePreview,
} from "@/lib/api";
import { GlassCard, PageHeader, QueryMessage, getRewriteDiffHints } from "@/components/dashboard/shared-ui";

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
                    : resumeData?.comparison.delta ?? 0}{" "}
                  ATS
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
                  <span className="pill">
                    {rewriteSaveState === "saving" ? "Saving..." : rewriteSaveState === "saved" ? "Saved" : "Preview"}
                  </span>
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
