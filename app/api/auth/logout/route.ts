import { NextResponse } from "next/server";
import { destroyUserSession } from "@/lib/server/session";

export async function POST() {
  await destroyUserSession();
  return NextResponse.json({ ok: true });
}
