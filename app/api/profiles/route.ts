import { NextResponse } from "next/server";
import { z } from "zod";
import { listAIProfiles, upsertAIProfile } from "@/lib/db";

const profileSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2),
  prompt: z.string().min(20),
  tone: z.string().default("balanced"),
  keywords: z.array(z.string()).default([])
});

export async function GET() {
  const profiles = listAIProfiles();
  return NextResponse.json({ profiles });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const profile = upsertAIProfile(parsed.data);
  return NextResponse.json({ profile });
}
