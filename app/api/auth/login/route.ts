import { NextResponse } from "next/server";
import { getSessionSummary } from "@/lib/server/auth";
import { enforceRateLimit, getRequestClientId, getRetryAfterSeconds, validateEmail, validatePassword } from "@/lib/server/request";
import { authenticateUser } from "@/lib/server/repository";
import { createUserSession } from "@/lib/server/session";

export async function POST(request: Request) {
  try {
    enforceRateLimit(`auth-login:${getRequestClientId(request)}`, 10, 1000 * 60 * 10);

    const body = (await request.json().catch(() => ({}))) as { email?: string; password?: string };
    const email = validateEmail(body.email);
    const password = validatePassword(body.password);

    const user = await authenticateUser({
      email,
      password,
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    await createUserSession(user.id, user.email);

    return NextResponse.json(await getSessionSummary());
  } catch (error) {
    const retryAfter = getRetryAfterSeconds(error);
    if (retryAfter) {
      return NextResponse.json({ error: "Too many login attempts. Try again later." }, { status: 429, headers: { "Retry-After": String(retryAfter) } });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to process login." },
      { status: 400 },
    );
  }
}
