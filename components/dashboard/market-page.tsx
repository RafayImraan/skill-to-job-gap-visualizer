"use client";

import dynamic from "next/dynamic";
import { DashboardSectionLoading } from "@/components/dashboard/shared-loading";

const MarketInner = dynamic(() => import("@/components/dashboard-sections").then((mod) => mod.MarketPage), {
  loading: () => <DashboardSectionLoading message="Loading market trends..." />,
});

export function MarketPage() {
  return <MarketInner />;
}
