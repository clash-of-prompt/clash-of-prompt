import { GoogleGenAI } from "@google/genai";

function getClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenAI({ apiKey: key });
}

export async function generateBattleImage(
  prompt: string
): Promise<string | null> {
  const ai = getClient();
  if (!ai) return null;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: prompt,
        config: {
          responseModalities: ["IMAGE", "TEXT"],
        },
      });

      const candidates = response.candidates;
      if (!candidates || candidates.length === 0) {
        if (attempt === 0) continue;
        return null;
      }

      const parts = candidates[0].content?.parts;
      if (!parts) {
        if (attempt === 0) continue;
        return null;
      }

      for (const part of parts) {
        if (part.inlineData?.data) {
          return part.inlineData.data;
        }
      }

      const finishReason = candidates[0].finishReason;
      if (finishReason === "SAFETY") {
        return null;
      }

      if (attempt === 0) continue;
      return null;
    } catch (error: unknown) {
      const statusCode =
        error instanceof Error && "status" in error
          ? (error as { status: number }).status
          : 0;

      if (statusCode === 429) {
        return null;
      }

      console.error(
        `Gemini image generation attempt ${attempt + 1} failed:`,
        error instanceof Error ? error.message : error
      );

      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }
      return null;
    }
  }

  return null;
}
