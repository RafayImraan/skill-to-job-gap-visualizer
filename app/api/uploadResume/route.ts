import { NextResponse } from "next/server";
import { getResumeUploadForUser, restoreResumeSnapshotForUser, saveResumeTextForUser } from "@/lib/server/repository";
import { extractResumeText } from "@/lib/server/resume";
import { getCurrentSession } from "@/lib/server/session";

export const runtime = "nodejs";

export async function GET() {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  return NextResponse.json(await getResumeUploadForUser(session.userId));
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const textValue = formData.get("text");

    let extractedText = "";

    if (file instanceof File) {
      const buffer = Buffer.from(await file.arrayBuffer());
      extractedText = await extractResumeText(buffer, file.type, file.name);
      return NextResponse.json(await saveResumeTextForUser(session.userId, extractedText, file.name));
    } else if (typeof textValue === "string") {
      extractedText = textValue.trim();
    }

    if (!extractedText) {
      return NextResponse.json({ error: "Please upload a PDF/text resume or provide resume text." }, { status: 400 });
    }

    return NextResponse.json(await saveResumeTextForUser(session.userId, extractedText, "Pasted text"));
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Resume upload failed. Please try pasted text or a .txt file.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    snapshotId?: string;
  };

  if (!body.snapshotId) {
    return NextResponse.json({ error: "snapshotId is required." }, { status: 400 });
  }

  return NextResponse.json(await restoreResumeSnapshotForUser(session.userId, body.snapshotId));
}
