import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  getRequestClientId,
  getRetryAfterSeconds,
  optionalTrimmedString,
  requireTrimmedString,
  validateIntegerInRange,
  validateOptionalUrl,
} from "@/lib/server/request";
import { createProjectForUser } from "@/lib/server/repository";
import { getCurrentSession } from "@/lib/server/session";
import type { ProjectInput } from "@/lib/types";

function normalizeProjectInput(body: Partial<ProjectInput>): ProjectInput {
  return {
    title: requireTrimmedString(body.title, "Project title", 120),
    description: optionalTrimmedString(body.description, "Project description", 4000),
    complexityLevel: validateIntegerInRange(body.complexityLevel, "Complexity level", 1, 10, 1),
    repoUrl: validateOptionalUrl(body.repoUrl, "Repository URL"),
    liveUrl: validateOptionalUrl(body.liveUrl, "Live URL"),
    readmeScore: validateIntegerInRange(body.readmeScore, "README score", 0, 100, 0),
  };
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    enforceRateLimit(`project-create:${getRequestClientId(request, session.userId)}`, 40, 1000 * 60 * 10);

    const body = (await request.json().catch(() => ({}))) as Partial<ProjectInput>;
    const input = normalizeProjectInput(body);

    await createProjectForUser(session.userId, input);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const retryAfter = getRetryAfterSeconds(error);
    if (retryAfter) {
      return NextResponse.json({ error: "Too many project create attempts. Try again later." }, { status: 429, headers: { "Retry-After": String(retryAfter) } });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create project." },
      { status: 400 },
    );
  }
}
