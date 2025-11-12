import { NextResponse } from "next/server";
import { z } from "zod";
import { getUploadTask, updateUploadTask } from "@/lib/db";

const updateSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  tags: z.array(z.string()).optional(),
  categoryId: z.string().nullable().optional(),
  visibility: z.enum(["public", "unlisted", "private"]).optional(),
  language: z.string().nullable().optional(),
  madeForKids: z.boolean().optional(),
  scheduleType: z.enum(["immediate", "scheduled", "draft"]).optional(),
  scheduledFor: z.string().nullable().optional(),
  sourceType: z.enum(["file", "remote"]).optional(),
  sourceValue: z.string().optional(),
  thumbnailUrl: z.string().nullable().optional(),
  aiSummary: z.string().nullable().optional(),
  transcript: z.string().nullable().optional(),
  automationPlan: z.string().nullable().optional(),
  accountId: z.number().nullable().optional(),
  status: z.enum(["pending", "queued", "uploading", "published", "failed", "draft"]).optional()
});

interface Params {
  params: {
    id: string;
  };
}

export async function GET(_request: Request, { params }: Params) {
  const id = Number(params.id);
  if (!id) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const upload = getUploadTask(id);
  if (!upload) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ upload });
}

export async function PATCH(request: Request, { params }: Params) {
  const id = Number(params.id);
  if (!id) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const upload = updateUploadTask(id, parsed.data);
  return NextResponse.json({ upload });
}
