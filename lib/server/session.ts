import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { serverEnv } from "@/lib/server/env";

export const SESSION_COOKIE_NAME = "skill_gap_session";

type SessionPayload = {
  userId: string;
  email: string;
  exp: number;
};

function sign(value: string) {
  return createHmac("sha256", serverEnv.authSecret).update(value).digest("hex");
}

function encode(payload: SessionPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decode(token: string | undefined): SessionPayload | null {
  if (!token) {
    return null;
  }

  const [body, signature] = token.split(".");

  if (!body || !signature) {
    return null;
  }

  const expected = sign(body);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;

    if (!payload.userId || payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function createUserSession(userId: string, email: string) {
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7;
  const token = encode({ userId, email, exp: expiresAt });
  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function destroyUserSession() {
  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    expires: new Date(0),
  });
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  return decode(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}
