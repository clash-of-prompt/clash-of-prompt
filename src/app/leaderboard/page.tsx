"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";

interface LeaderboardEntry {
  rank: number;
  address: string;
  enemy: string;
  score: number;
  turns: number;
  creativity: number;
}

const MOCK_DATA: LeaderboardEntry[] = [
  { rank: 1, address: "0x742d...bD18", enemy: "Ancient Golem", score: 2450, turns: 6, creativity: 9.2 },
  { rank: 2, address: "0x1a2b...3c4d", enemy: "Shadow Wolf", score: 2100, turns: 5, creativity: 8.7 },
  { rank: 3, address: "0x5e6f...7g8h", enemy: "Ancient Golem", score: 1980, turns: 7, creativity: 8.5 },
  { rank: 4, address: "0x9i0j...1k2l", enemy: "Shadow Wolf", score: 1750, turns: 4, creativity: 7.9 },
  { rank: 5, address: "0x3m4n...5o6p", enemy: "Slime King", score: 1500, turns: 3, creativity: 7.5 },
  { rank: 6, address: "0x7q8r...9s0t", enemy: "Slime King", score: 1320, turns: 4, creativity: 7.1 },
  { rank: 7, address: "0xAb1c...Df2e", enemy: "Ancient Golem", score: 1200, turns: 8, creativity: 6.8 },
  { rank: 8, address: "0xGh3i...Jk4l", enemy: "Shadow Wolf", score: 1050, turns: 5, creativity: 6.5 },
];

export default function LeaderboardPage() {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-3xl fade-in">
        <p className="text-cyan glow-cyan text-xl mb-1 text-center">
          {t.leaderboard_title}
        </p>
        <div className="text-center text-dim mb-6">
          Top players on-chain
        </div>

        {MOCK_DATA.length === 0 ? (
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
                </tr>
              </thead>
              <tbody>
                {MOCK_DATA.map((entry) => (
                  <tr
                    key={entry.rank}
                    className={`border-b border-[var(--green-dim)] border-opacity-30 ${
                      entry.rank <= 3 ? "text-green glow-green" : "text-white"
                    }`}
                  >
                    <td className="p-3">
                      {entry.rank <= 3 ? (
                        <span className="text-amber glow-amber">#{entry.rank}</span>
                      ) : (
                        `#${entry.rank}`
                      )}
                    </td>
                    <td className="p-3 font-mono text-cyan">{entry.address}</td>
                    <td className="p-3">{entry.enemy}</td>
                    <td className="p-3 text-right text-amber glow-amber">{entry.score}</td>
                    <td className="p-3 text-right">{entry.turns}</td>
                    <td className="p-3 text-right text-magenta">{entry.creativity}/10</td>
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
