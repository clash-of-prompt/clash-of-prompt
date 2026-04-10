import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";

export const CallToAction = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pulse = Math.sin(frame * 0.1) * 0.3 + 0.7;

  // Logo drops in
  const logoScale = spring({ frame, fps, config: { damping: 8, stiffness: 60 }, delay: 10 });

  // CTA button
  const btnScale = spring({ frame, fps, config: { damping: 10, stiffness: 100 }, delay: 50 });

  // URL
  const urlOp = interpolate(frame, [80, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Enemy portraits slide in
  const enemy1X = spring({ frame, fps, config: { damping: 12, stiffness: 80 }, delay: 30 });
  const enemy2X = spring({ frame, fps, config: { damping: 12, stiffness: 80 }, delay: 45 });
  const enemy3X = spring({ frame, fps, config: { damping: 12, stiffness: 80 }, delay: 60 });

  // Powered by
  const poweredOp = interpolate(frame, [120, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Particles
  const particles = Array.from({ length: 40 }, (_, i) => {
    const speed = 0.3 + (i % 7) * 0.2;
    const x = (i * 131 + Math.sin(frame * 0.01 + i) * 50) % 1920;
    const y = (1100 - frame * speed * 1.5 + i * 80) % 1200;
    const size = 1.5 + (i % 4) * 1.5;
    const opacity = 0.08 + Math.sin(frame * 0.04 + i * 0.7) * 0.06;
    return { x, y, size, opacity };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#050510" }}>
      {/* Battle scene background dimmed */}
      <Img src={staticFile("assets/battle-scene.png")} style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        objectFit: "cover", imageRendering: "pixelated", opacity: 0.08,
      }} />

      {/* Particles */}
      {particles.map((p, i) => (
        <div key={i} style={{
          position: "absolute", left: p.x, top: p.y,
          width: p.size, height: p.size, borderRadius: "50%",
          backgroundColor: i % 3 === 0 ? "#00ff41" : i % 3 === 1 ? "#ff6b35" : "#6b5bff",
          opacity: p.opacity, boxShadow: `0 0 ${p.size * 3}px currentColor`,
        }} />
      ))}

      {/* Central glow */}
      <div style={{
        position: "absolute", top: "40%", left: "50%", transform: "translate(-50%, -50%)",
        width: 1000, height: 1000, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(0,255,65,${0.05 * pulse}) 0%, transparent 50%)`,
      }} />

      {/* Logo */}
      <div style={{
        position: "absolute", top: "18%", left: "50%",
        transform: `translate(-50%, -50%) scale(${logoScale})`,
        filter: `drop-shadow(0 0 ${30 * pulse}px rgba(0,255,65,0.3))`,
      }}>
        <Img src={staticFile("assets/logo.png")} style={{ width: 700, imageRendering: "pixelated" }} />
      </div>

      {/* Enemy portraits row */}
      <div style={{
        position: "absolute", top: "45%", left: "50%", transform: "translate(-50%, -50%)",
        display: "flex", gap: 30, alignItems: "center",
      }}>
        {[
          { img: "slime-king.png", scale: enemy1X, border: "#00ff41" },
          { img: "shadow-wolf.png", scale: enemy2X, border: "#ffaa00" },
          { img: "ancient-golem.png", scale: enemy3X, border: "#ff3333" },
        ].map((e, i) => (
          <div key={i} style={{
            transform: `scale(${e.scale})`, opacity: e.scale,
          }}>
            <Img src={staticFile(`assets/${e.img}`)} style={{
              width: 180, height: 180, borderRadius: 8, objectFit: "cover",
              imageRendering: "pixelated",
              border: `3px solid ${e.border}60`,
              boxShadow: `0 0 20px ${e.border}30`,
            }} />
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <div style={{
        position: "absolute", top: "66%", left: "50%",
        transform: `translate(-50%, -50%) scale(${btnScale})`,
      }}>
        <div style={{
          padding: "20px 70px",
          background: "linear-gradient(135deg, #00ff41, #00cc33)",
          borderRadius: 6, cursor: "pointer",
          boxShadow: `0 0 ${25 * pulse}px rgba(0,255,65,0.4), 0 0 ${50 * pulse}px rgba(0,255,65,0.2)`,
        }}>
          <span style={{
            fontSize: 36, fontFamily: "'Courier New', monospace", fontWeight: 900,
            color: "#050510", letterSpacing: 4,
          }}>
            PLAY NOW
          </span>
        </div>
      </div>

      {/* URL */}
      <div style={{
        position: "absolute", top: "76%", left: "50%",
        transform: "translateX(-50%)", opacity: urlOp,
        fontSize: 26, fontFamily: "'Courier New', monospace",
        color: "#00ff41", textShadow: "0 0 15px rgba(0,255,65,0.4)",
        letterSpacing: 3,
      }}>
        clash-of-prompt.vercel.app
      </div>

      {/* Powered by */}
      <div style={{
        position: "absolute", bottom: 50, left: "50%", transform: "translateX(-50%)",
        opacity: poweredOp, fontSize: 16, fontFamily: "'Courier New', monospace",
        color: "#555", letterSpacing: 4,
      }}>
        POWERED BY CLAUDE AI + GEMINI + INITIA
      </div>
    </AbsoluteFill>
  );
};
