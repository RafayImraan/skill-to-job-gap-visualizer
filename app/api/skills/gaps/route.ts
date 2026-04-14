import { NextResponse } from "next/server";
import { getSkillGap } from "@/lib/server/repository";
import { getCurrentSession } from "@/lib/server/session";

export async function GET() {
  try {
    const session = await getCurrentSession();
    
    if (!session?.userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    
    return NextResponse.json(await getSkillGap(session.userId));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to fetch skill gaps." },
      { status: 500 },
    );
  }
}
