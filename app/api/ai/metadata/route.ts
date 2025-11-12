import { NextResponse } from "next/server";
import { z } from "zod";
import OpenAI from "openai";

const schema = z.object({
  topic: z.string().min(5),
  transcript: z.string().optional(),
  targetKeywords: z.array(z.string()).optional(),
  tone: z.string().optional()
});

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 400 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const openai = new OpenAI({ apiKey });

  const prompt = [
    `You are an elite YouTube content strategist. Produce metadata for a video.`,
    `Topic: ${parsed.data.topic}`,
    parsed.data.transcript ? `Transcript: ${parsed.data.transcript.slice(0, 4000)}` : "",
    parsed.data.targetKeywords?.length ? `Target keywords: ${parsed.data.targetKeywords.join(", ")}` : "",
    parsed.data.tone ? `Tone: ${parsed.data.tone}` : "Tone: energetic but professional",
    `Return JSON with keys: title, description, tags (array of <=12), thumbnailIdea, hook, outline (array of bullet points).`
  ]
    .filter(Boolean)
    .join("\n\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "You craft high converting YouTube metadata. Respond only with valid JSON following the user instructions."
      },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" }
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) {
    return NextResponse.json({ error: "Model response missing" }, { status: 500 });
  }

  let parsedResponse: unknown;
  try {
    parsedResponse = JSON.parse(text);
  } catch (error) {
    return NextResponse.json({ error: "Failed to parse JSON from the model" }, { status: 500 });
  }

  return NextResponse.json({ plan: parsedResponse });
}
