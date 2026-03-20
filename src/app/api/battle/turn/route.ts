import { NextRequest, NextResponse } from "next/server";
import {
  getBattle,
  processTurn,
  validatePrompt,
  getBattleSummary,
  GAME_RULES,
} from "@/lib/game-engine";
import { getAIBattleTurn } from "@/lib/claude";

// Simple rate limiter (per battle)
const lastTurnTime = new Map<string, number>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { battleId, prompt } = body;

    if (!battleId || typeof battleId !== "string") {
      return NextResponse.json(
        { error: "battleId is required" },
        { status: 400 }
      );
    }

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "prompt is required" },
        { status: 400 }
      );
    }

    // Validate prompt
    const validation = validatePrompt(prompt);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Get battle
    const battle = getBattle(battleId);
    if (!battle) {
      return NextResponse.json(
        { error: "Battle not found or expired" },
        { status: 404 }
      );
    }

    if (battle.status !== "active") {
      return NextResponse.json(
        { error: `Battle is already ${battle.status}` },
        { status: 400 }
      );
    }

    // Rate limit check
    const lastTime = lastTurnTime.get(battleId) ?? 0;
    const now = Date.now();
    if (now - lastTime < GAME_RULES.RATE_LIMIT_MS) {
      const waitMs = GAME_RULES.RATE_LIMIT_MS - (now - lastTime);
      return NextResponse.json(
        { error: `Too fast! Wait ${Math.ceil(waitMs / 1000)}s before next turn` },
        { status: 429 }
      );
    }
    lastTurnTime.set(battleId, now);

    // Get AI response
    const aiResult = await getAIBattleTurn(battle, prompt.trim());

    // Process turn with server-side validation
    const updatedBattle = processTurn(battleId, prompt.trim(), aiResult);
    if (!updatedBattle) {
      return NextResponse.json(
        { error: "Failed to process turn" },
        { status: 500 }
      );
    }

    const lastTurn =
      updatedBattle.turnHistory[updatedBattle.turnHistory.length - 1];

    return NextResponse.json({
      battle: getBattleSummary(updatedBattle),
      turn: {
        number: lastTurn.turn,
        narrative: lastTurn.narrative,
        enemyNarrative: lastTurn.enemyNarrative,
        damageToEnemy: lastTurn.damageToEnemy,
        damageToPlayer: lastTurn.damageToPlayer,
        creativityScore: lastTurn.creativityScore,
        playerEffect: lastTurn.playerEffect,
        enemyEffect: lastTurn.enemyEffect,
      },
    });
  } catch (error) {
    console.error("Battle turn error:", error);
    return NextResponse.json(
      {
        error:
          "The Game Master is distracted... try again.",
      },
      { status: 500 }
    );
  }
}
