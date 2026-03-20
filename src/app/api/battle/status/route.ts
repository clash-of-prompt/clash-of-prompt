import { NextRequest, NextResponse } from "next/server";
import { getBattle, getBattleSummary } from "@/lib/game-engine";

export async function GET(request: NextRequest) {
  const battleId = request.nextUrl.searchParams.get("id");

  if (!battleId) {
    return NextResponse.json(
      { error: "Battle id is required" },
      { status: 400 }
    );
  }

  const battle = getBattle(battleId);
  if (!battle) {
    return NextResponse.json(
      { error: "Battle not found or expired" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    battle: getBattleSummary(battle),
  });
}
