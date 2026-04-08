"use client";

import dynamic from "next/dynamic";
import { DashboardSectionLoading } from "@/components/dashboard/shared-loading";

const GapAnalysisInner = dynamic(() => import("@/components/dashboard-sections").then((mod) => mod.GapAnalysisPage), {
  loading: () => <DashboardSectionLoading message="Loading skill gap analysis..." />,
});

export function GapAnalysisPage() {
  return <GapAnalysisInner />;
}
