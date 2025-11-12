import { NextResponse } from "next/server";
import { z } from "zod";
import { createUploadTask, deleteUploadTask, listUploadTasks } from "@/lib/db";

const uploadSchema = z.object({
  accountId: z.number().nullable().optional(),
  title: z.string().min(3),
  description: z.string().min(10),
  tags: z.array(z.string()).default([]),
  categoryId: z.string().nullable().optional(),
  visibility: z.enum(["public", "unlisted", "private"]).default("private"),
  language: z.string().nullable().optional(),
  madeForKids: z.boolean().default(false),
  scheduleType: z.enum(["immediate", "scheduled", "draft"]).default("immediate"),
  scheduledFor: z.string().nullable().optional(),
  sourceType: z.enum(["file", "remote"]),
  sourceValue: z.string().min(1),
  thumbnailUrl: z.string().url().nullable().optional(),
  aiSummary: z.string().nullable().optional(),
  transcript: z.string().nullable().optional(),
  automationPlan: z.string().nullable().optional(),
  status: z.enum(["pending", "queued", "uploading", "published", "failed", "draft"]).optional()
});

export async function GET() {
  const uploads = listUploadTasks();
  return NextResponse.json({ uploads });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = uploadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const upload = createUploadTask({
    accountId: parsed.data.accountId ?? null,
    title: parsed.data.title,
    description: parsed.data.description,
    tags: parsed.data.tags,
    categoryId: parsed.data.categoryId ?? null,
    visibility: parsed.data.visibility,
    language: parsed.data.language ?? null,
    madeForKids: parsed.data.madeForKids,
    scheduleType: parsed.data.scheduleType,
    scheduledFor: parsed.data.scheduledFor ?? null,
    sourceType: parsed.data.sourceType,
    sourceValue: parsed.data.sourceValue,
    thumbnailUrl: parsed.data.thumbnailUrl ?? null,
    aiSummary: parsed.data.aiSummary ?? null,
    transcript: parsed.data.transcript ?? null,
    automationPlan: parsed.data.automationPlan ?? null,
    status: parsed.data.status ?? "pending",
    failureReason: null
  });

  return NextResponse.json({ upload }, { status: 201 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get("id"));
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  deleteUploadTask(id);
  return NextResponse.json({ ok: true });
}
