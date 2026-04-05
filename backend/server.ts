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
import {
  recordScore,
  mintClashToken,
  mintVictoryNft,
  calculateTokenReward,
} from "./lib/chain.js";

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

    // GET /api/leaderboard
    if (path === "/api/leaderboard" && req.method === "GET") {
      try {
        const lcdUrl = process.env.MINITIA_LCD_URL;
        const moduleAddr = process.env.MODULE_ADDRESS;
        if (!lcdUrl || !moduleAddr) {
          return json(res, { entries: [], source: "no-chain" });
        }
        const r = await fetch(`${lcdUrl}/initia/move/v1/accounts/${moduleAddr}/modules/game_arena/view_functions/get_leaderboard`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ args: [] }),
        });
        const data = await r.json();
        const entries = data.data ? JSON.parse(data.data) : [];
        return json(res, { entries, source: "on-chain" });
      } catch (e) {
        console.error("[Leaderboard] Error:", e);
        return json(res, { entries: [], source: "error" });
      }
    }

    // GET /api/clash-balance?address=xxx
    if (path === "/api/clash-balance" && req.method === "GET") {
      const address = url.searchParams.get("address");
      if (!address) return json(res, { balance: 0 });
      try {
        const lcdUrl = process.env.MINITIA_LCD_URL;
        const moduleAddr = process.env.MODULE_ADDRESS;
        if (!lcdUrl || !moduleAddr) return json(res, { balance: 0 });
        // BCS encode address: 32 bytes, left-padded with zeros
        // Convert bech32 address to hex first
        const { execSync } = await import("child_process");
        const home = process.env.HOME || "/Users/askar";
        const debugOut = execSync(
          `initiad debug addr ${address} 2>&1`,
          { env: { PATH: `${home}/.local/bin:/usr/bin:/bin`, HOME: home }, timeout: 5000 }
        ).toString();
        const hexMatch = debugOut.match(/Address \(hex\): ([A-Fa-f0-9]+)/);
        if (!hexMatch) return json(res, { balance: 0 });

        const addrHex = hexMatch[1].toLowerCase();
        const bcsBytes = Buffer.alloc(32);
        Buffer.from(addrHex, "hex").copy(bcsBytes, 12);
        const bcsBase64 = bcsBytes.toString("base64");

        const r = await fetch(`${lcdUrl}/initia/move/v1/accounts/${moduleAddr}/modules/game_arena/view_functions/get_clash_balance`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ args: [bcsBase64] }),
        });
        const data = await r.json();
        const balance = data.data ? parseInt(JSON.parse(data.data)) : 0;
        return json(res, { balance });
      } catch (e) {
        console.error("[Balance] Error:", e);
        return json(res, { balance: 0 });
      }
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
      const { battleId, prompt, locale, walletAddress } = body;
      console.log(`[Turn] battleId=${battleId}, walletAddress=${walletAddress || "NONE"}`);

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

      // Store wallet address if provided
      if (walletAddress && typeof walletAddress === "string") {
        battle.walletAddress = walletAddress;
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

      // Chain integration on victory
      let chain: { txHash: string | null; tokensEarned: number } | undefined;
      console.log(`[Turn] status=${updatedBattle.status}, wallet=${updatedBattle.walletAddress || "NONE"}`);
      if (updatedBattle.status === "victory" && updatedBattle.walletAddress) {
        console.log("[Chain] Victory detected! Firing on-chain calls...");
        const avgCreativity =
          updatedBattle.turnHistory.reduce((sum, t) => sum + t.creativityScore, 0) /
          updatedBattle.turnHistory.length;

        const tokensEarned = calculateTokenReward(
          updatedBattle.score,
          updatedBattle.turn,
          GAME_RULES.MAX_TURNS,
          avgCreativity
        );

        // Fire chain calls in parallel, don't block response on failure
        const [scoreTx, mintTx, nftTx] = await Promise.all([
          recordScore(
            updatedBattle.walletAddress,
            updatedBattle.enemyId,
            updatedBattle.score,
            updatedBattle.turn,
            avgCreativity,
            false
          ),
          mintClashToken(updatedBattle.walletAddress, tokensEarned),
          mintVictoryNft(
            updatedBattle.walletAddress,
            updatedBattle.enemy.name,
            updatedBattle.score,
            updatedBattle.turn,
            avgCreativity,
            "" // imageUrl filled by client later or empty
          ),
        ]);

        chain = {
          txHash: scoreTx || mintTx || nftTx || null,
          tokensEarned,
        };
      }

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
        ...(chain ? { chain } : {}),
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
