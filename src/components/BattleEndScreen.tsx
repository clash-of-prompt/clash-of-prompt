"use client";

interface BattleEndScreenProps {
  result: { status: "victory" | "defeat" | "timeout"; score: number; turns: number; enemyName: string };
  onPlayAgain: () => void;
  onBackToTitle: () => void;
}

const VICTORY_ART = `\n╔═══════════════════════════════════╗\n║         ★ V I C T O R Y ★        ║\n╚═══════════════════════════════════╝`;
const DEFEAT_ART = `\n╔═══════════════════════════════════╗\n║         ✖ D E F E A T ✖          ║\n╚═══════════════════════════════════╝`;
const TIMEOUT_ART = `\n╔═══════════════════════════════════╗\n║        ⏱ T I M E  O U T ⏱       ║\n╚═══════════════════════════════════╝`;

export default function BattleEndScreen({ result, onPlayAgain, onBackToTitle }: BattleEndScreenProps) {
  const art = result.status === "victory" ? VICTORY_ART : result.status === "defeat" ? DEFEAT_ART : TIMEOUT_ART;
  const colorClass = result.status === "victory" ? "text-green glow-green" : result.status === "defeat" ? "text-red glow-red" : "text-amber glow-amber";
  const message = result.status === "victory" ? `You defeated ${result.enemyName}!` : result.status === "defeat" ? `${result.enemyName} has bested you...` : "The battle has timed out!";

  return (
    <div className="text-center fade-in">
      <pre className={`${colorClass} text-sm leading-none mb-4`}>{art}</pre>
      <p className={`${colorClass} text-xl mb-6`}>{message}</p>
      <div className="border border-[var(--green-dim)] p-4 mb-6 max-w-sm mx-auto">
        <p className="text-cyan glow-cyan mb-3 text-lg">BATTLE REPORT</p>
        <div className="text-left space-y-2">
          <div className="flex justify-between"><span className="text-dim">Enemy:</span><span className="text-white">{result.enemyName}</span></div>
          <div className="flex justify-between"><span className="text-dim">Result:</span><span className={colorClass}>{result.status.toUpperCase()}</span></div>
          <div className="flex justify-between"><span className="text-dim">Turns:</span><span className="text-white">{result.turns}</span></div>
          <div className="flex justify-between border-t border-[var(--green-dim)] pt-2 mt-2">
            <span className="text-amber glow-amber">SCORE:</span>
            <span className="text-amber glow-amber text-xl">{result.score}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-4 justify-center">
        <button onClick={onPlayAgain} className="terminal-btn text-green glow-green">{"> FIGHT AGAIN"}</button>
        <button onClick={onBackToTitle} className="terminal-btn text-dim">{"< MAIN MENU"}</button>
      </div>
    </div>
  );
}
