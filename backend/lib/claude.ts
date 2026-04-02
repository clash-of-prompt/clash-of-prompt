import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { z } from "zod";
import { Enemy } from "./enemies.js";
import { BattleState, AITurnResult } from "./game-engine.js";
import { buildSystemPrompt, buildTurnMessage } from "./prompts.js";

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
  playerPrompt: string,
  locale: string = "en"
): Promise<AITurnResult> {
  const systemPrompt = buildSystemPrompt(battle.enemy, locale);
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
  const tmpFile = join(tmpdir(), `clash-of-prompt-${Date.now()}.txt`);
  await writeFile(tmpFile, fullPrompt, "utf-8");

  let stdout: string;
  try {
    const result = await execAsync(
      `cat "${tmpFile}" | claude -p --output-format text`,
      {
        timeout: 45000,
        maxBuffer: 1024 * 1024,
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
    battle_status: "ongoing",
  };
}

export function generateBattleIntro(enemy: Enemy, locale: string = "en"): string {
  if (locale === "id") {
    const intros: Record<number, string> = {
      1: `\n╔══════════════════════════════════════════╗\n║        👑 SLIME KING MUNCUL!             ║\n╚══════════════════════════════════════════╝\n\nGumpalan slime hijau yang bergoyang-goyang memakai mahkota\nemas kecil meluncur ke arena. Dia bergetar mengancam.\n\n"Hah! Penantang lagi? Aku serap kau dalam hitungan detik!"\n\nHP: ${enemy.hp}  ATK: ${enemy.atk}  DEF: ${enemy.def}\nKelemahan: ${enemy.weakness.join(", ")}\n`,
      2: `\n╔══════════════════════════════════════════╗\n║      🐺 SHADOW WOLF MENGINTAIMU!         ║\n╚══════════════════════════════════════════╝\n\nMata merah menyala dari kegelapan saat serigala bayangan\nmewujud. Dia mengitarimu dalam diam.\n\n*Udara menjadi dingin. Kau hanya mendengar detak jantungmu sendiri.*\n\nHP: ${enemy.hp}  ATK: ${enemy.atk}  DEF: ${enemy.def}\nKelemahan: ${enemy.weakness.join(", ")}\n`,
      3: `\n╔══════════════════════════════════════════╗\n║      🗿 ANCIENT GOLEM BANGKIT!           ║\n╚══════════════════════════════════════════╝\n\nTanah bergetar saat konstruksi batu kuno menjulang\ndi hadapanmu. Rune-rune bercahaya berdenyut di tubuhnya.\n\n"MANUSIA FANA... BUKTIKAN KELAYAKANMU... ATAU HANCUR LEBUR..."\n\nHP: ${enemy.hp}  ATK: ${enemy.atk}  DEF: ${enemy.def}\nKelemahan: ${enemy.weakness.join(", ")}\n`,
    };
    return intros[enemy.id] ?? `${enemy.name} muncul!`;
  }

  const intros: Record<number, string> = {
    1: `\n╔══════════════════════════════════════════╗\n║          👑 SLIME KING APPEARS!          ║\n╚══════════════════════════════════════════╝\n\nA wobbling mass of green slime wearing a tiny golden crown\nslides into the arena. It jiggles menacingly at you.\n\n"Hah! Another challenger? I'll absorb you in seconds!"\n\nHP: ${enemy.hp}  ATK: ${enemy.atk}  DEF: ${enemy.def}\nWeakness: ${enemy.weakness.join(", ")}\n`,
    2: `\n╔══════════════════════════════════════════╗\n║        🐺 SHADOW WOLF STALKS YOU!        ║\n╚══════════════════════════════════════════╝\n\nRed eyes glow from the darkness as a wolf made of living\nshadow phases into existence. It circles you silently.\n\n*The air grows cold. You hear nothing but your own heartbeat.*\n\nHP: ${enemy.hp}  ATK: ${enemy.atk}  DEF: ${enemy.def}\nWeakness: ${enemy.weakness.join(", ")}\n`,
    3: `\n╔══════════════════════════════════════════╗\n║      🗿 ANCIENT GOLEM AWAKENS!           ║\n╚══════════════════════════════════════════╝\n\nThe ground shakes as a towering construct of ancient stone\nrises before you. Glowing runes pulse across its body.\n\n"MORTAL... PROVE YOUR WORTH... OR BE CRUSHED..."\n\nHP: ${enemy.hp}  ATK: ${enemy.atk}  DEF: ${enemy.def}\nWeakness: ${enemy.weakness.join(", ")}\n`,
  };
  return intros[enemy.id] ?? `A wild ${enemy.name} appears!`;
}
