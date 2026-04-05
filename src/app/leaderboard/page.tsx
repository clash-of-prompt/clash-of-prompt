"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { useState, useEffect } from "react";

const ENEMY_NAMES: Record<string, string> = {
  "1": "Slime King",
  "2": "Shadow Wolf",
  "3": "Ancient Golem",
};

function truncateAddress(addr: string): string {
  if (addr.startsWith("0x") && addr.length > 12) {
    return addr.slice(0, 6) + "..." + addr.slice(-4);
  }
  if (addr.startsWith("init") && addr.length > 15) {
    return addr.slice(0, 8) + "..." + addr.slice(-4);
  }
  return addr;
}

interface ChainEntry {
  player: string;
  enemy_id: string;
  score: string;
  turns: string;
  avg_creativity: string;
  timestamp: string;
  is_pvp: boolean;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [entries, setEntries] = useState<ChainEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("");

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((data) => {
        setEntries(data.entries || []);
        setSource(data.source || "unknown");
        setLoading(false);
      })
      .catch(() => {
        setEntries([]);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-3xl fade-in">
        <p className="text-cyan glow-cyan text-xl mb-1 text-center">
          {t.leaderboard_title}
        </p>
        <div className="text-center text-dim mb-6">
          {source === "on-chain" ? "Live from blockchain" : "Top players"}
        </div>

        {loading ? (
          <p className="text-center text-amber glow-amber">Loading...</p>
        ) : entries.length === 0 ? (
          <p className="text-center text-dim">{t.leaderboard_empty}</p>
        ) : (
          <div className="border border-[var(--green-dim)] overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--green-dim)]">
                  <th className="text-left p-3 text-amber glow-amber">{t.rank}</th>
                  <th className="text-left p-3 text-amber glow-amber">{t.address}</th>
                  <th className="text-left p-3 text-amber glow-amber">{t.enemy_label}</th>
                  <th className="text-right p-3 text-amber glow-amber">{t.score_label}</th>
                  <th className="text-right p-3 text-amber glow-amber">{t.turns_label}</th>
                  <th className="text-right p-3 text-amber glow-amber">Creativity</th>
                  <th className="text-right p-3 text-amber glow-amber">PvP</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => (
                  <tr
                    key={i}
                    className={`border-b border-[var(--green-dim)] border-opacity-30 ${
                      i < 3 ? "text-green glow-green" : "text-white"
                    }`}
                  >
                    <td className="p-3">
                      {i < 3 ? (
                        <span className="text-amber glow-amber">#{i + 1}</span>
                      ) : (
                        `#${i + 1}`
                      )}
                    </td>
                    <td className="p-3 font-mono text-cyan">{truncateAddress(entry.player)}</td>
                    <td className="p-3">{ENEMY_NAMES[entry.enemy_id] || `Enemy ${entry.enemy_id}`}</td>
                    <td className="p-3 text-right text-amber glow-amber">{entry.score}</td>
                    <td className="p-3 text-right">{entry.turns}</td>
                    <td className="p-3 text-right text-magenta">{(Number(entry.avg_creativity) / 100).toFixed(1)}/10</td>
                    <td className="p-3 text-right">{entry.is_pvp ? "PvP" : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-center mt-6">
          <button
            onClick={() => router.push("/")}
            className="terminal-btn text-dim"
          >
            {t.back}
          </button>
        </div>
      </div>
    </main>
  );
}
