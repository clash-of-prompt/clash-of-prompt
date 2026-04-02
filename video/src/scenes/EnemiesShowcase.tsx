import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

const enemies = [
  {
    emoji: "👑",
    name: "SLIME KING",
    hp: 80,
    atk: 8,
    def: 3,
    weakness: "Fire, Piercing",
    difficulty: "EASY",
    diffColor: "#00ff41",
    desc: "Cocky and overconfident",
    personality: '"I\'ll absorb you in seconds!"',
  },
  {
    emoji: "🐺",
    name: "SHADOW WOLF",
    hp: 120,
    atk: 15,
    def: 8,
    weakness: "Light, Loud Noises",
    difficulty: "MEDIUM",
    diffColor: "#ffaa00",
    desc: "Cunning and strategic",
    personality: "*Silent. Deadly.*",
  },
  {
    emoji: "🗿",
    name: "ANCIENT GOLEM",
    hp: 160,
    atk: 20,
    def: 15,
    weakness: "Water, Joint Strikes",
    difficulty: "BOSS",
    diffColor: "#ff3333",
    desc: "Honorable warrior",
    personality: '"PROVE YOUR WORTH..."',
  },
];

export const EnemiesShowcase = () => {
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
        padding: 60,
      }}
    >
      {/* Title */}
      <div
        style={{
          fontSize: 52,
          fontFamily: "'Courier New', monospace",
          fontWeight: 900,
          color: "#ff3333",
          marginBottom: 60,
          textShadow: "0 0 20px #ff333340",
          opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        {"// CHOOSE YOUR ENEMY"}
      </div>

      {/* Enemy cards */}
      <div style={{ display: "flex", gap: 50 }}>
        {enemies.map((enemy, i) => {
          const cardScale = spring({
            frame,
            fps,
            config: { damping: 10, stiffness: 100 },
            delay: 30 + i * 40,
          });

          const isHovered = frame >= 200 + i * 80 && frame < 260 + i * 80;
          const hoverGlow = isHovered ? 0.15 : 0.04;

          return (
            <div
              key={i}
              style={{
                width: 480,
                padding: 40,
                backgroundColor: `rgba(${enemy.diffColor === "#00ff41" ? "0,255,65" : enemy.diffColor === "#ffaa00" ? "255,170,0" : "255,51,51"}, ${hoverGlow})`,
                border: `2px solid ${enemy.diffColor}40`,
                borderRadius: 4,
                transform: `scale(${cardScale}) ${isHovered ? "translateY(-10px)" : ""}`,
                opacity: cardScale,
                transition: "transform 0.1s",
              }}
            >
              {/* Difficulty badge */}
              <div
                style={{
                  fontSize: 14,
                  fontFamily: "'Courier New', monospace",
                  color: enemy.diffColor,
                  letterSpacing: 3,
                  marginBottom: 15,
                  fontWeight: 900,
                }}
              >
                [{enemy.difficulty}]
              </div>

              {/* Emoji */}
              <div style={{ fontSize: 70, marginBottom: 15 }}>{enemy.emoji}</div>

              {/* Name */}
              <div
                style={{
                  fontSize: 30,
                  fontFamily: "'Courier New', monospace",
                  fontWeight: 900,
                  color: "#ffffff",
                  marginBottom: 10,
                }}
              >
                {enemy.name}
              </div>

              {/* Description */}
              <div
                style={{
                  fontSize: 18,
                  fontFamily: "'Courier New', monospace",
                  color: "#888",
                  marginBottom: 20,
                  fontStyle: "italic",
                }}
              >
                {enemy.desc}
              </div>

              {/* Stats */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 10,
                  marginBottom: 15,
                }}
              >
                {[
                  { label: "HP", value: enemy.hp },
                  { label: "ATK", value: enemy.atk },
                  { label: "DEF", value: enemy.def },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      textAlign: "center",
                      padding: "8px 0",
                      backgroundColor: "#0a0a14",
                      borderRadius: 2,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        color: "#666",
                        fontFamily: "'Courier New', monospace",
                      }}
                    >
                      {stat.label}
                    </div>
                    <div
                      style={{
                        fontSize: 24,
                        color: "#ffffff",
                        fontWeight: 900,
                        fontFamily: "'Courier New', monospace",
                      }}
                    >
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Weakness */}
              <div
                style={{
                  fontSize: 14,
                  fontFamily: "'Courier New', monospace",
                  color: "#ff6b35",
                }}
              >
                WEAK: {enemy.weakness}
              </div>

              {/* Quote */}
              <div
                style={{
                  fontSize: 16,
                  fontFamily: "'Courier New', monospace",
                  color: enemy.diffColor,
                  marginTop: 15,
                  opacity: 0.8,
                }}
              >
                {enemy.personality}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
