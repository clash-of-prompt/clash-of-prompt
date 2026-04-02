import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { GlitchText } from "../components/GlitchText";

export const CallToAction = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Pulsing glow
  const pulse = Math.sin(frame * 0.1) * 0.3 + 0.7;

  const titleScale = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 80 },
    delay: 10,
  });

  const btnScale = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 100 },
    delay: 60,
  });

  const urlOpacity = interpolate(frame, [100, 120], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Particle-like decorations
  const particles = Array.from({ length: 20 }, (_, i) => ({
    x: Math.sin(i * 1.3 + frame * 0.02) * 600 + 960,
    y: Math.cos(i * 0.9 + frame * 0.015) * 400 + 540,
    size: 2 + Math.sin(i * 2.1) * 2,
    opacity: 0.1 + Math.sin(frame * 0.05 + i) * 0.1,
  }));

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a14",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Background particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            backgroundColor: "#00ff41",
            opacity: p.opacity,
            boxShadow: "0 0 6px #00ff41",
          }}
        />
      ))}

      {/* Radial gradient background */}
      <div
        style={{
          position: "absolute",
          width: 1200,
          height: 1200,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(0,255,65,${0.06 * pulse}) 0%, transparent 60%)`,
        }}
      />

      {/* "READY TO FIGHT?" */}
      <div style={{ transform: `scale(${titleScale})`, marginBottom: 50 }}>
        <GlitchText
          text="READY TO FIGHT?"
          fontSize={100}
          color="#ffffff"
          glitchIntensity={0.5}
        />
      </div>

      {/* CTA Button */}
      <div
        style={{
          transform: `scale(${btnScale})`,
          padding: "25px 80px",
          backgroundColor: "#00ff41",
          borderRadius: 4,
          cursor: "pointer",
          boxShadow: `0 0 ${30 * pulse}px #00ff4160, 0 0 ${60 * pulse}px #00ff4130`,
          marginBottom: 40,
        }}
      >
        <span
          style={{
            fontSize: 40,
            fontFamily: "'Courier New', monospace",
            fontWeight: 900,
            color: "#0a0a14",
            letterSpacing: 4,
          }}
        >
          PLAY NOW
        </span>
      </div>

      {/* URL */}
      <div
        style={{
          opacity: urlOpacity,
          fontSize: 30,
          fontFamily: "'Courier New', monospace",
          color: "#00ff41",
          textShadow: "0 0 15px #00ff4140",
          letterSpacing: 2,
        }}
      >
        clash-of-prompt.vercel.app
      </div>

      {/* Bottom tagline */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          fontSize: 20,
          fontFamily: "'Courier New', monospace",
          color: "#666",
          letterSpacing: 6,
          opacity: interpolate(frame, [150, 170], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        POWERED BY CLAUDE AI × GEMINI
      </div>

      {/* Corner decorations */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 80,
            height: 80,
            border: `3px solid #00ff4120`,
            ...(i === 0
              ? { top: 30, left: 30, borderRight: "none", borderBottom: "none" }
              : i === 1
                ? { top: 30, right: 30, borderLeft: "none", borderBottom: "none" }
                : i === 2
                  ? { bottom: 30, left: 30, borderRight: "none", borderTop: "none" }
                  : { bottom: 30, right: 30, borderLeft: "none", borderTop: "none" }),
          }}
        />
      ))}
    </AbsoluteFill>
  );
};
