"use client";

import dynamic from "next/dynamic";
import { BadgeCheck, ChevronRight, WandSparkles } from "lucide-react";
import { brandStory, kpis } from "@/lib/mock-data";
import { useAuthSession, useDashboardOverview } from "@/lib/api";
import { GlassCard, PageHeader, QueryMessage } from "@/components/dashboard/shared-ui";

const KpiSparkline = dynamic(() => import("@/components/data-charts").then((mod) => mod.KpiSparkline), {
  ssr: false,
  loading: () => <div style={{ height: 72 }} />,
});

export function DashboardOverviewPage() {
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
