import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";

export const GlitchIntro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fade in from black
  const fadeIn = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });

  // Logo scale with bounce
  const logoScale = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 60, mass: 1.2 },
    delay: 15,
  });

  // Logo glow pulse
  const glowPulse = Math.sin(frame * 0.15) * 0.3 + 0.7;

  // Shake on logo land
  const shakeAmount = frame >= 30 && frame <= 40
    ? Math.sin(frame * 25) * interpolate(frame, [30, 40], [6, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;

  // Subtitle
  const subOpacity = interpolate(frame, [50, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subY = interpolate(frame, [50, 65], [15, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Particle system
  const particles = Array.from({ length: 30 }, (_, i) => {
    const speed = 0.5 + (i % 5) * 0.3;
    const startY = 1080 + (i * 73) % 200;
    const x = (i * 137) % 1920;
    const y = startY - frame * speed * 2;
    const size = 2 + (i % 3) * 2;
    const opacity = interpolate(y, [0, 200, 800, 1080], [0, 0.6, 0.6, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return { x, y: y % 1200, size, opacity };
  });

  // Flash on beat
  const flash = frame >= 25 && frame <= 32
    ? interpolate(frame, [25, 28, 32], [0, 0.4, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;

  // Exit
  const exitFade = interpolate(frame, [135, 150], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#050510", opacity: fadeIn * exitFade }}>
      {/* Animated background gradient */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse at 50% 60%, rgba(0,255,65,${0.06 * glowPulse}) 0%, rgba(0,0,0,0) 60%)`,
      }} />

      {/* Rising particles */}
      {particles.map((p, i) => (
        <div key={i} style={{
          position: "absolute", left: p.x, top: p.y,
          width: p.size, height: p.size, borderRadius: "50%",
          backgroundColor: i % 3 === 0 ? "#00ff41" : i % 3 === 1 ? "#ff6b35" : "#4488ff",
          opacity: p.opacity * fadeIn, boxShadow: `0 0 ${p.size * 3}px currentColor`,
        }} />
      ))}

      {/* Main logo image */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: `translate(-50%, -55%) scale(${logoScale}) translateX(${shakeAmount}px)`,
        filter: `drop-shadow(0 0 ${40 * glowPulse}px rgba(0,255,65,0.4))`,
      }}>
        <Img src={staticFile("assets/logo.png")} style={{
          width: 900, imageRendering: "pixelated",
        }} />
      </div>

      {/* Subtitle */}
      <div style={{
        position: "absolute", top: "72%", left: "50%",
        transform: `translate(-50%, ${subY}px)`,
        opacity: subOpacity,
        fontSize: 28, letterSpacing: 8,
        color: "#aaaaaa",
        fontFamily: "'Courier New', monospace",
        fontWeight: 600,
        textShadow: "0 0 20px rgba(0,255,65,0.3)",
      }}>
        YOUR WORDS ARE YOUR WEAPONS
      </div>

      {/* Flash overlay */}
      <AbsoluteFill style={{ backgroundColor: `rgba(0,255,65,${flash})`, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
