import { NextResponse } from "next/server";
import { ENEMIES } from "@/lib/enemies";

export async function GET() {
  const enemies = ENEMIES.map((e) => ({
    id: e.id,
    name: e.name,
    hp: e.hp,
    atk: e.atk,
    def: e.def,
    weakness: e.weakness,
    description: e.description,
    difficulty: e.difficulty,
  }));

  return NextResponse.json({ enemies });
}
