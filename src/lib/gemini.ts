import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export async function generateBattleImage(
  prompt: string
): Promise<string | null> {
  if (!ai) {
    console.warn("GEMINI_API_KEY not set, skipping image generation");
    return null;
  }

  // Try up to 2 times (initial + 1 retry)
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: prompt,
        config: {
          responseModalities: ["IMAGE", "TEXT"],
        },
      });

      // Extract base64 image from response
      const candidates = response.candidates;
      if (!candidates || candidates.length === 0) {
        console.warn("Gemini returned no candidates");
        if (attempt === 0) continue;
        return null;
      }

      const parts = candidates[0].content?.parts;
      if (!parts) {
        console.warn("Gemini returned no parts");
        if (attempt === 0) continue;
        return null;
      }

      // Find image part
      for (const part of parts) {
        if (part.inlineData?.data) {
          return part.inlineData.data; // base64 string
        }
      }

      // Check if safety filter blocked it
      const finishReason = candidates[0].finishReason;
      if (finishReason === "SAFETY") {
        console.warn("Gemini safety filter blocked image generation");
        return null; // Don't retry on safety blocks
      }

      console.warn("Gemini response had no image data");
      if (attempt === 0) continue;
      return null;
    } catch (error: unknown) {
      const statusCode =
        error instanceof Error && "status" in error
          ? (error as { status: number }).status
          : 0;

      if (statusCode === 429) {
        console.warn("Gemini rate limit hit");
        return null; // Don't retry on rate limits
      }

      console.error(
        `Gemini image generation attempt ${attempt + 1} failed:`,
        error instanceof Error ? error.message : error
      );

      if (attempt === 0) {
        // Wait 1s before retry
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }
      return null;
    }
  }

  return null;
}
