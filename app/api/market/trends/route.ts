import { NextResponse } from "next/server";
import { getMarketTrends } from "@/lib/server/repository";

export async function GET() {
  return NextResponse.json(await getMarketTrends());
}
