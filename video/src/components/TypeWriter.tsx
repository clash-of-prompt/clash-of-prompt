import { useCurrentFrame } from "remotion";
import React from "react";

interface TypeWriterProps {
  text: string;
  startFrame?: number;
  charsPerFrame?: number;
  fontSize?: number;
  color?: string;
  showCursor?: boolean;
  style?: React.CSSProperties;
}

export const TypeWriter: React.FC<TypeWriterProps> = ({
  text,
  startFrame = 0,
  charsPerFrame = 0.5,
  fontSize = 36,
  color = "#00ff41",
  showCursor = true,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  if (localFrame < 0) return null;

  const charsToShow = Math.min(
    Math.floor(localFrame * charsPerFrame),
    text.length
  );
  const displayText = text.slice(0, charsToShow);
  const cursorVisible = showCursor && Math.floor(frame / 15) % 2 === 0;

  return (
    <div
      style={{
        fontSize,
        fontFamily: "'Courier New', monospace",
        color,
        textShadow: `0 0 10px ${color}60`,
        whiteSpace: "pre-wrap",
        ...style,
      }}
    >
      {displayText}
      {cursorVisible && (
        <span
          style={{
            backgroundColor: color,
            width: fontSize * 0.55,
            height: fontSize * 0.08,
            display: "inline-block",
            verticalAlign: "baseline",
            marginLeft: 2,
          }}
        />
      )}
    </div>
  );
};
