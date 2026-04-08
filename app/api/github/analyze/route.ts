import { NextRequest, NextResponse } from "next/server";
import { getGithubAnalysis } from "@/lib/server/repository";
import { getCurrentSession } from "@/lib/server/session";

export async function GET(request: NextRequest) {
  const session = await getCurrentSession();
  const username = request.nextUrl.searchParams.get("username");

  return NextResponse.json(await getGithubAnalysis(username, session?.userId));
}
