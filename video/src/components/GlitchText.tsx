import { useCurrentFrame, interpolate } from "remotion";
import React from "react";

interface GlitchTextProps {
  text: string;
  fontSize?: number;
  color?: string;
  glitchIntensity?: number;
  enterFrame?: number;
  style?: React.CSSProperties;
}

export const GlitchText: React.FC<GlitchTextProps> = ({
  text,
  fontSize = 80,
  color = "#00ff41",
  glitchIntensity = 1,
  enterFrame = 0,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - enterFrame;

  if (localFrame < 0) return null;

  const opacity = interpolate(localFrame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Glitch offset that triggers randomly
  const glitchActive =
    Math.sin(localFrame * 7.3) > 0.85 || Math.sin(localFrame * 3.1) > 0.92;
  const glitchX = glitchActive
    ? Math.sin(localFrame * 13.7) * 12 * glitchIntensity
    : 0;
  const glitchY = glitchActive
    ? Math.cos(localFrame * 11.3) * 4 * glitchIntensity
    : 0;

  // RGB split effect
  const splitAmount = glitchActive ? 3 * glitchIntensity : 0;

  return (
    <div
      style={{
        position: "relative",
        opacity,
        transform: `translate(${glitchX}px, ${glitchY}px)`,
        ...style,
      }}
    >
      {/* Red channel offset */}
      <span
        style={{
          position: "absolute",
          fontSize,
          fontFamily: "'Courier New', monospace",
          fontWeight: 900,
          color: "rgba(255, 0, 0, 0.7)",
          left: -splitAmount,
          top: -splitAmount,
          textShadow: "none",
          mixBlendMode: "screen",
        }}
      >
        {text}
      </span>
      {/* Blue channel offset */}
      <span
        style={{
          position: "absolute",
          fontSize,
          fontFamily: "'Courier New', monospace",
          fontWeight: 900,
          color: "rgba(0, 100, 255, 0.7)",
          left: splitAmount,
          top: splitAmount,
          textShadow: "none",
          mixBlendMode: "screen",
        }}
      >
        {text}
      </span>
      {/* Main text */}
      <span
        style={{
          position: "relative",
          fontSize,
          fontFamily: "'Courier New', monospace",
          fontWeight: 900,
          color,
          textShadow: `0 0 20px ${color}80, 0 0 40px ${color}40`,
        }}
      >
        {text}
      </span>
    </div>
  );
};
