import { NextResponse } from "next/server";

import { getTaskFilterCounts } from "@/lib/tasks";

export async function GET() {
  try {
    const counts = await getTaskFilterCounts();
    return NextResponse.json(counts);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch task counts", detail: String(error) },
      { status: 500 },
    );
  }
}
