import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  getRequestClientId,
  getRetryAfterSeconds,
  optionalTrimmedString,
  requireBoolean,
  requireTrimmedString,
} from "@/lib/server/request";
import { findUserById, saveResumeSnapshotForUser, saveResumeTextForUser } from "@/lib/server/repository";
import { generateResumeRewrite } from "@/lib/server/resume-intelligence";
import { getCurrentSession } from "@/lib/server/session";

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    enforceRateLimit(`resume-rewrite:${getRequestClientId(request, session.userId)}`, 10, 1000 * 60 * 15);

    const user = await findUserById(session.userId);

    if (!user?.resumeText) {
      return NextResponse.json({ error: "Upload or paste your resume before requesting a rewrite." }, { status: 400 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      targetRole?: string;
      jobDescription?: string;
    };

    return NextResponse.json(
      await generateResumeRewrite({
        resumeText: user.resumeText,
        targetRole: optionalTrimmedString(body.targetRole, "Target role", 120) || user.role || "Software Engineer",
        jobDescription: optionalTrimmedString(body.jobDescription, "Job description", 12000) || undefined,
      }),
    );
  } catch (error) {
    const retryAfter = getRetryAfterSeconds(error);
    if (retryAfter) {
      return NextResponse.json({ error: "Too many rewrite requests. Try again later." }, { status: 429, headers: { "Retry-After": String(retryAfter) } });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to generate resume rewrite." },
      { status: 400 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    enforceRateLimit(`resume-rewrite-save:${getRequestClientId(request, session.userId)}`, 20, 1000 * 60 * 10);

    const body = (await request.json().catch(() => ({}))) as {
      rewriteText?: string;
      label?: string;
      apply?: boolean;
    };

    const rewriteText = requireTrimmedString(body.rewriteText, "rewriteText", 50000);
    const label = optionalTrimmedString(body.label, "label", 120);
    const shouldApply = body.apply === undefined ? false : requireBoolean(body.apply, "apply");

    if (shouldApply) {
      return NextResponse.json(
        await saveResumeTextForUser(session.userId, rewriteText, label || "Applied rewrite"),
      );
    }

    return NextResponse.json(
      await saveResumeSnapshotForUser(session.userId, rewriteText, label || "Saved rewrite draft"),
    );
  } catch (error) {
    const retryAfter = getRetryAfterSeconds(error);
    if (retryAfter) {
      return NextResponse.json({ error: "Too many rewrite save attempts. Try again later." }, { status: 429, headers: { "Retry-After": String(retryAfter) } });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save resume rewrite." },
      { status: 400 },
    );
  }
}
