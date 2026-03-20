"use client";

import { useI18n } from "@/lib/i18n";

interface BattleEndScreenProps {
  result: { status: "victory" | "defeat" | "timeout"; score: number; turns: number; enemyName: string };
  onPlayAgain: () => void;
  onBackToTitle: () => void;
}

export default function BattleEndScreen({ result, onPlayAgain, onBackToTitle }: BattleEndScreenProps) {
  const { t } = useI18n();

  const artText = result.status === "victory" ? t.victory : result.status === "defeat" ? t.defeat : t.timeout;
  const art = `\n╔═══════════════════════════════════╗\n║         ${artText}        ║\n╚═══════════════════════════════════╝`;
  const colorClass = result.status === "victory" ? "text-green glow-green" : result.status === "defeat" ? "text-red glow-red" : "text-amber glow-amber";
  const message = result.status === "victory"
    ? t.victory_msg(result.enemyName)
    : result.status === "defeat"
    ? t.defeat_msg(result.enemyName)
    : t.timeout_msg;

  return (
    <div className="text-center fade-in">
      <pre className={`${colorClass} text-sm leading-none mb-4`}>{art}</pre>
      <p className={`${colorClass} text-xl mb-6`}>{message}</p>
      <div className="border border-[var(--green-dim)] p-4 mb-6 max-w-sm mx-auto">
        <p className="text-cyan glow-cyan mb-3 text-lg">{t.battle_report}</p>
        <div className="text-left space-y-2">
          <div className="flex justify-between"><span className="text-dim">{t.enemy_label}</span><span className="text-white">{result.enemyName}</span></div>
          <div className="flex justify-between"><span className="text-dim">{t.result_label}</span><span className={colorClass}>{result.status.toUpperCase()}</span></div>
          <div className="flex justify-between"><span className="text-dim">{t.turns_label}</span><span className="text-white">{result.turns}</span></div>
          <div className="flex justify-between border-t border-[var(--green-dim)] pt-2 mt-2">
            <span className="text-amber glow-amber">{t.score_label}</span>
            <span className="text-amber glow-amber text-xl">{result.score}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-4 justify-center">
        <button onClick={onPlayAgain} className="terminal-btn text-green glow-green">{t.fight_again}</button>
        <button onClick={onBackToTitle} className="terminal-btn text-dim">{t.main_menu}</button>
      </div>
    </div>
  );
}
