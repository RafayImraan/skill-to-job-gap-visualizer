import { NextResponse } from "next/server";
import { getMarketTrends } from "@/lib/server/repository";

export async function GET() {
  try {
    return NextResponse.json(await getMarketTrends());
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to fetch market trends." },
      { status: 500 },
    );
  }
}
