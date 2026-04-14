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
import { deleteProjectForUser, updateProjectForUser } from "@/lib/server/repository";
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

export async function PATCH(request: Request, context: { params: Promise<{ projectId: string }> }) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    enforceRateLimit(`project-update:${getRequestClientId(request, session.userId)}`, 50, 1000 * 60 * 10);

    const { projectId } = await context.params;
    const body = (await request.json().catch(() => ({}))) as Partial<ProjectInput>;
    const input = normalizeProjectInput(body);

    await updateProjectForUser(session.userId, projectId, input);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const retryAfter = getRetryAfterSeconds(error);
    if (retryAfter) {
      return NextResponse.json({ error: "Too many project update attempts. Try again later." }, { status: 429, headers: { "Retry-After": String(retryAfter) } });
    }

    const errorMessage = error instanceof Error ? error.message : "Unable to update project.";
    const statusCode = errorMessage.includes("not found") ? 404 : 400;

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ projectId: string }> }) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    enforceRateLimit(`project-delete:${getRequestClientId(_request, session.userId)}`, 30, 1000 * 60 * 10);

    const { projectId } = await context.params;
    await deleteProjectForUser(session.userId, projectId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const retryAfter = getRetryAfterSeconds(error);
    if (retryAfter) {
      return NextResponse.json({ error: "Too many project delete attempts. Try again later." }, { status: 429, headers: { "Retry-After": String(retryAfter) } });
    }

    const errorMessage = error instanceof Error ? error.message : "Unable to delete project.";
    const statusCode = errorMessage.includes("not found") ? 404 : 400;

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
