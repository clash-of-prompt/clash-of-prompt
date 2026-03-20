"use client";

interface HpBarProps {
  current: number;
  max: number;
  label: string;
  color?: "player" | "enemy";
}

export default function HpBar({
  current,
  max,
  label,
  color = "player",
}: HpBarProps) {
  const percent = Math.max(0, (current / max) * 100);
  const hpClass =
    percent > 60 ? "hp-high" : percent > 25 ? "hp-mid" : "hp-low";

  return (
    <div className="mb-2">
      <div className="flex justify-between text-sm mb-1">
        <span className={color === "player" ? "text-cyan" : "text-red"}>
          {label}
        </span>
        <span className="text-white">
          {current}/{max}
        </span>
      </div>
      <div className="hp-bar">
        <div
          className={`hp-bar-fill ${hpClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
