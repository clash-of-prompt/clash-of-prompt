import { interpolate, useCurrentFrame } from "remotion";
import React from "react";

interface HpBarProps {
  label: string;
  current: number;
  max: number;
  color?: string;
  animateFrom?: number;
  animateToFrame?: number;
  width?: number;
}

export const HpBar: React.FC<HpBarProps> = ({
  label,
  current,
  max,
  color = "#00ff41",
  animateFrom,
  animateToFrame = 30,
  width = 500,
}) => {
  const frame = useCurrentFrame();

  const startPercent = animateFrom !== undefined ? animateFrom / max : current / max;
  const endPercent = current / max;

  const percent = interpolate(frame, [0, animateToFrame], [startPercent, endPercent], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const barColor = percent > 0.5 ? color : percent > 0.25 ? "#ffaa00" : "#ff3333";

  return (
    <div style={{ width }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "'Courier New', monospace",
          fontSize: 20,
          color: "#cccccc",
          marginBottom: 6,
        }}
      >
        <span>{label}</span>
        <span>
          {Math.round(percent * max)}/{max}
        </span>
      </div>
      <div
        style={{
          width: "100%",
          height: 24,
          backgroundColor: "#1a1a2e",
          border: "2px solid #333",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percent * 100}%`,
            height: "100%",
            backgroundColor: barColor,
            boxShadow: `0 0 10px ${barColor}80`,
            transition: "none",
          }}
        />
      </div>
    </div>
  );
};
