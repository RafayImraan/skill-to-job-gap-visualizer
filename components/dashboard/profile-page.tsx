"use client";

import dynamic from "next/dynamic";
import { DashboardSectionLoading } from "@/components/dashboard/shared-loading";

const ProfileInner = dynamic(() => import("@/components/dashboard-sections").then((mod) => mod.ProfilePage), {
  loading: () => <DashboardSectionLoading message="Loading profile..." />,
});

export function ProfilePage() {
  return <ProfileInner />;
}
