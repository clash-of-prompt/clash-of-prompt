import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Use initiad CLI directly instead of @initia/initia.js SDK
// (SDK has ESM compatibility issues with Node.js)

function getConfig() {
  const lcdUrl = process.env.MINITIA_LCD_URL;
  const chainId = process.env.MINITIA_CHAIN_ID;
  const moduleAddress = process.env.MODULE_ADDRESS;

  if (!lcdUrl || !chainId || !moduleAddress) return null;

  return { lcdUrl, chainId, moduleAddress };
}

async function execMove(
  moduleName: string,
  functionName: string,
  args: string[]
): Promise<string | null> {
  const config = getConfig();
  if (!config) return null;

  const argsJson = JSON.stringify(args);

  const cmd = [
    "initiad tx move execute",
    config.moduleAddress,
    moduleName,
    functionName,
    `--args '${argsJson}'`,
    `--from ${process.env.CHAIN_KEY_NAME || "gasstation"}`,
    `--chain-id ${config.chainId}`,
    "--node http://127.0.0.1:26657",
    "--keyring-backend test",
    `--home ${process.env.MINITIA_HOME || process.env.HOME + "/.minitia"}`,
    "--gas auto",
    "--gas-adjustment 1.5",
    "--yes",
    "--output json",
    "2>&1",
  ].join(" ");

  try {
    const home = process.env.HOME || "/Users/askar";
    const env = {
      ...process.env,
      HOME: home,
      PATH: `${home}/.local/bin:/usr/local/bin:/usr/bin:/bin:${process.env.PATH || ""}`,
      DYLD_LIBRARY_PATH: `${home}/.local/bin`,
    };

    console.log(`[Chain] Executing: ${moduleName}::${functionName}`);
    const { stdout, stderr } = await execAsync(cmd, { timeout: 30000, env });

    if (stderr) {
      console.log(`[Chain] stderr: ${stderr.trim()}`);
    }

    // stdout may contain "gas estimate: NNN\n{json}" — extract JSON
    const jsonMatch = stdout.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error(`[Chain] No JSON in output: ${stdout.slice(0, 200)}`);
      return null;
    }

    const result = JSON.parse(jsonMatch[0]);
    const txhash = result.txhash || null;
    if (txhash) {
      console.log(`[Chain] ${moduleName}::${functionName} tx: ${txhash}`);
    }
    return txhash;
  } catch (error: any) {
    // initiad outputs "gas estimate: NNN" to stderr which makes exec think it failed
    // Check if stdout still has valid JSON
    if (error?.stdout) {
      const jsonMatch = error.stdout.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const result = JSON.parse(jsonMatch[0]);
          if (result.txhash && result.code === 0) {
            console.log(`[Chain] ${moduleName}::${functionName} tx (from stderr path): ${result.txhash}`);
            return result.txhash;
          }
        } catch {}
      }
      console.error(`[Chain] ${moduleName}::${functionName} stdout: ${error.stdout.slice(0, 300)}`);
    }
    console.error(`[Chain] ${moduleName}::${functionName} failed:`, error?.message?.slice(0, 200) || error);
    if (error?.stderr) console.error(`[Chain] stderr: ${error.stderr.slice(0, 300)}`);
    return null;
  }
}

// ── On-chain functions ────────────────────────────────────────

export async function recordScore(
  playerAddress: string,
  enemyId: number,
  score: number,
  turns: number,
  avgCreativity: number,
  isPvp: boolean
): Promise<string | null> {
  return execMove("game_arena", "record_score", [
    `address:${playerAddress}`,
    `u64:${enemyId}`,
    `u64:${score}`,
    `u64:${turns}`,
    `u64:${Math.round(avgCreativity * 100)}`,
    `bool:${isPvp}`,
  ]);
}

export async function mintClashToken(
  toAddress: string,
  amount: number
): Promise<string | null> {
  // Use game_arena::reward_clash instead of clash_token::mint
  return execMove("game_arena", "reward_clash", [
    `address:${toAddress}`,
    `u64:${amount}`,
  ]);
}

export async function mintVictoryNft(
  toAddress: string,
  enemyName: string,
  score: number,
  turns: number,
  avgCreativity: number,
  imageUrl: string
): Promise<string | null> {
  return execMove("victory_nft", "mint_victory", [
    `address:${toAddress}`,
    `string:${enemyName}`,
    `u64:${score}`,
    `u64:${turns}`,
    `u64:${Math.round(avgCreativity * 100)}`,
    `string:${imageUrl || ""}`,
  ]);
}

export function calculateTokenReward(
  score: number,
  turns: number,
  maxTurns: number,
  avgCreativity: number
): number {
  const baseReward = 100;
  return Math.round(
    baseReward * (avgCreativity / 10) * (1 + (maxTurns - turns) / maxTurns)
  );
}

export async function createPvpLobby(
  _creatorAddress: string,
  enemyId: number,
  wager: number
): Promise<string | null> {
  return execMove("game_arena", "create_lobby", [
    `u64:${enemyId}`,
    `u64:${wager}`,
  ]);
}

export async function joinPvpLobby(
  _opponentAddress: string,
  lobbyId: number
): Promise<string | null> {
  return execMove("game_arena", "join_lobby", [
    `u64:${lobbyId}`,
  ]);
}

export async function submitPvpResult(
  lobbyId: number,
  playerAddress: string,
  score: number
): Promise<string | null> {
  return execMove("game_arena", "submit_result", [
    `u64:${lobbyId}`,
    `address:${playerAddress}`,
    `u64:${score}`,
  ]);
}

export async function settlePvp(lobbyId: number): Promise<string | null> {
  return execMove("game_arena", "settle", [
    `u64:${lobbyId}`,
  ]);
}
