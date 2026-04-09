"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useI18n } from "@/lib/i18n";
import { useWallet } from "@/lib/wallet";
import HpBar from "./HpBar";
import BattleComic, { cropComicPanels } from "./BattleComic";

interface BattleScreenProps {
  battleId: string;
  enemyId: number;
  enemyName: string;
  enemyDescription: string;
  intro: string;
  initialBattle: BattleState;
  onBattleEnd: (result: {
    status: "victory" | "defeat" | "timeout";
    score: number;
    turns: number;
    enemyName: string;
    chain?: { txHash: string | null; tokensEarned: number };
  }) => void;
}

interface BattleState {
  playerHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  turn: number;
  maxTurns: number;
  status: string;
  score: number;
  activeEffects: Array<{ effect: string; turnsRemaining: number; target: string }>;
}

interface LogEntry {
  type: "intro" | "player" | "narrative" | "enemy" | "effect" | "system";
  text: string;
}

interface PendingTurn {
  turn: {
    narrative: string;
    enemyNarrative: string;
    damageToEnemy: number;
    damageToPlayer: number;
    creativityScore: number;
    playerEffect: string | null;
    enemyEffect: string | null;
  };
  updatedBattle: BattleState;
}

type ComicPhase = "idle" | "player-comic" | "enemy-comic";

const EFFECT_ICONS: Record<string, string> = {
  poison: "☠", stun: "⚡", shield: "🛡", heal: "❤", burn: "🔥",
};

const ENEMY_IMAGES: Record<number, string> = {
  1: "/enemies/slime-king.png",
  2: "/enemies/shadow-wolf.png",
  3: "/enemies/ancient-golem.png",
};

export default function BattleScreen({
  battleId, enemyId, enemyName, enemyDescription, intro, initialBattle, onBattleEnd,
}: BattleScreenProps) {
  const { t, locale } = useI18n();
  const { address: walletAddress } = useWallet();
  const [battle, setBattle] = useState<BattleState>(initialBattle);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [prompt, setPrompt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [chainResult, setChainResult] = useState<{ txHash: string | null; tokensEarned: number } | undefined>();
  const [comicPhase, setComicPhase] = useState<ComicPhase>("idle");
  const [allPanels, setAllPanels] = useState<string[]>([]);
  const [pendingTurn, setPendingTurn] = useState<PendingTurn | null>(null);

  useEffect(() => { setLog([{ type: "intro", text: intro }]); }, [intro]);
  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [log]);
  useEffect(() => { if (!submitting && comicPhase === "idle" && inputRef.current) inputRef.current.focus(); }, [submitting, comicPhase]);

  const requestBattleImage = useCallback(async (narrative: string, enemyNarrative: string) => {
    setImageLoading(true);
    try {
      const res = await fetch("/api/battle/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ narrative, enemyNarrative, enemyName, enemyDescription }),
      });
      const data = await res.json();
      if (data.image) {
        const panels = await cropComicPanels(data.image);
        if (panels.length === 4) { setAllPanels(panels); return; }
      }
    } catch { /* silent */ } finally { setImageLoading(false); }
    setAllPanels([]);
  }, [enemyName, enemyDescription]);

  useEffect(() => {
    if (allPanels.length === 4 && pendingTurn && comicPhase === "idle") setComicPhase("player-comic");
  }, [allPanels, pendingTurn, comicPhase]);

  const handlePlayerComicDismiss = useCallback(() => {
    if (!pendingTurn) return;
    const { turn, updatedBattle } = pendingTurn;
    const entries: LogEntry[] = [{ type: "enemy", text: turn.enemyNarrative }];
    if (turn.damageToPlayer > 0) entries.push({ type: "effect", text: t.damage_to_player(turn.damageToPlayer) });
    if (turn.playerEffect && turn.playerEffect !== "none")
      entries.push({ type: "effect", text: `  ${EFFECT_ICONS[turn.playerEffect] || "✦"} ${t.you_affected(turn.playerEffect)}` });
    setLog((prev) => [...prev, ...entries]);
    setComicPhase("enemy-comic");
    setBattle(updatedBattle);
  }, [pendingTurn, t]);

  const handleEnemyComicDismiss = useCallback(() => {
    if (!pendingTurn) return;
    const { updatedBattle } = pendingTurn;
    setLog((prev) => [...prev, { type: "system" as const, text: t.turn_separator(updatedBattle.turn, updatedBattle.maxTurns) }]);
    setComicPhase("idle");
    setAllPanels([]);
    setPendingTurn(null);
  }, [pendingTurn, t]);

  const showTurnAsTextOnly = useCallback((turn: PendingTurn["turn"], updatedBattle: BattleState) => {
    const entries: LogEntry[] = [{ type: "enemy", text: turn.enemyNarrative }];
    if (turn.damageToPlayer > 0) entries.push({ type: "effect", text: t.damage_to_player(turn.damageToPlayer) });
    if (turn.playerEffect && turn.playerEffect !== "none")
      entries.push({ type: "effect", text: `  ${EFFECT_ICONS[turn.playerEffect] || "✦"} ${t.you_affected(turn.playerEffect)}` });
    entries.push({ type: "system", text: t.turn_separator(updatedBattle.turn, updatedBattle.maxTurns) });
    setLog((prev) => [...prev, ...entries]);
    setBattle(updatedBattle);
  }, [t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || submitting || cooldown || comicPhase !== "idle") return;
    const playerPrompt = prompt.trim();
    setPrompt(""); setSubmitting(true); setError(null); setAllPanels([]); setPendingTurn(null);
    setLog((prev) => [...prev, { type: "player", text: `> ${playerPrompt}` }]);

    try {
      const res = await fetch("/api/battle/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ battleId, prompt: playerPrompt, locale, walletAddress }),
      });
      if (res.status === 429) { const data = await res.json(); setError(data.error); setSubmitting(false); return; }
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Failed to process turn"); }

      const data = await res.json();
      const { turn, battle: updatedBattle } = data;
      if (data.chain) setChainResult(data.chain);

      const playerEntries: LogEntry[] = [{ type: "narrative", text: turn.narrative }];
      if (turn.damageToEnemy > 0)
        playerEntries.push({ type: "effect", text: t.damage_to_enemy(turn.damageToEnemy, enemyName, turn.creativityScore) });
      if (turn.enemyEffect && turn.enemyEffect !== "none")
        playerEntries.push({ type: "effect", text: `  ${EFFECT_ICONS[turn.enemyEffect] || "✦"} ${t.affected_by(enemyName, turn.enemyEffect)}` });
      setLog((prev) => [...prev, ...playerEntries]);

      const pending: PendingTurn = { turn, updatedBattle };
      setPendingTurn(pending);
      requestBattleImage(turn.narrative, turn.enemyNarrative).then(() => {
        setTimeout(() => {
          setAllPanels((current) => { if (current.length === 0) { showTurnAsTextOnly(turn, updatedBattle); setPendingTurn(null); } return current; });
        }, 500);
      });
      setCooldown(true); setTimeout(() => setCooldown(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.gm_distracted);
    } finally { setSubmitting(false); }
  };

  const showingComic = comicPhase !== "idle" && allPanels.length === 4;

  return (
    <div className="fade-in flex flex-col" style={{ height: "calc(100vh - 2rem)" }}>
      {comicPhase === "player-comic" && allPanels.length === 4 && (
        <BattleComic panels={[allPanels[0], allPanels[1]]} labels={[t.panel_your_attack, t.panel_impact]} onDismiss={handlePlayerComicDismiss} />
      )}
      {comicPhase === "enemy-comic" && allPanels.length === 4 && (
        <BattleComic panels={[allPanels[2], allPanels[3]]} labels={[t.panel_enemy_strikes, t.panel_aftermath]} onDismiss={handleEnemyComicDismiss} />
      )}

      <div className="mb-4 p-3 border border-[var(--green-dim)] shrink-0">
        <div className="flex justify-between items-center mb-2">
          <span className="text-cyan glow-cyan">{t.you}</span>
          <span className="text-dim text-sm">{t.turn_label} {battle.turn}/{battle.maxTurns}</span>
          <span className="text-red glow-red flex items-center gap-2">
            {ENEMY_IMAGES[enemyId] && (
              <img src={ENEMY_IMAGES[enemyId]} alt={enemyName} className="w-8 h-8 rounded object-cover border border-gray-700" style={{ imageRendering: "pixelated" }} />
            )}
            {enemyName}
          </span>
        </div>
        <HpBar current={battle.playerHp} max={100} label={t.player_label} color="player" />
        <HpBar current={battle.enemyHp} max={battle.enemyMaxHp} label={enemyName.toUpperCase()} color="enemy" />
        {battle.activeEffects.length > 0 && (
          <div className="flex gap-3 mt-2 text-sm">
            {battle.activeEffects.map((eff, i) => (
              <span key={i} className={eff.target === "player" ? "text-red" : "text-magenta"}>
                {EFFECT_ICONS[eff.effect] || "✦"} {eff.target}:{eff.effect}({eff.turnsRemaining}t)
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 border border-[var(--green-dim)] mb-4 min-h-0">
        {log.map((entry, i) => (
          <div key={i} className={`mb-2 typewriter-reveal ${getLogClass(entry.type)}`}>
            <pre className="whitespace-pre-wrap font-[inherit]">{entry.text}</pre>
          </div>
        ))}
        {submitting && <div className="text-amber glow-amber"><span className="typing-dots">{t.gm_deliberates}</span></div>}
        {imageLoading && !showingComic && <div className="text-cyan text-sm"><span className="typing-dots">{t.generating_vision}</span></div>}
        <div ref={logEndRef} />
      </div>

      {battle.turn === 0 && !submitting && comicPhase === "idle" && (
        <div className="mb-3 text-sm shrink-0">
          <p className="text-dim mb-1">{t.example_prompts_label}</p>
          <div className="flex flex-wrap gap-2">
            {t.example_prompts.map((ex, i) => (
              <button key={i} onClick={() => setPrompt(ex)}
                className="text-dim hover:text-green text-left text-xs border border-[var(--dim)] px-2 py-1 hover:border-[var(--green-dim)] transition-colors">
                &quot;{ex}&quot;
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <div className="shrink-0 mb-2"><p className="text-red text-sm">{error}</p></div>}

      {battle.status === "active" && comicPhase === "idle" && (
        <form onSubmit={handleSubmit} className="flex gap-2 items-center shrink-0">
          <span className="text-green glow-green">{">"}</span>
          <input ref={inputRef} type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)}
            placeholder={submitting ? t.waiting : cooldown ? t.cooldown : t.describe_action}
            disabled={submitting || cooldown} maxLength={500} autoFocus />
          <span className="text-dim text-sm whitespace-nowrap">{prompt.length}/500</span>
          <button type="submit" disabled={submitting || cooldown || !prompt.trim()} className="terminal-btn text-sm">{t.send}</button>
        </form>
      )}

      {battle.status !== "active" && comicPhase === "idle" && (
        <div className="shrink-0 text-center py-3">
          <p className={`text-lg mb-3 ${battle.status === "victory" ? "text-green glow-green" : battle.status === "defeat" ? "text-red glow-red" : "text-amber glow-amber"}`}>
            {battle.status === "victory" ? t.enemy_defeated(enemyName) : battle.status === "defeat" ? t.you_fallen : t.battle_timeout}
          </p>
          <button onClick={() => onBattleEnd({ status: battle.status as "victory" | "defeat" | "timeout", score: battle.score, turns: battle.turn, enemyName, chain: chainResult })}
            className="terminal-btn text-green glow-green text-lg px-6 py-2">{t.view_results}</button>
        </div>
      )}
    </div>
  );
}

function getLogClass(type: LogEntry["type"]): string {
  switch (type) {
    case "intro": return "text-amber glow-amber";
    case "player": return "text-green glow-green";
    case "narrative": return "text-white";
    case "enemy": return "text-red";
    case "effect": return "text-magenta";
    case "system": return "text-dim text-center text-sm";
    default: return "text-white";
  }
}
