import { NextResponse } from "next/server";
import { getRoadmap, updateRoadmapMilestoneForUser } from "@/lib/server/repository";
import { getCurrentSession } from "@/lib/server/session";

export async function GET() {
  try {
    const session = await getCurrentSession();
    return NextResponse.json(await getRoadmap(session?.userId));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to fetch roadmap." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
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

    if (body.dayNumber < 1 || body.dayNumber > 90) {
      return NextResponse.json({ error: "dayNumber must be between 1 and 90." }, { status: 400 });
    }

    return NextResponse.json(await updateRoadmapMilestoneForUser(session.userId, body.dayNumber, body.isCompleted));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update roadmap milestone." },
      { status: 500 },
    );
  }
}
