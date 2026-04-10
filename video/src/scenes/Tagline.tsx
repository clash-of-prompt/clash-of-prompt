import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";

export const Tagline = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Hero image slides in from left
  const heroX = spring({ frame, fps, config: { damping: 12, stiffness: 80 }, delay: 10 });
  const heroSlide = interpolate(heroX, [0, 1], [-400, 0]);

  // Battle scene fades in on right
  const sceneOpacity = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sceneScale = interpolate(frame, [30, 50], [1.1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Text reveals
  const line1 = interpolate(frame, [60, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const line2 = interpolate(frame, [85, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const line3 = interpolate(frame, [110, 125], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Divider line
  const lineWidth = interpolate(frame, [130, 160], [0, 600], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Exit
  const exitFade = interpolate(frame, [190, 210], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#050510", opacity: exitFade }}>
      {/* Background battle scene - full bleed, dimmed */}
      <div style={{
        position: "absolute", inset: 0, opacity: sceneOpacity * 0.3,
        transform: `scale(${sceneScale})`,
        overflow: "hidden",
      }}>
        <Img src={staticFile("assets/battle-scene.png")} style={{
          width: "100%", height: "100%", objectFit: "cover",
          imageRendering: "pixelated",
        }} />
      </div>

      {/* Dark gradient overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(135deg, rgba(5,5,16,0.9) 0%, rgba(5,5,16,0.6) 50%, rgba(5,5,16,0.9) 100%)",
      }} />

      {/* Hero portrait on left */}
      <div style={{
        position: "absolute", left: 80, bottom: 0,
        transform: `translateX(${heroSlide}px)`,
        opacity: heroX,
      }}>
        <Img src={staticFile("assets/hero.png")} style={{
          height: 700, imageRendering: "pixelated",
          filter: "drop-shadow(0 0 30px rgba(0,255,65,0.3))",
        }} />
      </div>

      {/* Text content on right */}
      <div style={{
        position: "absolute", right: 120, top: "50%", transform: "translateY(-50%)",
        maxWidth: 800,
      }}>
        <div style={{
          fontSize: 52, fontWeight: 900, color: "#00ff41",
          fontFamily: "'Courier New', monospace",
          opacity: line1, transform: `translateY(${(1 - line1) * 20}px)`,
          textShadow: "0 0 30px rgba(0,255,65,0.5)",
          marginBottom: 20,
        }}>
          WRITE YOUR ATTACK.
        </div>
        <div style={{
          fontSize: 52, fontWeight: 900, color: "#ff6b35",
          fontFamily: "'Courier New', monospace",
          opacity: line2, transform: `translateY(${(1 - line2) * 20}px)`,
          textShadow: "0 0 30px rgba(255,107,53,0.5)",
          marginBottom: 20,
        }}>
          BATTLE ON-CHAIN.
        </div>
        <div style={{
          fontSize: 52, fontWeight: 900, color: "#ffffff",
          fontFamily: "'Courier New', monospace",
          opacity: line3, transform: `translateY(${(1 - line3) * 20}px)`,
          textShadow: "0 0 20px rgba(255,255,255,0.3)",
        }}>
          EARN ON INITIA.
        </div>

        {/* Divider */}
        <div style={{
          width: lineWidth, height: 3, marginTop: 30,
          background: "linear-gradient(90deg, #00ff41, #ff6b35)",
          boxShadow: "0 0 15px rgba(0,255,65,0.5)",
        }} />
      </div>
    </AbsoluteFill>
  );
};
