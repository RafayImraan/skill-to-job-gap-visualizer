import { NextResponse } from "next/server";
import { getSettings } from "@/lib/server/repository";

export async function GET() {
  return NextResponse.json(await getSettings());
}
