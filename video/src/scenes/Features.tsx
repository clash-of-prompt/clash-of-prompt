import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

const features = [
  {
    icon: "🎯",
    title: "CREATIVITY SCORING",
    desc: "AI rates your prompts 1-10. Generic attacks deal 5 damage. Creative ones deal 35+.",
    color: "#ff6b35",
  },
  {
    icon: "⚡",
    title: "STATUS EFFECTS",
    desc: "Poison, Burn, Stun, Shield, Heal — chain effects for devastating combos.",
    color: "#00ff41",
  },
  {
    icon: "🎨",
    title: "BATTLE COMICS",
    desc: "Every turn generates a unique comic panel. Your battles become visual stories.",
    color: "#6b5bff",
  },
  {
    icon: "🌏",
    title: "BILINGUAL",
    desc: "Play in English or Bahasa Indonesia. AI adapts narration to your language.",
    color: "#ffaa00",
  },
];

export const Features = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a14",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 80,
      }}
    >
      {/* Title */}
      <div
        style={{
          fontSize: 52,
          fontFamily: "'Courier New', monospace",
          fontWeight: 900,
          color: "#6b5bff",
          marginBottom: 60,
          textShadow: "0 0 20px #6b5bff40",
          opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        {"// FEATURES"}
      </div>

      {/* 2x2 Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 40,
          maxWidth: 1400,
          width: "100%",
        }}
      >
        {features.map((feat, i) => {
          const delay = 20 + i * 25;
          const scale = spring({
            frame,
            fps,
            config: { damping: 12, stiffness: 100 },
            delay,
          });

          return (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 25,
                padding: 35,
                backgroundColor: `${feat.color}08`,
                border: `2px solid ${feat.color}25`,
                borderRadius: 4,
                transform: `scale(${scale})`,
                opacity: scale,
              }}
            >
              <div style={{ fontSize: 50, flexShrink: 0 }}>{feat.icon}</div>
              <div>
                <div
                  style={{
                    fontSize: 26,
                    fontFamily: "'Courier New', monospace",
                    fontWeight: 900,
                    color: feat.color,
                    marginBottom: 10,
                  }}
                >
                  {feat.title}
                </div>
                <div
                  style={{
                    fontSize: 20,
                    fontFamily: "'Courier New', monospace",
                    color: "#999",
                    lineHeight: 1.5,
                  }}
                >
                  {feat.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
