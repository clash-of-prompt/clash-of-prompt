import { NextRequest, NextResponse } from "next/server";
import { createBattle, getBattleSummary } from "@/lib/game-engine";
import { getEnemyById } from "@/lib/enemies";
import { generateBattleIntro } from "@/lib/claude";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { enemyId, locale } = body;

    if (!enemyId || typeof enemyId !== "number") {
      return NextResponse.json(
        { error: "enemyId is required and must be a number" },
        { status: 400 }
      );
    }

    const enemy = getEnemyById(enemyId);
    if (!enemy) {
      return NextResponse.json(
        { error: `Enemy with id ${enemyId} not found` },
        { status: 404 }
      );
    }

    const battle = createBattle(enemyId);
    if (!battle) {
      return NextResponse.json(
        { error: "Failed to create battle" },
        { status: 500 }
      );
    }

    const intro = generateBattleIntro(enemy, locale || "en");

    return NextResponse.json({
      battle: getBattleSummary(battle),
      intro,
      message: `Battle started against ${enemy.name}!`,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to start battle" },
      { status: 500 }
    );
  }
}
