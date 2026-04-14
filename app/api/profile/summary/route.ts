import { NextResponse } from "next/server";
import { getProfileSummary } from "@/lib/server/repository";
import { getCurrentSession } from "@/lib/server/session";

export async function GET() {
  try {
    const session = await getCurrentSession();
    
    if (!session?.userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    
    return NextResponse.json(await getProfileSummary(session.userId));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to fetch profile summary." },
      { status: 500 },
    );
  }
}
