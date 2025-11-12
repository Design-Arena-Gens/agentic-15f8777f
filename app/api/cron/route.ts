import { NextResponse } from "next/server";
import { runAutopilot } from "@/lib/automation";

export async function POST() {
  const results = await runAutopilot();
  return NextResponse.json({
    processed: results.length,
    results
  });
}
