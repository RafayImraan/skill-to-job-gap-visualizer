"use client";

import dynamic from "next/dynamic";
import { DashboardSectionLoading } from "@/components/dashboard/shared-loading";

const LandingHeroInner = dynamic(() => import("@/components/dashboard-sections").then((mod) => mod.LandingHero), {
  loading: () => <DashboardSectionLoading message="Loading hero experience..." />,
});

export function LandingHero() {
  return <LandingHeroInner />;
}
