import { NextRequest, NextResponse } from "next/server";
import { getGithubAnalysis } from "@/lib/server/repository";
import { getCurrentSession } from "@/lib/server/session";

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    const username = request.nextUrl.searchParams.get("username");

    if (!username || typeof username !== "string" || username.trim().length === 0) {
      return NextResponse.json({ error: "GitHub username is required." }, { status: 400 });
    }

    return NextResponse.json(await getGithubAnalysis(username, session?.userId));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "GitHub analysis failed." },
      { status: 500 },
    );
  }
}
