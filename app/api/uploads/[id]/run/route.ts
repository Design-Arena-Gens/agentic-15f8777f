import { NextResponse } from "next/server";
import { handleSingleUpload } from "@/lib/automation";

interface Params {
  params: {
    id: string;
  };
}

export async function POST(_request: Request, { params }: Params) {
  const id = Number(params.id);
  if (!id) {
    return NextResponse.json({ error: "Invalid upload id" }, { status: 400 });
  }

  const result = await handleSingleUpload(id);
  if (!result.success) {
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result);
}
