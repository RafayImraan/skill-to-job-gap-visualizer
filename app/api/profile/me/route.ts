import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  getRequestClientId,
  getRetryAfterSeconds,
  optionalTrimmedString,
  validateGithubUsername,
  validateOptionalUrl,
} from "@/lib/server/request";
import { getProfileMe, updateProfileMe } from "@/lib/server/repository";
import { getCurrentSession } from "@/lib/server/session";
import type { ProfileUpdateInput } from "@/lib/types";

export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const profile = await getProfileMe(session.userId);

    if (!profile) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to fetch profile." },
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

    enforceRateLimit(`profile-update:${getRequestClientId(request, session.userId)}`, 30, 1000 * 60 * 10);

    const body = (await request.json().catch(() => ({}))) as Partial<ProfileUpdateInput>;

    const updateData: ProfileUpdateInput = {};

    if (body.name !== undefined) {
      const trimmed = body.name.trim();
      if (trimmed.length === 0) {
        return NextResponse.json({ error: "Name cannot be empty." }, { status: 400 });
      }
      if (trimmed.length > 120) {
        return NextResponse.json({ error: "Name must be 120 characters or less." }, { status: 400 });
      }
      updateData.name = trimmed;
    }

    if (body.role !== undefined) {
      const trimmed = body.role.trim();
      if (trimmed.length === 0) {
        return NextResponse.json({ error: "Role cannot be empty." }, { status: 400 });
      }
      if (trimmed.length > 120) {
        return NextResponse.json({ error: "Role must be 120 characters or less." }, { status: 400 });
      }
      updateData.role = trimmed;
    }

    if (body.linkedinUrl !== undefined) {
      updateData.linkedinUrl = validateOptionalUrl(body.linkedinUrl, "LinkedIn URL") ?? undefined;
    }

    if (body.githubUsername !== undefined) {
      updateData.githubUsername = validateGithubUsername(body.githubUsername) ?? undefined;
    }

    if (body.resumeText !== undefined) {
      updateData.resumeText = optionalTrimmedString(body.resumeText, "Resume text", 50000);
    }

    const updated = await updateProfileMe(session.userId, updateData);

    if (!updated) {
      return NextResponse.json({ error: "Unable to update profile." }, { status: 400 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    const retryAfter = getRetryAfterSeconds(error);
    if (retryAfter) {
      return NextResponse.json({ error: "Too many profile update attempts. Try again later." }, { status: 429, headers: { "Retry-After": String(retryAfter) } });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update profile." },
      { status: 400 },
    );
  }
}
