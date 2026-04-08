import { NextResponse } from "next/server";
import { getSessionSummary } from "@/lib/server/auth";
import { createUser } from "@/lib/server/repository";
import { createUserSession } from "@/lib/server/session";

export async function POST(request: Request) {
  const body = (await request.json()) as { name?: string; email?: string; password?: string };

  if (!body.email || !body.password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  try {
    const user = await createUser({
      name: body.name,
      email: body.email,
      password: body.password,
    });

    await createUserSession(user.id, user.email);

    return NextResponse.json(await getSessionSummary(), { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create account." },
      { status: 400 },
    );
  }
}
