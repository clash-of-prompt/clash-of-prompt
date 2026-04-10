import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";

const enemies = [
  { name: "SLIME KING", image: "slime-king.png", hp: 80, atk: 8, def: 3, weakness: "Fire, Piercing", diff: "EASY", color: "#00ff41" },
  { name: "SHADOW WOLF", image: "shadow-wolf.png", hp: 120, atk: 15, def: 8, weakness: "Light, Loud Noises", diff: "MEDIUM", color: "#ffaa00" },
  { name: "ANCIENT GOLEM", image: "ancient-golem.png", hp: 160, atk: 20, def: 15, weakness: "Water, Joint Strikes", diff: "BOSS", color: "#ff3333" },
];

export const EnemiesShowcase = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title
  const titleOp = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  // Exit
  const exitFade = interpolate(frame, [420, 450], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#050510", opacity: exitFade }}>
      {/* Title */}
      <div style={{
        position: "absolute", top: 30, left: "50%", transform: "translateX(-50%)",
        opacity: titleOp, textAlign: "center",
      }}>
        <div style={{ fontSize: 20, color: "#ff3333", fontFamily: "'Courier New', monospace", letterSpacing: 8, marginBottom: 8 }}>
          CHOOSE YOUR ENEMY
        </div>
        <div style={{ fontSize: 52, color: "#ffffff", fontFamily: "'Courier New', monospace", fontWeight: 900, textShadow: "0 0 20px rgba(255,255,255,0.2)" }}>
          THREE DEADLY FOES
        </div>
      </div>

      {/* Enemy cards */}
      <div style={{
        position: "absolute", top: 140, left: 0, right: 0,
        display: "flex", justifyContent: "center", gap: 40, padding: "0 60px",
      }}>
        {enemies.map((enemy, i) => {
          const delay = 30 + i * 50;
          const cardY = spring({ frame, fps, config: { damping: 10, stiffness: 80 }, delay });
          const slideY = interpolate(cardY, [0, 1], [60, 0]);

          // Highlight animation
          const highlightStart = 200 + i * 70;
          const isHighlighted = frame >= highlightStart && frame < highlightStart + 50;
          const highlightGlow = isHighlighted ? interpolate(frame, [highlightStart, highlightStart + 10, highlightStart + 40, highlightStart + 50], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

          return (
            <div key={i} style={{
              width: 480, opacity: cardY, transform: `translateY(${slideY}px)`,
              background: `rgba(${enemy.color === "#00ff41" ? "0,255,65" : enemy.color === "#ffaa00" ? "255,170,0" : "255,51,51"},${0.03 + highlightGlow * 0.08})`,
              border: `2px solid ${enemy.color}${highlightGlow > 0 ? "80" : "30"}`,
              borderRadius: 6, overflow: "hidden",
              boxShadow: highlightGlow > 0 ? `0 0 30px ${enemy.color}40` : "none",
            }}>
              {/* Enemy portrait */}
              <div style={{ width: "100%", height: 280, overflow: "hidden", borderBottom: `2px solid ${enemy.color}30` }}>
                <Img src={staticFile(`assets/${enemy.image}`)} style={{
                  width: "100%", height: "100%", objectFit: "cover",
                  imageRendering: "pixelated",
                  transform: `scale(${1 + highlightGlow * 0.05})`,
                }} />
              </div>

              {/* Info */}
              <div style={{ padding: "20px 24px" }}>
                {/* Difficulty badge */}
                <div style={{
                  display: "inline-block", padding: "3px 12px", marginBottom: 10,
                  background: `${enemy.color}20`, border: `1px solid ${enemy.color}60`,
                  borderRadius: 3, fontSize: 13, fontFamily: "'Courier New', monospace",
                  color: enemy.color, fontWeight: 900, letterSpacing: 2,
                }}>
                  {enemy.diff}
                </div>

                {/* Name */}
                <div style={{
                  fontSize: 28, fontFamily: "'Courier New', monospace", fontWeight: 900,
                  color: "#ffffff", marginBottom: 14,
                }}>
                  {enemy.name}
                </div>

                {/* Stats row */}
                <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                  {[
                    { label: "HP", value: enemy.hp, c: "#ff3333" },
                    { label: "ATK", value: enemy.atk, c: "#ff6b35" },
                    { label: "DEF", value: enemy.def, c: "#4488ff" },
                  ].map((s) => (
                    <div key={s.label} style={{
                      flex: 1, textAlign: "center", padding: "8px 0",
                      background: "rgba(0,0,0,0.4)", borderRadius: 3,
                    }}>
                      <div style={{ fontSize: 11, color: "#666", fontFamily: "'Courier New', monospace", letterSpacing: 2 }}>{s.label}</div>
                      <div style={{ fontSize: 22, color: s.c, fontWeight: 900, fontFamily: "'Courier New', monospace" }}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* Weakness */}
                <div style={{ fontSize: 13, fontFamily: "'Courier New', monospace", color: "#ff6b35" }}>
                  WEAK: {enemy.weakness}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
