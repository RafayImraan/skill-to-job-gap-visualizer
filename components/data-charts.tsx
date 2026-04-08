"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
} from "recharts";

function useChartReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return ready;
}

export function KpiSparkline({ values }: { values: number[] }) {
  const ready = useChartReady();
  const data = values.map((value, index) => ({
    step: index + 1,
    value,
  }));

  if (!ready) {
    return <div className="mini-chart" />;
  }

  return (
    <div className="mini-chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="kpiSparkFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--cyan)" stopOpacity={0.6} />
              <stop offset="95%" stopColor="var(--violet)" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <Tooltip
            contentStyle={{ background: "#11131A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
            labelStyle={{ color: "#94A3B8" }}
          />
          <Area type="monotone" dataKey="value" stroke="var(--cyan)" strokeWidth={2.5} fill="url(#kpiSparkFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function GithubRadar({
  docs,
  ci,
  structure,
  deployment,
}: {
  docs: number;
  ci: number;
  structure: number;
  deployment: number;
}) {
  const ready = useChartReady();
  const data = [
    { subject: "Docs", score: docs },
    { subject: "CI", score: ci },
    { subject: "Structure", score: structure },
    { subject: "Deploy", score: deployment },
  ];

  if (!ready) {
    return <div style={{ width: "100%", height: 260 }} />;
  }

  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.12)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: "#94A3B8", fontSize: 12 }} />
          <Radar dataKey="score" stroke="var(--cyan)" fill="var(--cyan)" fillOpacity={0.35} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MarketBarChart({
  roles,
}: {
  roles: Array<{
    role: string;
    match: number;
  }>;
}) {
  const ready = useChartReady();

  if (!ready) {
    return <div style={{ width: "100%", height: 320 }} />;
  }

  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={roles}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis dataKey="role" tick={{ fill: "#94A3B8", fontSize: 12 }} />
          <YAxis tick={{ fill: "#94A3B8", fontSize: 12 }} />
          <Tooltip
            contentStyle={{ background: "#11131A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
            labelStyle={{ color: "#94A3B8" }}
          />
          <Bar dataKey="match" fill="var(--cyan)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
