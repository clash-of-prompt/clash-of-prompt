"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { useWallet } from "@/lib/wallet";

interface BattleEndScreenProps {
  result: {
    status: "victory" | "defeat" | "timeout";
    score: number;
    turns: number;
    enemyName: string;
    chain?: { txHash: string | null; tokensEarned: number };
  };
  onPlayAgain: () => void;
  onBackToTitle: () => void;
}

export default function BattleEndScreen({ result, onPlayAgain, onBackToTitle }: BattleEndScreenProps) {
  const { t } = useI18n();
  const { connected } = useWallet();
  const router = useRouter();

  const chainSuccess = result.chain?.txHash != null;
  const tokensEarned = result.chain?.tokensEarned || 0;

  const artText = result.status === "victory" ? t.victory : result.status === "defeat" ? t.defeat : t.timeout;
  const art = `\n==============================\n     ${artText}     \n==============================`;
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

      <div className="border border-[var(--green-dim)] p-4 mb-6 max-w-sm mx-auto">
        {!connected ? (
          <p className="text-dim text-center">{t.connect_to_save}</p>
        ) : chainSuccess ? (
          <div className="space-y-2 text-center">
            <p className="text-green glow-green">{t.score_on_chain} ✓</p>
            {tokensEarned > 0 && (
              <p className="text-green glow-green text-lg" style={{ textShadow: "0 0 10px var(--green), 0 0 20px var(--green)" }}>
                {t.clash_earned(tokensEarned)}
              </p>
            )}
            {result.status === "victory" && (
              <p className="text-amber glow-amber">{t.nft_minted}</p>
            )}
            <p className="text-dim text-xs mt-1 font-mono">
              tx: {result.chain!.txHash!.slice(0, 12)}...
            </p>
          </div>
        ) : result.chain ? (
          <div className="space-y-2 text-center">
            <p className="text-red">On-chain recording failed</p>
            <p className="text-dim text-xs">Score saved locally but not on blockchain</p>
          </div>
        ) : (
          <p className="text-dim text-center">No on-chain data for this battle</p>
        )}
      </div>

      <div className="flex gap-4 justify-center flex-wrap">
        <button onClick={onPlayAgain} className="terminal-btn text-green glow-green">{t.fight_again}</button>
        <button onClick={() => router.push("/leaderboard")} className="terminal-btn text-cyan glow-cyan">{t.view_leaderboard}</button>
        <button onClick={onBackToTitle} className="terminal-btn text-dim">{t.main_menu}</button>
      </div>
    </div>
  );
}
