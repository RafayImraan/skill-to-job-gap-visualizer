import { NextResponse } from "next/server";
import { getSessionSummary } from "@/lib/server/auth";

export async function GET() {
  try {
    return NextResponse.json(await getSessionSummary());
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to get session." },
      { status: 500 },
    );
  }
}
