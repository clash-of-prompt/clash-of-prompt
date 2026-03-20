"use client";

import { useState, useEffect, useCallback } from "react";
import { useI18n } from "@/lib/i18n";

interface BattleComicProps {
  panels: string[];
  labels: string[];
  onDismiss: () => void;
}

export default function BattleComic({ panels, labels, onDismiss }: BattleComicProps) {
  const [currentPanel, setCurrentPanel] = useState(0);
  const { t } = useI18n();

  const advance = useCallback(() => {
    if (currentPanel < panels.length - 1) setCurrentPanel((p) => p + 1);
    else onDismiss();
  }, [currentPanel, panels.length, onDismiss]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight" || e.key === "Escape") {
        e.preventDefault();
        e.key === "Escape" ? onDismiss() : advance();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [advance, onDismiss]);

  if (panels.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 cursor-pointer" onClick={advance}>
      <div className="max-w-lg w-full mx-4 fade-in">
        <div className="text-center mb-2">
          <span className="text-amber glow-amber text-sm">[{currentPanel + 1}/{panels.length}] {labels[currentPanel]}</span>
        </div>
        <div className="border-2 border-[var(--green)] shadow-[0_0_20px_rgba(0,255,65,0.3)]">
          <img src={panels[currentPanel]} alt={labels[currentPanel]} className="w-full h-auto block" style={{ imageRendering: "pixelated" }} />
        </div>
        <div className="flex justify-center gap-2 mt-3">
          {panels.map((_, i) => (
            <div key={i} className={`w-2 h-2 ${i === currentPanel ? "bg-[var(--green)] shadow-[0_0_6px_var(--green)]" : i < currentPanel ? "bg-[var(--green-dim)]" : "bg-[var(--dim)]"}`} />
          ))}
        </div>
        <p className="text-center text-dim text-sm mt-2">
          {currentPanel < panels.length - 1 ? t.click_continue : t.click_dismiss}
        </p>
      </div>
    </div>
  );
}

export function cropComicPanels(base64Image: string): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const w = img.width, h = img.height, pw = Math.floor(w / 2), ph = Math.floor(h / 2);
      const panels: string[] = [];
      for (const [x, y] of [[0, 0], [pw, 0], [0, ph], [pw, ph]]) {
        const canvas = document.createElement("canvas");
        canvas.width = pw; canvas.height = ph;
        const ctx = canvas.getContext("2d");
        if (ctx) { ctx.drawImage(img, x, y, pw, ph, 0, 0, pw, ph); panels.push(canvas.toDataURL("image/png")); }
      }
      resolve(panels);
    };
    img.onerror = () => resolve([]);
    img.src = `data:image/png;base64,${base64Image}`;
  });
}
