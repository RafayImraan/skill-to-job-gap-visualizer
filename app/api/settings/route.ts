import { NextResponse } from "next/server";
import { getSettings } from "@/lib/server/repository";

export async function GET() {
  try {
    return NextResponse.json(await getSettings());
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to fetch settings." },
      { status: 500 },
    );
  }
}
