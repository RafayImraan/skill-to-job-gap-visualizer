import { serverEnv } from "@/lib/server/env";

function extractJsonBlock(raw: string) {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```json\s*([\s\S]*?)```/i)?.[1];
  if (fenced) {
    return fenced.trim();
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

export async function generateOllamaJson<T>(prompt: string): Promise<T | null> {
  try {
    const response = await fetch(`${serverEnv.ollamaBaseUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: serverEnv.ollamaModel,
        prompt,
        stream: false,
        format: "json",
      }),
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { response?: string };
    const raw = payload.response?.trim();

    if (!raw) {
      return null;
    }

    return JSON.parse(extractJsonBlock(raw)) as T;
  } catch {
    return null;
  }
}
