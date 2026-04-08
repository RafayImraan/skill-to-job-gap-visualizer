import { NextResponse } from "next/server";
import { getProjectAnalysis } from "@/lib/server/repository";
import { getCurrentSession } from "@/lib/server/session";

export async function GET() {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  return NextResponse.json(await getProjectAnalysis(session.userId));
}
