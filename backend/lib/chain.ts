import { LCDClient, MnemonicKey, Wallet, MsgExecute } from "@initia/initia.js";

// ── Lazy initialization (matches gemini.ts pattern) ────────────

function getClient(): { lcd: LCDClient; wallet: Wallet; moduleAddress: string } | null {
  const lcdUrl = process.env.MINITIA_LCD_URL;
  const chainId = process.env.MINITIA_CHAIN_ID;
  const mnemonic = process.env.BACKEND_MNEMONIC;
  const moduleAddress = process.env.MODULE_ADDRESS;

  if (!lcdUrl || !chainId || !mnemonic || !moduleAddress) return null;

  const lcd = new LCDClient(lcdUrl, {
    chainId,
    gasPrices: "0.15uinit",
    gasAdjustment: "1.5",
  });

  const key = new MnemonicKey({ mnemonic });
  const wallet = new Wallet(lcd, key);

  return { lcd, wallet, moduleAddress };
}

// ── On-chain functions ─────────────────────────────────────────

export async function recordScore(
  playerAddress: string,
  enemyId: number,
  score: number,
  turns: number,
  avgCreativity: number,
  isPvp: boolean
): Promise<string | null> {
  const client = getClient();
  if (!client) return null;

  try {
    const msg = new MsgExecute(
      client.wallet.key.accAddress,
      client.moduleAddress,
      "game_arena",
      "record_score",
      [],
      [
        JSON.stringify(playerAddress),
        JSON.stringify(enemyId),
        JSON.stringify(score),
        JSON.stringify(turns),
        JSON.stringify(Math.round(avgCreativity * 100)),
        JSON.stringify(isPvp),
      ]
    );

    const tx = await client.wallet.createAndSignTx({ msgs: [msg] });
    const result = await client.lcd.tx.broadcast(tx);
    return result.txhash;
  } catch (error) {
    console.error("recordScore failed:", error instanceof Error ? error.message : error);
    return null;
  }
}

export async function mintClashToken(
  toAddress: string,
  amount: number
): Promise<string | null> {
  const client = getClient();
  if (!client) return null;

  try {
    const msg = new MsgExecute(
      client.wallet.key.accAddress,
      client.moduleAddress,
      "clash_token",
      "mint",
      [],
      [JSON.stringify(toAddress), JSON.stringify(amount)]
    );

    const tx = await client.wallet.createAndSignTx({ msgs: [msg] });
    const result = await client.lcd.tx.broadcast(tx);
    return result.txhash;
  } catch (error) {
    console.error("mintClashToken failed:", error instanceof Error ? error.message : error);
    return null;
  }
}

export async function mintVictoryNft(
  toAddress: string,
  enemyName: string,
  score: number,
  turns: number,
  avgCreativity: number,
  imageUrl: string
): Promise<string | null> {
  const client = getClient();
  if (!client) return null;

  try {
    const msg = new MsgExecute(
      client.wallet.key.accAddress,
      client.moduleAddress,
      "victory_nft",
      "mint_victory",
      [],
      [
        JSON.stringify(toAddress),
        JSON.stringify(enemyName),
        JSON.stringify(score),
        JSON.stringify(turns),
        JSON.stringify(Math.round(avgCreativity * 100)),
        JSON.stringify(imageUrl),
      ]
    );

    const tx = await client.wallet.createAndSignTx({ msgs: [msg] });
    const result = await client.lcd.tx.broadcast(tx);
    return result.txhash;
  } catch (error) {
    console.error("mintVictoryNft failed:", error instanceof Error ? error.message : error);
    return null;
  }
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
  creatorAddress: string,
  enemyId: number,
  wager: number
): Promise<string | null> {
  const client = getClient();
  if (!client) return null;

  try {
    const msg = new MsgExecute(
      client.wallet.key.accAddress,
      client.moduleAddress,
      "game_arena",
      "create_pvp_lobby",
      [],
      [
        JSON.stringify(creatorAddress),
        JSON.stringify(enemyId),
        JSON.stringify(wager),
      ]
    );

    const tx = await client.wallet.createAndSignTx({ msgs: [msg] });
    const result = await client.lcd.tx.broadcast(tx);
    return result.txhash;
  } catch (error) {
    console.error("createPvpLobby failed:", error instanceof Error ? error.message : error);
    return null;
  }
}

export async function joinPvpLobby(
  opponentAddress: string,
  lobbyId: number
): Promise<string | null> {
  const client = getClient();
  if (!client) return null;

  try {
    const msg = new MsgExecute(
      client.wallet.key.accAddress,
      client.moduleAddress,
      "game_arena",
      "join_pvp_lobby",
      [],
      [JSON.stringify(opponentAddress), JSON.stringify(lobbyId)]
    );

    const tx = await client.wallet.createAndSignTx({ msgs: [msg] });
    const result = await client.lcd.tx.broadcast(tx);
    return result.txhash;
  } catch (error) {
    console.error("joinPvpLobby failed:", error instanceof Error ? error.message : error);
    return null;
  }
}

export async function submitPvpResult(
  lobbyId: number,
  playerAddress: string,
  score: number
): Promise<string | null> {
  const client = getClient();
  if (!client) return null;

  try {
    const msg = new MsgExecute(
      client.wallet.key.accAddress,
      client.moduleAddress,
      "game_arena",
      "submit_pvp_result",
      [],
      [
        JSON.stringify(lobbyId),
        JSON.stringify(playerAddress),
        JSON.stringify(score),
      ]
    );

    const tx = await client.wallet.createAndSignTx({ msgs: [msg] });
    const result = await client.lcd.tx.broadcast(tx);
    return result.txhash;
  } catch (error) {
    console.error("submitPvpResult failed:", error instanceof Error ? error.message : error);
    return null;
  }
}

export async function settlePvp(lobbyId: number): Promise<string | null> {
  const client = getClient();
  if (!client) return null;

  try {
    const msg = new MsgExecute(
      client.wallet.key.accAddress,
      client.moduleAddress,
      "game_arena",
      "settle_pvp",
      [],
      [JSON.stringify(lobbyId)]
    );

    const tx = await client.wallet.createAndSignTx({ msgs: [msg] });
    const result = await client.lcd.tx.broadcast(tx);
    return result.txhash;
  } catch (error) {
    console.error("settlePvp failed:", error instanceof Error ? error.message : error);
    return null;
  }
}
