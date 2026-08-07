import { NextRequest, NextResponse } from "next/server";
import { searchInstruments } from "@/lib/upstox/service";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.trim().length < 2) {
    return NextResponse.json([]);
  }

  try {
    const results = await searchInstruments(query);
    return NextResponse.json(results);
  } catch (error) {
    console.error("Error in Search Route:", error);
    return NextResponse.json(
      { error: "Failed to search stocks" },
      { status: 500 }
    );
  }
}
