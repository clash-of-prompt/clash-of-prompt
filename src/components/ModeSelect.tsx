"use client";

import { useI18n } from "@/lib/i18n";

interface ModeSelectProps {
  onSelectMode: (mode: "pve" | "pvp") => void;
  onBack: () => void;
}

interface ModeOption {
  id: string;
  mode: "pve" | "pvp" | null;
  active: boolean;
}

const MODES: ModeOption[] = [
  { id: "pve", mode: "pve", active: true },
  { id: "pvp", mode: "pvp", active: true },
  { id: "coop", mode: null, active: false },
  { id: "direct_pvp", mode: null, active: false },
];

const MODE_ICONS: Record<string, string> = {
  pve: "[ 1P ]",
  pvp: "[ VS ]",
  coop: "[ 2P ]",
  direct_pvp: "[P2P]",
};

export default function ModeSelect({ onSelectMode, onBack }: ModeSelectProps) {
  const { t } = useI18n();

  const modeLabels: Record<string, string> = {
    pve: t.mode_pve,
    pvp: t.mode_pvp,
    coop: t.mode_coop,
    direct_pvp: t.mode_direct_pvp,
  };

  return (
    <div className="fade-in text-center">
      <p className="text-cyan glow-cyan text-xl mb-1">{t.mode_select_title}</p>
      <p className="text-dim mb-6">{t.select_hint}</p>

      <div className="grid grid-cols-2 gap-4 mb-8 max-w-lg mx-auto">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => m.active && m.mode && onSelectMode(m.mode)}
            disabled={!m.active}
            className={`relative terminal-btn p-6 text-center ${
              m.active
                ? "text-green glow-green hover:bg-[var(--green)] hover:bg-opacity-5"
                : "text-dim opacity-50 cursor-not-allowed border-[var(--dim)]"
            }`}
          >
            <div className="text-2xl mb-2 font-mono">{MODE_ICONS[m.id]}</div>
            <div className={`text-lg ${m.active ? "text-white" : "text-dim"}`}>
              {modeLabels[m.id]}
            </div>
            {!m.active && (
              <span className="absolute top-2 right-2 text-xs px-1.5 py-0.5 border border-[var(--amber)] text-amber glow-amber">
                {t.coming_soon}
              </span>
            )}
          </button>
        ))}
      </div>

      <button onClick={onBack} className="terminal-btn text-dim">
        {t.back}
      </button>
    </div>
  );
}
