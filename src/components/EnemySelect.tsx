"use client";

import { useState, useEffect } from "react";

interface EnemyInfo {
  id: number;
  name: string;
  hp: number;
  atk: number;
  def: number;
  weakness: string[];
  description: string;
  difficulty: "easy" | "medium" | "boss";
}

interface EnemySelectProps {
  onSelect: (data: {
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
  }) => void;
  onBack: () => void;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "text-green glow-green",
  medium: "text-amber glow-amber",
  boss: "text-red glow-red",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "★ EASY",
  medium: "★★ MEDIUM",
  boss: "★★★ BOSS",
};

export default function EnemySelect({ onSelect, onBack }: EnemySelectProps) {
  const [enemies, setEnemies] = useState<EnemyInfo[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/enemies")
      .then((r) => r.json())
      .then((data) => { setEnemies(data.enemies); setLoading(false); })
      .catch(() => { setError("Failed to load enemies"); setLoading(false); });
  }, []);

  const handleFight = async () => {
    if (selected === null) return;
    setStarting(true);
    setError(null);
    try {
      const res = await fetch("/api/battle/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enemyId: selected }),
      });
      if (!res.ok) throw new Error("Failed to start battle");
      const data = await res.json();
      const selectedEnemy = enemies.find((e) => e.id === selected);
      onSelect({
        id: data.battle.id,
        enemyId: selected,
        enemyName: data.battle.enemyName,
        enemyDescription: selectedEnemy?.description || data.battle.enemyName,
        intro: data.intro,
        initialBattle: data.battle,
      });
    } catch {
      setError("Failed to start battle. Try again.");
      setStarting(false);
    }
  };

  if (loading) {
    return <div className="text-center"><p className="text-amber glow-amber">Loading...</p></div>;
  }

  return (
    <div className="fade-in">
      <p className="text-cyan glow-cyan text-xl mb-1">{"> SELECT YOUR OPPONENT"}</p>
      <p className="text-dim mb-6">Choose wisely. Harder enemies yield higher scores.</p>

      <div className="space-y-3 mb-6">
        {enemies.map((enemy) => (
          <button key={enemy.id} onClick={() => setSelected(enemy.id)}
            className={`terminal-btn w-full text-left p-4 ${selected === enemy.id ? "selected" : ""}`}>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-white text-lg">{enemy.name}</span>
                <span className={`ml-3 text-sm ${DIFFICULTY_COLORS[enemy.difficulty]}`}>
                  [{DIFFICULTY_LABELS[enemy.difficulty]}]
                </span>
              </div>
            </div>
            <p className="text-dim text-sm mt-1">{enemy.description}</p>
            <div className="flex gap-6 mt-2 text-sm">
              <span className="text-red">HP:{enemy.hp}</span>
              <span className="text-amber">ATK:{enemy.atk}</span>
              <span className="text-cyan">DEF:{enemy.def}</span>
              <span className="text-magenta">Weak: {enemy.weakness.join(", ")}</span>
            </div>
          </button>
        ))}
      </div>

      {error && <p className="text-red mb-4">{error}</p>}

      <div className="flex gap-4">
        <button onClick={onBack} className="terminal-btn text-dim">{"< BACK"}</button>
        {selected !== null && (
          <button onClick={handleFight} disabled={starting} className="terminal-btn text-green glow-green">
            {starting ? "Initiating battle..." : "> FIGHT!"}
          </button>
        )}
      </div>
    </div>
  );
}
