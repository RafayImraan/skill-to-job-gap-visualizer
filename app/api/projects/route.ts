import { NextResponse } from "next/server";
import { createProjectForUser } from "@/lib/server/repository";
import { getCurrentSession } from "@/lib/server/session";
import type { ProjectInput } from "@/lib/types";

function normalizeProjectInput(body: Partial<ProjectInput>): ProjectInput {
  return {
    title: body.title?.trim() ?? "",
    description: body.description?.trim() ?? "",
    complexityLevel: Math.max(1, Math.min(10, Number(body.complexityLevel) || 1)),
    repoUrl: body.repoUrl?.trim() ?? "",
    liveUrl: body.liveUrl?.trim() ?? "",
    readmeScore: Math.max(0, Math.min(100, Number(body.readmeScore) || 0)),
  };
}

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as Partial<ProjectInput>;
  const input = normalizeProjectInput(body);

  if (!input.title) {
    return NextResponse.json({ error: "Project title is required." }, { status: 400 });
  }

  await createProjectForUser(session.userId, input);
  return NextResponse.json({ ok: true });
}
