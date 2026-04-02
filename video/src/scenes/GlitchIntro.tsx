import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { GlitchText } from "../components/GlitchText";

export const GlitchIntro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Background pulse
  const bgBrightness = interpolate(
    Math.sin(frame * 0.3),
    [-1, 1],
    [0.02, 0.08]
  );

  // Title scale entrance
  const titleScale = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 80, mass: 1 },
    delay: 20,
  });

  // Subtitle fade
  const subOpacity = interpolate(frame, [60, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Exit flash
  const exitFlash = interpolate(frame, [130, 145, 150], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: `rgba(10, 10, 20, ${1 - bgBrightness})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Grid background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(0, 255, 65, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 65, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Decorative corners */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 60,
            height: 60,
            border: "3px solid #00ff4140",
            ...(i === 0
              ? { top: 40, left: 40, borderRight: "none", borderBottom: "none" }
              : i === 1
                ? { top: 40, right: 40, borderLeft: "none", borderBottom: "none" }
                : i === 2
                  ? { bottom: 40, left: 40, borderRight: "none", borderTop: "none" }
                  : { bottom: 40, right: 40, borderLeft: "none", borderTop: "none" }),
          }}
        />
      ))}

      {/* Main title */}
      <div style={{ transform: `scale(${titleScale})` }}>
        <GlitchText
          text="CLASH OF PROMPT"
          fontSize={140}
          color="#00ff41"
          glitchIntensity={2}
        />
      </div>

      {/* Subtitle */}
      <div
        style={{
          opacity: subOpacity,
          marginTop: 30,
          fontSize: 32,
          fontFamily: "'Courier New', monospace",
          color: "#ff6b35",
          letterSpacing: 12,
          textTransform: "uppercase",
          textShadow: "0 0 15px #ff6b3560",
        }}
      >
        AI BATTLE ARENA
      </div>

      {/* Exit flash */}
      <AbsoluteFill
        style={{
          backgroundColor: `rgba(255, 255, 255, ${exitFlash})`,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
