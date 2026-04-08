"use client";

import { Flame, Trophy } from "lucide-react";
import { roadmapMilestones } from "@/lib/mock-data";
import { updateRoadmapMilestone, useDashboardQueryClient, useRoadmap } from "@/lib/api";
import type { RoadmapMilestoneItem } from "@/lib/types";
import { GlassCard, PageHeader } from "@/components/dashboard/shared-ui";
import { useState } from "react";

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
            {roadmapData?.planSummary ??
              "This roadmap prioritizes shipping proof, resume alignment, and stronger public engineering signals before application season."}
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
