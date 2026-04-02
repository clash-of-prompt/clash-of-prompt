import { AbsoluteFill, useCurrentFrame } from "remotion";

export const Scanlines = () => {
  const frame = useCurrentFrame();
  const offset = (frame * 0.5) % 4;

  return (
    <AbsoluteFill
      style={{
        background: `repeating-linear-gradient(
          0deg,
          rgba(0, 0, 0, 0.15) ${offset}px,
          transparent ${offset + 1}px,
          transparent ${offset + 3}px,
          rgba(0, 0, 0, 0.15) ${offset + 4}px
        )`,
        pointerEvents: "none",
        zIndex: 100,
      }}
    />
  );
};
