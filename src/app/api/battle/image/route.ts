import { NextRequest, NextResponse } from "next/server";
import { generateBattleImage } from "@/lib/gemini";
import { buildImagePrompt } from "@/lib/image-prompt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { narrative, enemyNarrative, enemyName, enemyDescription } = body;

    if (!narrative || !enemyNarrative || !enemyName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const imagePrompt = buildImagePrompt({
      narrative,
      enemyNarrative,
      enemyName,
      enemyDescription: enemyDescription || enemyName,
    });

    const base64Image = await generateBattleImage(imagePrompt);

    if (!base64Image) {
      return NextResponse.json(
        { image: null, error: "Image generation unavailable" },
        { status: 200 } // 200 not 500 — image is optional
      );
    }

    return NextResponse.json({ image: base64Image });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { image: null, error: "Image generation failed" },
      { status: 200 }
    );
  }
}
