import { NextResponse } from "next/server";
import { getDashboardOverview } from "@/lib/server/repository";
import { getCurrentSession } from "@/lib/server/session";

export async function GET() {
  const session = await getCurrentSession();
  return NextResponse.json(await getDashboardOverview(session?.userId));
}
