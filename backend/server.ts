import http from "node:http";
import {
  createBattle,
  getBattle,
  processTurn,
  validatePrompt,
  getBattleSummary,
  GAME_RULES,
} from "./lib/game-engine.js";
import { getAIBattleTurn, generateBattleIntro } from "./lib/claude.js";
import { generateBattleImage } from "./lib/gemini.js";
import { buildImagePrompt } from "./lib/image-prompt.js";
import { ENEMIES, getEnemyById } from "./lib/enemies.js";

const PORT = parseInt(process.env.PORT || "8080", 10);

// Simple rate limiter (per battle)
const lastTurnTime = new Map<string, number>();

// CORS helper
function setCors(res: http.ServerResponse, req: http.IncomingMessage) {
  const origin = req.headers.origin || "*";
  const allowed = process.env.ALLOWED_ORIGINS;
  if (allowed) {
    const origins = allowed.split(",").map((o) => o.trim());
    if (origins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
  } else {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function json(res: http.ServerResponse, data: unknown, status = 200) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

async function readBody(req: http.IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString();
}

const server = http.createServer(async (req, res) => {
  setCors(res, req);

  // Handle preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || "/", `http://localhost:${PORT}`);
  const path = url.pathname;

  try {
    // GET /health
    if (path === "/health" && req.method === "GET") {
      return json(res, { status: "ok" });
    }

    // GET /api/enemies
    if (path === "/api/enemies" && req.method === "GET") {
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
      return json(res, { enemies });
    }

    // POST /api/battle/start
    if (path === "/api/battle/start" && req.method === "POST") {
      const body = JSON.parse(await readBody(req));
      const { enemyId, locale } = body;

      if (!enemyId || typeof enemyId !== "number") {
        return json(res, { error: "enemyId is required and must be a number" }, 400);
      }

      const enemy = getEnemyById(enemyId);
      if (!enemy) {
        return json(res, { error: `Enemy with id ${enemyId} not found` }, 404);
      }

      const battle = createBattle(enemyId);
      if (!battle) {
        return json(res, { error: "Failed to create battle" }, 500);
      }

      const intro = generateBattleIntro(enemy, locale || "en");
      return json(res, {
        battle: getBattleSummary(battle),
        intro,
        message: `Battle started against ${enemy.name}!`,
      });
    }

    // GET /api/battle/status?id=xxx
    if (path === "/api/battle/status" && req.method === "GET") {
      const battleId = url.searchParams.get("id");
      if (!battleId) {
        return json(res, { error: "Battle id is required" }, 400);
      }

      const battle = getBattle(battleId);
      if (!battle) {
        return json(res, { error: "Battle not found or expired" }, 404);
      }

      return json(res, { battle: getBattleSummary(battle) });
    }

    // POST /api/battle/turn
    if (path === "/api/battle/turn" && req.method === "POST") {
      const body = JSON.parse(await readBody(req));
      const { battleId, prompt, locale } = body;

      if (!battleId || typeof battleId !== "string") {
        return json(res, { error: "battleId is required" }, 400);
      }
      if (!prompt || typeof prompt !== "string") {
        return json(res, { error: "prompt is required" }, 400);
      }

      const validation = validatePrompt(prompt);
      if (!validation.valid) {
        return json(res, { error: validation.error }, 400);
      }

      const battle = getBattle(battleId);
      if (!battle) {
        return json(res, { error: "Battle not found or expired" }, 404);
      }
      if (battle.status !== "active") {
        return json(res, { error: `Battle is already ${battle.status}` }, 400);
      }

      // Rate limit
      const lastTime = lastTurnTime.get(battleId) ?? 0;
      const now = Date.now();
      if (now - lastTime < GAME_RULES.RATE_LIMIT_MS) {
        const waitMs = GAME_RULES.RATE_LIMIT_MS - (now - lastTime);
        return json(res, { error: `Too fast! Wait ${Math.ceil(waitMs / 1000)}s before next turn` }, 429);
      }
      lastTurnTime.set(battleId, now);

      const aiResult = await getAIBattleTurn(battle, prompt.trim(), locale || "en");
      const updatedBattle = processTurn(battleId, prompt.trim(), aiResult);
      if (!updatedBattle) {
        return json(res, { error: "Failed to process turn" }, 500);
      }

      const lastTurn = updatedBattle.turnHistory[updatedBattle.turnHistory.length - 1];
      return json(res, {
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
    }

    // POST /api/battle/image
    if (path === "/api/battle/image" && req.method === "POST") {
      const body = JSON.parse(await readBody(req));
      const { narrative, enemyNarrative, enemyName, enemyDescription } = body;

      if (!narrative || !enemyNarrative || !enemyName) {
        return json(res, { error: "Missing required fields" }, 400);
      }

      const imagePrompt = buildImagePrompt({
        narrative,
        enemyNarrative,
        enemyName,
        enemyDescription: enemyDescription || enemyName,
      });

      const base64Image = await generateBattleImage(imagePrompt);
      if (!base64Image) {
        return json(res, { image: null, error: "Image generation unavailable" });
      }
      return json(res, { image: base64Image });

    }

    // 404
    json(res, { error: "Not found" }, 404);
  } catch (error) {
    console.error("Server error:", error);
    json(res, { error: "Internal server error" }, 500);
  }
});

server.listen(PORT, () => {
  console.log(`Clash of Prompt backend running on port ${PORT}`);
});
