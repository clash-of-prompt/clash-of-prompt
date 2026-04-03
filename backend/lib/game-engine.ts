import { Enemy, getEnemyById } from "./enemies.js";

// ── Game Constants (server-side, NOT AI decisions) ──────────────
export const GAME_RULES = {
  PLAYER_HP: 100,
  BASE_DAMAGE_MIN: 5,
  BASE_DAMAGE_MAX: 20,
  CREATIVITY_MULT_MIN: 0.5,
  CREATIVITY_MULT_MAX: 2.0,
  MAX_TURNS: 20,
  PROMPT_MAX_LENGTH: 500,
  RATE_LIMIT_MS: 3000,
  STATUS_EFFECTS: ["poison", "stun", "shield", "heal", "burn"] as const,
  STATUS_MAX_DURATION: 3,
  POISON_DAMAGE: 5,
  HEAL_AMOUNT: 10,
  BURN_DAMAGE: 7,
} as const;

export type StatusEffect = (typeof GAME_RULES.STATUS_EFFECTS)[number];

export interface ActiveEffect {
  effect: StatusEffect;
  turnsRemaining: number;
  target: "player" | "enemy";
}

export interface BattleState {
  id: string;
  enemyId: number;
  enemy: Enemy;
  playerHp: number;
  enemyHp: number;
  turn: number;
  activeEffects: ActiveEffect[];
  turnHistory: TurnRecord[];
  status: "active" | "victory" | "defeat" | "timeout";
  score: number;
  createdAt: number;
  lastActionAt: number;
  walletAddress?: string;
}

export interface TurnRecord {
  turn: number;
  playerPrompt: string;
  narrative: string;
  enemyNarrative: string;
  damageToEnemy: number;
  damageToPlayer: number;
  creativityScore: number;
  playerEffect: string | null;
  enemyEffect: string | null;
}

export interface AITurnResult {
  narrative: string;
  creativity_score: number;
  damage_to_enemy: number;
  damage_to_player: number;
  player_status_effect: string | null;
  enemy_status_effect: string | null;
  enemy_action_narrative: string;
  battle_status: "ongoing" | "victory" | "defeat";
}

// ── In-memory battle store ──────────────────────────────────────
const battles = new Map<string, BattleState>();

// Expire stale battles (30 min)
const BATTLE_EXPIRY_MS = 30 * 60 * 1000;

function cleanupStaleBattles() {
  const now = Date.now();
  for (const [id, battle] of battles) {
    if (now - battle.lastActionAt > BATTLE_EXPIRY_MS) {
      battles.delete(id);
    }
  }
}

// ── Battle Management ───────────────────────────────────────────

export function createBattle(enemyId: number): BattleState | null {
  cleanupStaleBattles();

  const enemy = getEnemyById(enemyId);
  if (!enemy) return null;

  const id = generateBattleId();
  const battle: BattleState = {
    id,
    enemyId,
    enemy,
    playerHp: GAME_RULES.PLAYER_HP,
    enemyHp: enemy.hp,
    turn: 0,
    activeEffects: [],
    turnHistory: [],
    status: "active",
    score: 0,
    createdAt: Date.now(),
    lastActionAt: Date.now(),
  };

  battles.set(id, battle);
  return battle;
}

export function getBattle(id: string): BattleState | null {
  return battles.get(id) ?? null;
}

export function processTurn(
  battleId: string,
  playerPrompt: string,
  aiResult: AITurnResult
): BattleState | null {
  const battle = battles.get(battleId);
  if (!battle || battle.status !== "active") return null;

  battle.turn += 1;
  battle.lastActionAt = Date.now();

  // Clamp AI values within game rules
  const creativityScore = clamp(aiResult.creativity_score, 1, 10);
  const creativityMult = mapRange(
    creativityScore,
    1,
    10,
    GAME_RULES.CREATIVITY_MULT_MIN,
    GAME_RULES.CREATIVITY_MULT_MAX
  );

  let damageToEnemy = clamp(
    Math.round(aiResult.damage_to_enemy * creativityMult),
    GAME_RULES.BASE_DAMAGE_MIN,
    GAME_RULES.BASE_DAMAGE_MAX * GAME_RULES.CREATIVITY_MULT_MAX
  );

  let damageToPlayer = clamp(
    aiResult.damage_to_player,
    0,
    battle.enemy.atk + 5
  );

  // Apply status effects
  applyStatusEffects(battle);

  // Check if player is stunned (enemy still attacks)
  const playerStunned = battle.activeEffects.some(
    (e) => e.effect === "stun" && e.target === "player"
  );
  if (playerStunned) {
    damageToEnemy = 0;
  }

  // Check if enemy is stunned
  const enemyStunned = battle.activeEffects.some(
    (e) => e.effect === "stun" && e.target === "enemy"
  );
  if (enemyStunned) {
    damageToPlayer = 0;
  }

  // Check shield effects
  const playerShielded = battle.activeEffects.some(
    (e) => e.effect === "shield" && e.target === "player"
  );
  if (playerShielded) {
    damageToPlayer = Math.round(damageToPlayer * 0.5);
  }

  const enemyShielded = battle.activeEffects.some(
    (e) => e.effect === "shield" && e.target === "enemy"
  );
  if (enemyShielded) {
    damageToEnemy = Math.round(damageToEnemy * 0.5);
  }

  // Apply damage
  battle.enemyHp = Math.max(0, battle.enemyHp - damageToEnemy);
  battle.playerHp = Math.max(0, battle.playerHp - damageToPlayer);

  // Add new status effects from AI
  if (
    aiResult.player_status_effect &&
    aiResult.player_status_effect !== "none"
  ) {
    addStatusEffect(battle, aiResult.player_status_effect as StatusEffect, "player");
  }
  if (aiResult.enemy_status_effect && aiResult.enemy_status_effect !== "none") {
    addStatusEffect(battle, aiResult.enemy_status_effect as StatusEffect, "enemy");
  }

  // Record turn
  battle.turnHistory.push({
    turn: battle.turn,
    playerPrompt,
    narrative: aiResult.narrative,
    enemyNarrative: aiResult.enemy_action_narrative,
    damageToEnemy,
    damageToPlayer,
    creativityScore,
    playerEffect: aiResult.player_status_effect,
    enemyEffect: aiResult.enemy_status_effect,
  });

  // Determine battle status
  if (battle.enemyHp <= 0) {
    battle.status = "victory";
  } else if (battle.playerHp <= 0) {
    battle.status = "defeat";
  } else if (battle.turn >= GAME_RULES.MAX_TURNS) {
    battle.status = "timeout";
  }

  // Calculate score
  if (battle.status !== "active") {
    battle.score = calculateScore(battle);
  }

  return battle;
}

// ── Status Effects ──────────────────────────────────────────────

function applyStatusEffects(battle: BattleState) {
  const toRemove: number[] = [];

  for (let i = 0; i < battle.activeEffects.length; i++) {
    const effect = battle.activeEffects[i];

    if (effect.effect === "poison") {
      if (effect.target === "player") {
        battle.playerHp = Math.max(0, battle.playerHp - GAME_RULES.POISON_DAMAGE);
      } else {
        battle.enemyHp = Math.max(0, battle.enemyHp - GAME_RULES.POISON_DAMAGE);
      }
    }

    if (effect.effect === "burn") {
      if (effect.target === "player") {
        battle.playerHp = Math.max(0, battle.playerHp - GAME_RULES.BURN_DAMAGE);
      } else {
        battle.enemyHp = Math.max(0, battle.enemyHp - GAME_RULES.BURN_DAMAGE);
      }
    }

    if (effect.effect === "heal") {
      if (effect.target === "player") {
        battle.playerHp = Math.min(GAME_RULES.PLAYER_HP, battle.playerHp + GAME_RULES.HEAL_AMOUNT);
      } else {
        battle.enemyHp = Math.min(battle.enemy.hp, battle.enemyHp + GAME_RULES.HEAL_AMOUNT);
      }
    }

    effect.turnsRemaining -= 1;
    if (effect.turnsRemaining <= 0) {
      toRemove.push(i);
    }
  }

  // Remove expired effects (reverse order to maintain indices)
  for (let i = toRemove.length - 1; i >= 0; i--) {
    battle.activeEffects.splice(toRemove[i], 1);
  }
}

function addStatusEffect(
  battle: BattleState,
  effect: StatusEffect,
  target: "player" | "enemy"
) {
  if (!GAME_RULES.STATUS_EFFECTS.includes(effect)) return;

  // Don't stack same effect on same target
  const existing = battle.activeEffects.find(
    (e) => e.effect === effect && e.target === target
  );
  if (existing) {
    existing.turnsRemaining = Math.min(
      GAME_RULES.STATUS_MAX_DURATION,
      existing.turnsRemaining + 1
    );
    return;
  }

  battle.activeEffects.push({
    effect,
    turnsRemaining: 2,
    target,
  });
}

// ── Scoring ─────────────────────────────────────────────────────

function calculateScore(battle: BattleState): number {
  if (battle.status === "defeat") {
    const damageDealt = battle.enemy.hp - battle.enemyHp;
    const damagePercent = damageDealt / battle.enemy.hp;
    return Math.round(damagePercent * 30);
  }

  let score = 0;
  score += battle.status === "victory" ? 50 : 20;

  const turnBonus = Math.max(0, GAME_RULES.MAX_TURNS - battle.turn) * 2;
  score += turnBonus;

  const hpPercent = battle.playerHp / GAME_RULES.PLAYER_HP;
  score += Math.round(hpPercent * 20);

  const avgCreativity =
    battle.turnHistory.reduce((sum, t) => sum + t.creativityScore, 0) /
    battle.turnHistory.length;
  score += Math.round(avgCreativity * 3);

  const diffMult =
    battle.enemy.difficulty === "boss"
      ? 2.0
      : battle.enemy.difficulty === "medium"
        ? 1.5
        : 1.0;
  score = Math.round(score * diffMult);

  return score;
}

// ── Helpers ─────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

function generateBattleId(): string {
  return `battle_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ── Public Helpers ──────────────────────────────────────────────

export function getBattleSummary(battle: BattleState) {
  return {
    id: battle.id,
    enemyId: battle.enemyId,
    enemyName: battle.enemy.name,
    playerHp: battle.playerHp,
    enemyHp: battle.enemyHp,
    enemyMaxHp: battle.enemy.hp,
    turn: battle.turn,
    maxTurns: GAME_RULES.MAX_TURNS,
    activeEffects: battle.activeEffects,
    status: battle.status,
    score: battle.score,
  };
}

export function getLastTurns(battle: BattleState, count: number = 3) {
  return battle.turnHistory.slice(-count);
}

export function validatePrompt(prompt: string): {
  valid: boolean;
  error?: string;
} {
  if (!prompt || prompt.trim().length === 0) {
    return { valid: false, error: "Prompt cannot be empty" };
  }
  if (prompt.length > GAME_RULES.PROMPT_MAX_LENGTH) {
    return {
      valid: false,
      error: `Prompt too long (max ${GAME_RULES.PROMPT_MAX_LENGTH} chars)`,
    };
  }
  return { valid: true };
}
