import { NextResponse } from "next/server";
import { getSessionSummary } from "@/lib/server/auth";

export async function GET() {
  return NextResponse.json(await getSessionSummary());
}
