"use client";

import { useState } from "react";
import TitleScreen from "@/components/TitleScreen";
import EnemySelect from "@/components/EnemySelect";
import BattleScreen from "@/components/BattleScreen";
import BattleEndScreen from "@/components/BattleEndScreen";

type GamePhase = "title" | "select" | "battle" | "end";

interface BattleData {
  id: string;
  enemyId: number;
  enemyName: string;
  enemyDescription: string;
  intro: string;
  initialBattle: {
    playerHp: number;
    enemyHp: number;
    enemyMaxHp: number;
    turn: number;
    maxTurns: number;
    status: string;
    score: number;
    activeEffects: Array<{ effect: string; turnsRemaining: number; target: string }>;
  };
}

interface BattleResult {
  status: "victory" | "defeat" | "timeout";
  score: number;
  turns: number;
  enemyName: string;
}

export default function Home() {
  const [phase, setPhase] = useState<GamePhase>("title");
  const [battleData, setBattleData] = useState<BattleData | null>(null);
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);

  const handleStart = () => setPhase("select");

  const handleSelectEnemy = (data: BattleData) => {
    setBattleData(data);
    setPhase("battle");
  };

  const handleBattleEnd = (result: BattleResult) => {
    setBattleResult(result);
    setPhase("end");
  };

  const handlePlayAgain = () => {
    setBattleData(null);
    setBattleResult(null);
    setPhase("select");
  };

  const handleBackToTitle = () => {
    setBattleData(null);
    setBattleResult(null);
    setPhase("title");
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {phase === "title" && <TitleScreen onStart={handleStart} />}
        {phase === "select" && (
          <EnemySelect
            onSelect={handleSelectEnemy}
            onBack={handleBackToTitle}
          />
        )}
        {phase === "battle" && battleData && (
          <BattleScreen
            battleId={battleData.id}
            enemyId={battleData.enemyId}
            enemyName={battleData.enemyName}
            enemyDescription={battleData.enemyDescription}
            intro={battleData.intro}
            initialBattle={battleData.initialBattle}
            onBattleEnd={handleBattleEnd}
          />
        )}
        {phase === "end" && battleResult && (
          <BattleEndScreen
            result={battleResult}
            onPlayAgain={handlePlayAgain}
            onBackToTitle={handleBackToTitle}
          />
        )}
      </div>
    </main>
  );
}
