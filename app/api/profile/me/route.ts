import { NextResponse } from "next/server";
import { getProfileMe, updateProfileMe } from "@/lib/server/repository";
import { getCurrentSession } from "@/lib/server/session";

export async function GET() {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const profile = await getProfileMe(session.userId);

  if (!profile) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  return NextResponse.json(profile);
}

export async function PATCH(request: Request) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as {
    name?: string;
    role?: string;
    linkedinUrl?: string;
    githubUsername?: string;
    resumeText?: string;
  };

  if (!body.name || !body.role) {
    return NextResponse.json({ error: "Name and role are required." }, { status: 400 });
  }

  const updated = await updateProfileMe(session.userId, {
    name: body.name,
    role: body.role,
    linkedinUrl: body.linkedinUrl ?? "",
    githubUsername: body.githubUsername ?? "",
    resumeText: body.resumeText ?? "",
  });

  if (!updated) {
    return NextResponse.json({ error: "Unable to update profile." }, { status: 400 });
  }

  return NextResponse.json(updated);
}
