import { NextResponse } from "next/server";
import { getSessionSummary } from "@/lib/server/auth";
import { authenticateUser } from "@/lib/server/repository";
import { createUserSession } from "@/lib/server/session";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };

  if (!body.email || !body.password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const user = await authenticateUser({
    email: body.email,
    password: body.password,
  });

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  await createUserSession(user.id, user.email);

  return NextResponse.json(await getSessionSummary());
}
