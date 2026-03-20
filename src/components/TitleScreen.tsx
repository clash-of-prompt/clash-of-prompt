"use client";

import { useState, useEffect } from "react";

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

  useEffect(() => {
    const timer = setTimeout(() => setShowPrompt(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="text-center fade-in">
      <pre className="text-green glow-green text-[10px] sm:text-xs md:text-sm leading-none mb-6 overflow-x-auto">
        {TITLE_ART}
      </pre>

      <p className="text-amber glow-amber text-xl mb-2">
        ⚔ AI Battle Arena ⚔
      </p>

      <p className="text-dim text-base mb-8">
        Your creativity is your weapon. Fight monsters with words.
      </p>

      <div className="text-white mb-6 text-left max-w-md mx-auto space-y-1">
        <p className="text-cyan glow-cyan">{">"} HOW TO PLAY:</p>
        <p className="text-dim pl-4">1. Choose your enemy</p>
        <p className="text-dim pl-4">2. Describe your battle actions in natural language</p>
        <p className="text-dim pl-4">3. AI Game Master judges your creativity & strategy</p>
        <p className="text-dim pl-4">4. More creative prompts = more damage!</p>
      </div>

      {showPrompt && (
        <div className="fade-in">
          <button
            onClick={onStart}
            className="terminal-btn text-xl px-8 py-3 glow-green"
          >
            {">"} START GAME {"<"}
          </button>
          <p className="text-dim text-sm mt-4 cursor-blink">
            Press ENTER or click to begin
          </p>
        </div>
      )}
    </div>
  );
}
