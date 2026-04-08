import { NextResponse } from "next/server";
import { getRoadmap, updateRoadmapMilestoneForUser } from "@/lib/server/repository";
import { getCurrentSession } from "@/lib/server/session";

export async function GET() {
  const session = await getCurrentSession();
  return NextResponse.json(await getRoadmap(session?.userId));
}

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    dayNumber?: number;
    isCompleted?: boolean;
  };

  if (typeof body.dayNumber !== "number" || typeof body.isCompleted !== "boolean") {
    return NextResponse.json({ error: "dayNumber and isCompleted are required." }, { status: 400 });
  }

  return NextResponse.json(await updateRoadmapMilestoneForUser(session.userId, body.dayNumber, body.isCompleted));
}
