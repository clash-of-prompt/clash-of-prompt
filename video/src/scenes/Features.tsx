import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";

const features = [
  { title: "CREATIVITY SCORING", desc: "AI rates your prompts 1-10.\nGeneric attacks deal 5 damage.\nCreative ones deal 35+.", color: "#ff6b35" },
  { title: "STATUS EFFECTS", desc: "Poison, Burn, Stun, Shield, Heal.\nChain effects for devastating combos.", color: "#00ff41" },
  { title: "BATTLE COMICS", desc: "Every turn generates a unique\npixel art comic panel.\nYour battles become visual stories.", color: "#6b5bff" },
  { title: "BILINGUAL", desc: "Play in English or Bahasa Indonesia.\nAI adapts narration to your language.", color: "#ffaa00" },
];

export const Features = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOp = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const exitFade = interpolate(frame, [370, 390], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#050510", opacity: exitFade }}>
      {/* Subtle background */}
      <Img src={staticFile("assets/keyboard.png")} style={{
        position: "absolute", right: -100, bottom: -100,
        height: 600, imageRendering: "pixelated", opacity: 0.06,
        transform: "rotate(-15deg)",
      }} />

      {/* Title */}
      <div style={{
        position: "absolute", top: 50, left: "50%", transform: "translateX(-50%)",
        opacity: titleOp, textAlign: "center",
      }}>
        <div style={{ fontSize: 20, color: "#6b5bff", fontFamily: "'Courier New', monospace", letterSpacing: 8, marginBottom: 8 }}>
          PACKED WITH
        </div>
        <div style={{ fontSize: 52, color: "#ffffff", fontFamily: "'Courier New', monospace", fontWeight: 900, textShadow: "0 0 20px rgba(255,255,255,0.2)" }}>
          POWERFUL FEATURES
        </div>
      </div>

      {/* 2x2 grid */}
      <div style={{
        position: "absolute", top: 180, left: 0, right: 0,
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30,
        padding: "0 100px",
      }}>
        {features.map((feat, i) => {
          const delay = 25 + i * 30;
          const scale = spring({ frame, fps, config: { damping: 10, stiffness: 80 }, delay });
          const slideX = interpolate(scale, [0, 1], [i % 2 === 0 ? -40 : 40, 0]);

          return (
            <div key={i} style={{
              display: "flex", flexDirection: "column", padding: 30,
              background: `${feat.color}06`, border: `2px solid ${feat.color}20`, borderRadius: 6,
              transform: `translateX(${slideX}px)`, opacity: scale,
            }}>
              {/* Color accent bar */}
              <div style={{ width: 50, height: 4, background: feat.color, borderRadius: 2, marginBottom: 16, boxShadow: `0 0 10px ${feat.color}60` }} />

              <div style={{
                fontSize: 26, fontFamily: "'Courier New', monospace", fontWeight: 900,
                color: feat.color, marginBottom: 12,
              }}>
                {feat.title}
              </div>
              <div style={{
                fontSize: 18, fontFamily: "'Courier New', monospace",
                color: "#999", lineHeight: 1.6, whiteSpace: "pre-wrap",
              }}>
                {feat.desc}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
