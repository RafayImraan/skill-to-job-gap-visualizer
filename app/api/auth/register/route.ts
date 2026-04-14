import { NextResponse } from "next/server";
import { getSessionSummary } from "@/lib/server/auth";
import { enforceRateLimit, getRequestClientId, getRetryAfterSeconds, optionalTrimmedString, validateEmail, validatePassword } from "@/lib/server/request";
import { createUser } from "@/lib/server/repository";
import { createUserSession } from "@/lib/server/session";

export async function POST(request: Request) {
  try {
    enforceRateLimit(`auth-register:${getRequestClientId(request)}`, 5, 1000 * 60 * 15);

    const body = (await request.json().catch(() => ({}))) as { name?: string; email?: string; password?: string };
    const email = validateEmail(body.email);
    const password = validatePassword(body.password);
    const name = optionalTrimmedString(body.name, "Name", 120);

    const user = await createUser({
      name,
      email,
      password,
    });

    await createUserSession(user.id, user.email);

    return NextResponse.json(await getSessionSummary(), { status: 201 });
  } catch (error) {
    const retryAfter = getRetryAfterSeconds(error);
    if (retryAfter) {
      return NextResponse.json({ error: "Too many registration attempts. Try again later." }, { status: 429, headers: { "Retry-After": String(retryAfter) } });
    }

    const errorMessage = error instanceof Error ? error.message : "Unable to create account.";
    const statusCode = errorMessage.includes("already exists") ? 409 : 400;

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
