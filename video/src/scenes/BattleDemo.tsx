import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { TypeWriter } from "../components/TypeWriter";
import { HpBar } from "../components/HpBar";

export const BattleDemo = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: Show the battle UI (0-150)
  // Phase 2: Player types (150-300)
  // Phase 3: Attack animation (300-450)
  // Phase 4: Results (450-660)

  const uiOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  // HP values that change over time
  const playerHp = frame < 400 ? 100 : frame < 500 ? 93 : 93;
  const enemyHp = frame < 400 ? 80 : frame < 500 ? 62 : 62;
  const prevEnemyHp = frame < 400 ? 80 : 80;

  // Attack flash
  const attackFlash =
    frame >= 320 && frame <= 340
      ? interpolate(frame, [320, 325, 340], [0, 0.6, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;

  // Screen shake during attack
  const shakeX =
    frame >= 315 && frame <= 345
      ? Math.sin(frame * 20) * interpolate(frame, [315, 330, 345], [0, 8, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;
  const shakeY =
    frame >= 315 && frame <= 345
      ? Math.cos(frame * 17) * interpolate(frame, [315, 330, 345], [0, 5, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;

  // Damage number popup
  const dmgScale = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 150 },
    delay: 340,
  });

  const dmgOpacity = interpolate(frame, [340, 380, 450, 480], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Creativity score
  const scoreOpacity = interpolate(frame, [400, 420], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Narrative text
  const narrativeOpacity = interpolate(frame, [450, 470], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a14",
        opacity: uiOpacity,
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      {/* Battle header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "40px 80px",
          borderBottom: "2px solid #1a1a2e",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span
            style={{
              fontSize: 28,
              fontFamily: "'Courier New', monospace",
              fontWeight: 900,
              color: "#00ff41",
            }}
          >
            YOU
          </span>
          <HpBar
            label="PLAYER"
            current={playerHp}
            max={100}
            color="#00ff41"
            animateFrom={frame < 400 ? 100 : 100}
            animateToFrame={frame < 400 ? 1 : 60}
            width={500}
          />
        </div>

        <div
          style={{
            fontSize: 24,
            fontFamily: "'Courier New', monospace",
            color: "#666",
          }}
        >
          Turn 1/20
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
          <span
            style={{
              fontSize: 28,
              fontFamily: "'Courier New', monospace",
              fontWeight: 900,
              color: "#ff3333",
            }}
          >
            👑 SLIME KING
          </span>
          <HpBar
            label="ENEMY"
            current={enemyHp}
            max={80}
            color="#ff3333"
            animateFrom={prevEnemyHp}
            animateToFrame={frame < 400 ? 1 : 90}
            width={500}
          />
        </div>
      </div>

      {/* Battle area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "40px 80px",
          justifyContent: "center",
          gap: 30,
        }}
      >
        {/* Prompt input simulation */}
        {frame >= 60 && (
          <div
            style={{
              backgroundColor: "#0d0d1a",
              border: "2px solid #00ff4140",
              borderRadius: 4,
              padding: "25px 30px",
              maxWidth: 900,
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontFamily: "'Courier New', monospace",
                color: "#00ff4180",
                marginBottom: 10,
              }}
            >
              {">"} YOUR ACTION:
            </div>
            <TypeWriter
              text="I hurl a fireball at the Slime King's crown, aiming to melt his royal symbol and exploit his fire weakness!"
              startFrame={80}
              charsPerFrame={0.8}
              fontSize={26}
              color="#ffffff"
            />
          </div>
        )}

        {/* Damage popup */}
        {frame >= 340 && (
          <div
            style={{
              position: "absolute",
              top: "35%",
              right: "25%",
              transform: `scale(${dmgScale})`,
              opacity: dmgOpacity,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 80,
                fontFamily: "'Courier New', monospace",
                fontWeight: 900,
                color: "#ff6b35",
                textShadow: "0 0 30px #ff6b3580, 0 0 60px #ff6b3540",
              }}
            >
              -18
            </div>
            <div
              style={{
                fontSize: 22,
                color: "#ff6b35",
                fontFamily: "'Courier New', monospace",
              }}
            >
              SUPER EFFECTIVE!
            </div>
          </div>
        )}

        {/* Creativity score */}
        {frame >= 400 && (
          <div
            style={{
              opacity: scoreOpacity,
              display: "flex",
              alignItems: "center",
              gap: 15,
              fontFamily: "'Courier New', monospace",
            }}
          >
            <span style={{ fontSize: 20, color: "#888" }}>CREATIVITY:</span>
            <div style={{ display: "flex", gap: 4 }}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div
                  key={n}
                  style={{
                    width: 30,
                    height: 30,
                    backgroundColor: n <= 7 ? "#ff6b35" : "#1a1a2e",
                    border: `2px solid ${n <= 7 ? "#ff6b35" : "#333"}`,
                    borderRadius: 2,
                    boxShadow: n <= 7 ? "0 0 8px #ff6b3560" : "none",
                  }}
                />
              ))}
            </div>
            <span style={{ fontSize: 24, color: "#ff6b35", fontWeight: 900 }}>
              7/10
            </span>
          </div>
        )}

        {/* Narrative */}
        {frame >= 450 && (
          <div
            style={{
              opacity: narrativeOpacity,
              padding: "25px 30px",
              backgroundColor: "rgba(255, 107, 53, 0.05)",
              border: "1px solid #ff6b3530",
              borderRadius: 4,
              maxWidth: 900,
            }}
          >
            <TypeWriter
              text="Your fireball engulfs the Slime King's crown! The gelatinous monarch shrieks as fire — his greatest weakness — sears through his body. Chunks of molten slime splatter across the arena."
              startFrame={0}
              charsPerFrame={1}
              fontSize={24}
              color="#cccccc"
              showCursor={false}
            />
          </div>
        )}
      </div>

      {/* Attack flash overlay */}
      <AbsoluteFill
        style={{
          backgroundColor: `rgba(255, 107, 53, ${attackFlash})`,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
