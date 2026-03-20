import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { z } from "zod";
import { Enemy } from "./enemies";
import { BattleState, AITurnResult } from "./game-engine";
import { buildSystemPrompt, buildTurnMessage } from "./prompts";

const execAsync = promisify(exec);

// Structured output schema for battle turns
export const BattleTurnResultSchema = z.object({
  narrative: z.string(),
  creativity_score: z.number().min(1).max(10),
  damage_to_enemy: z.number().min(0).max(40),
  damage_to_player: z.number().min(0).max(30),
  player_status_effect: z.enum(["none", "poison", "stun", "burn"]),
  enemy_status_effect: z.enum([
    "none",
    "poison",
    "stun",
    "burn",
    "shield",
    "heal",
  ]),
  enemy_action_narrative: z.string(),
});

export async function getAIBattleTurn(
  battle: BattleState,
  playerPrompt: string
): Promise<AITurnResult> {
  const systemPrompt = buildSystemPrompt(battle.enemy);
  const userMessage = buildTurnMessage(battle, playerPrompt);

  const fullPrompt = `${systemPrompt}\n\n${userMessage}\n\nIMPORTANT: You MUST respond with ONLY a valid JSON object, no markdown, no code fences, no explanation. The JSON must have exactly these fields:
{
  "narrative": "1-3 sentence dramatic battle narration",
  "creativity_score": <number 1-10>,
  "damage_to_enemy": <number 0-40>,
  "damage_to_player": <number 0-30>,
  "player_status_effect": "none" | "poison" | "stun" | "burn",
  "enemy_status_effect": "none" | "poison" | "stun" | "burn" | "shield" | "heal",
  "enemy_action_narrative": "1-2 sentence what the enemy does"
}

Respond with ONLY the JSON object. Nothing else.`;

  // Write prompt to temp file, pipe to claude CLI
  const tmpFile = join(tmpdir(), `prompt-wars-${Date.now()}.txt`);
  await writeFile(tmpFile, fullPrompt, "utf-8");

  let stdout: string;
  try {
    // Strip ANTHROPIC_API_KEY from env so Claude CLI uses its own OAuth credentials
    const cleanEnv = { ...process.env };
    delete cleanEnv.ANTHROPIC_API_KEY;
    cleanEnv.PATH = (cleanEnv.PATH || "") + ":/Users/askar/.local/bin";

    const result = await execAsync(
      `cat "${tmpFile}" | /Users/askar/.local/bin/claude -p --output-format text`,
      {
        timeout: 45000,
        maxBuffer: 1024 * 1024,
        env: cleanEnv,
      }
    );
    stdout = result.stdout;
  } finally {
    await unlink(tmpFile).catch(() => {});
  }

  // Extract JSON from response (handle potential markdown fences)
  let jsonStr = stdout.trim();

  // Strip markdown code fences if present
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  // Try to find JSON object in the response
  const objMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (!objMatch) {
    throw new Error("AI did not return valid JSON");
  }

  const raw = JSON.parse(objMatch[0]);
  const parsed = BattleTurnResultSchema.parse(raw);

  return {
    narrative: parsed.narrative,
    creativity_score: parsed.creativity_score,
    damage_to_enemy: parsed.damage_to_enemy,
    damage_to_player: parsed.damage_to_player,
    player_status_effect:
      parsed.player_status_effect === "none"
        ? null
        : parsed.player_status_effect,
    enemy_status_effect:
      parsed.enemy_status_effect === "none"
        ? null
        : parsed.enemy_status_effect,
    enemy_action_narrative: parsed.enemy_action_narrative,
    battle_status: "ongoing", // Server determines this, not AI
  };
}

export function generateBattleIntro(enemy: Enemy): string {
  const intros: Record<number, string> = {
    1: `\n╔══════════════════════════════════════════╗\n║          👑 SLIME KING APPEARS!          ║\n╚══════════════════════════════════════════╝\n\nA wobbling mass of green slime wearing a tiny golden crown\nslides into the arena. It jiggles menacingly at you.\n\n"Hah! Another challenger? I'll absorb you in seconds!"\n\nHP: ${enemy.hp}  ATK: ${enemy.atk}  DEF: ${enemy.def}\nWeakness: ${enemy.weakness.join(", ")}\n`,
    2: `\n╔══════════════════════════════════════════╗\n║        🐺 SHADOW WOLF STALKS YOU!        ║\n╚══════════════════════════════════════════╝\n\nRed eyes glow from the darkness as a wolf made of living\nshadow phases into existence. It circles you silently.\n\n*The air grows cold. You hear nothing but your own heartbeat.*\n\nHP: ${enemy.hp}  ATK: ${enemy.atk}  DEF: ${enemy.def}\nWeakness: ${enemy.weakness.join(", ")}\n`,
    3: `\n╔══════════════════════════════════════════╗\n║      🗿 ANCIENT GOLEM AWAKENS!           ║\n╚══════════════════════════════════════════╝\n\nThe ground shakes as a towering construct of ancient stone\nrises before you. Glowing runes pulse across its body.\n\n"MORTAL... PROVE YOUR WORTH... OR BE CRUSHED..."\n\nHP: ${enemy.hp}  ATK: ${enemy.atk}  DEF: ${enemy.def}\nWeakness: ${enemy.weakness.join(", ")}\n`,
  };
  return intros[enemy.id] ?? `A wild ${enemy.name} appears!`;
}
