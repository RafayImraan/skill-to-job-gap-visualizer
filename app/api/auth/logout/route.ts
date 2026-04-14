import { NextResponse } from "next/server";
import { destroyUserSession } from "@/lib/server/session";

export async function POST() {
  try {
    await destroyUserSession();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Logout failed." },
      { status: 500 },
    );
  }
}
