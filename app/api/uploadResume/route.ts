import { NextResponse } from "next/server";
import { enforceRateLimit, getRequestClientId, getRetryAfterSeconds, requireTrimmedString } from "@/lib/server/request";
import { getResumeUploadForUser, restoreResumeSnapshotForUser, saveResumeTextForUser } from "@/lib/server/repository";
import { extractResumeText } from "@/lib/server/resume";
import { getCurrentSession } from "@/lib/server/session";

export const runtime = "nodejs";
const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const ALLOWED_TEXT_MIME_TYPES = new Set(["text/plain", "application/pdf", ""]);

export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json(await getResumeUploadForUser(session.userId));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to fetch resume." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    enforceRateLimit(`resume-upload:${getRequestClientId(request, session.userId)}`, 12, 1000 * 60 * 10);

    const formData = await request.formData();
    const file = formData.get("file");
    const textValue = formData.get("text");

    let extractedText = "";

    if (file instanceof File) {
      const lowerName = file.name.toLowerCase();
      if (!lowerName.endsWith(".pdf") && !lowerName.endsWith(".txt")) {
        return NextResponse.json({ error: "Only PDF and TXT resume uploads are supported." }, { status: 400 });
      }

      if (file.size > MAX_RESUME_BYTES) {
        return NextResponse.json({ error: "Resume file must be 5 MB or smaller." }, { status: 400 });
      }

      if (!ALLOWED_TEXT_MIME_TYPES.has(file.type)) {
        return NextResponse.json({ error: "Unsupported resume file type." }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      extractedText = await extractResumeText(buffer, file.type, file.name);
      return NextResponse.json(await saveResumeTextForUser(session.userId, extractedText, file.name));
    } else if (typeof textValue === "string") {
      extractedText = requireTrimmedString(textValue, "Resume text", 50000);
    }

    if (!extractedText) {
      return NextResponse.json({ error: "Please upload a PDF/text resume or provide resume text." }, { status: 400 });
    }

    return NextResponse.json(await saveResumeTextForUser(session.userId, extractedText, "Pasted text"));
  } catch (error) {
    const retryAfter = getRetryAfterSeconds(error);
    if (retryAfter) {
      return NextResponse.json({ error: "Too many resume upload attempts. Try again later." }, { status: 429, headers: { "Retry-After": String(retryAfter) } });
    }

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
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    enforceRateLimit(`resume-restore:${getRequestClientId(request, session.userId)}`, 20, 1000 * 60 * 10);

    const body = (await request.json().catch(() => ({}))) as {
      snapshotId?: string;
    };
    const snapshotId = requireTrimmedString(body.snapshotId, "snapshotId", 191);

    return NextResponse.json(await restoreResumeSnapshotForUser(session.userId, snapshotId));
  } catch (error) {
    const retryAfter = getRetryAfterSeconds(error);
    if (retryAfter) {
      return NextResponse.json({ error: "Too many restore attempts. Try again later." }, { status: 429, headers: { "Retry-After": String(retryAfter) } });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to restore resume version." },
      { status: 400 },
    );
  }
}
