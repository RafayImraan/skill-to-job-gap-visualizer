import { NextResponse } from "next/server";
import { findUserById, saveResumeSnapshotForUser, saveResumeTextForUser } from "@/lib/server/repository";
import { generateResumeRewrite } from "@/lib/server/resume-intelligence";
import { getCurrentSession } from "@/lib/server/session";

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

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
      targetRole: body.targetRole ?? user.role,
      jobDescription: body.jobDescription,
    }),
  );
}

export async function PATCH(request: Request) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    rewriteText?: string;
    label?: string;
    apply?: boolean;
  };

  const rewriteText = body.rewriteText?.trim();
  if (!rewriteText) {
    return NextResponse.json({ error: "rewriteText is required." }, { status: 400 });
  }

  if (body.apply) {
    return NextResponse.json(
      await saveResumeTextForUser(session.userId, rewriteText, body.label ?? "Applied rewrite"),
    );
  }

  return NextResponse.json(
    await saveResumeSnapshotForUser(session.userId, rewriteText, body.label ?? "Saved rewrite draft"),
  );
}
