import { NextResponse } from "next/server";
import { z } from "zod";
import { createAccount, deleteAccount, listAccounts } from "@/lib/db";
import { testAccountCredentials } from "@/lib/youtube";

const accountSchema = z.object({
  label: z.string().min(2),
  clientId: z.string(),
  clientSecret: z.string(),
  redirectUri: z.string().url(),
  refreshToken: z.string(),
  scopes: z.array(z.string()).default([])
});

export async function GET() {
  const accounts = listAccounts();
  return NextResponse.json({ accounts });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = accountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const scopes = parsed.data.scopes.length ? parsed.data.scopes : ["https://www.googleapis.com/auth/youtube.upload"];
  const account = createAccount({ ...parsed.data, scopes });

  try {
    await testAccountCredentials(account);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to verify YouTube credentials";
    return NextResponse.json({ account, warning: message }, { status: 201 });
  }

  return NextResponse.json({ account });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get("id"));
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  deleteAccount(id);
  return NextResponse.json({ ok: true });
}
