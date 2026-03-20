"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";

interface TitleScreenProps {
  onStart: () => void;
}

const TITLE_ART = `
██████╗ ██████╗  ██████╗ ███╗   ███╗██████╗ ████████╗
██╔══██╗██╔══██╗██╔═══██╗████╗ ████║██╔══██╗╚══██╔══╝
██████╔╝██████╔╝██║   ██║██╔████╔██║██████╔╝   ██║
██╔═══╝ ██╔══██╗██║   ██║██║╚██╔╝██║██╔═══╝    ██║
██║     ██║  ██║╚██████╔╝██║ ╚═╝ ██║██║        ██║
╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝╚═╝        ╚═╝

██╗    ██╗ █████╗ ██████╗ ███████╗
██║    ██║██╔══██╗██╔══██╗██╔════╝
██║ █╗ ██║███████║██████╔╝███████╗
██║███╗██║██╔══██║██╔══██╗╚════██║
╚███╔███╔╝██║  ██║██║  ██║███████║
 ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝
`.trim();

export default function TitleScreen({ onStart }: TitleScreenProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    const timer = setTimeout(() => setShowPrompt(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="text-center fade-in">
      <div className="flex justify-end mb-2">
        <LanguageSwitcher />
      </div>

      <pre className="text-green glow-green text-[10px] sm:text-xs md:text-sm leading-none mb-6 overflow-x-auto">
        {TITLE_ART}
      </pre>

      <p className="text-amber glow-amber text-xl mb-2">
        ⚔ {t.title_subtitle} ⚔
      </p>

      <p className="text-dim text-base mb-8">
        {t.title_tagline}
      </p>

      <div className="text-white mb-6 text-left max-w-md mx-auto space-y-1">
        <p className="text-cyan glow-cyan">{">"} {t.how_to_play}</p>
        <p className="text-dim pl-4">{t.step1}</p>
        <p className="text-dim pl-4">{t.step2}</p>
        <p className="text-dim pl-4">{t.step3}</p>
        <p className="text-dim pl-4">{t.step4}</p>
      </div>

      {showPrompt && (
        <div className="fade-in">
          <button
            onClick={onStart}
            className="terminal-btn text-xl px-8 py-3 glow-green"
          >
            {t.start_game}
          </button>
          <p className="text-dim text-sm mt-4 cursor-blink">
            {t.press_enter}
          </p>
        </div>
      )}
    </div>
  );
}
