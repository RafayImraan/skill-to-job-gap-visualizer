import { NextRequest, NextResponse } from "next/server";
import { getSkillGap } from "@/lib/server/repository";
import { getCurrentSession } from "@/lib/server/session";

export async function GET(request: NextRequest) {
  const session = await getCurrentSession();
  const userId = session?.userId ?? request.nextUrl.searchParams.get("userId");

  return NextResponse.json(await getSkillGap(userId));
}
