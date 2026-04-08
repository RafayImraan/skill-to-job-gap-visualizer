"use client";

import dynamic from "next/dynamic";
import { DashboardSectionLoading } from "@/components/dashboard/shared-loading";

const InterviewInner = dynamic(() => import("@/components/dashboard-sections").then((mod) => mod.InterviewPage), {
  loading: () => <DashboardSectionLoading message="Loading interview prep..." />,
});

export function InterviewPage() {
  return <InterviewInner />;
}
