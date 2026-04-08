"use client";

import dynamic from "next/dynamic";
import { DashboardSectionLoading } from "@/components/dashboard/shared-loading";

const SettingsInner = dynamic(() => import("@/components/dashboard-sections").then((mod) => mod.SettingsPage), {
  loading: () => <DashboardSectionLoading message="Loading settings..." />,
});

export function SettingsPage() {
  return <SettingsInner />;
}
