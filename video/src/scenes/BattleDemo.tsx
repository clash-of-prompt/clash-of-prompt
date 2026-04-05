import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";
import { TypeWriter } from "../components/TypeWriter";

export const BattleDemo = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Full simulated battle UI
  // Phase 1: UI appears (0-60)
  // Phase 2: Player types (60-240)
  // Phase 3: Attack + results (240-450)
  // Phase 4: Enemy counter (450-660)

  const uiScale = spring({ frame, fps, config: { damping: 12, stiffness: 80 }, delay: 5 });

  // HP animations
  const enemyHpPercent = frame < 280 ? 100 : interpolate(frame, [280, 340], [100, 65], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const playerHpPercent = frame < 480 ? 100 : interpolate(frame, [480, 520], [100, 88], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Attack flash
  const attackFlash = frame >= 270 && frame <= 290 ? interpolate(frame, [270, 275, 290], [0, 0.5, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  // Screen shake
  const shakeX = frame >= 270 && frame <= 300 ? Math.sin(frame * 25) * interpolate(frame, [270, 300], [8, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const shakeX2 = frame >= 470 && frame <= 500 ? Math.sin(frame * 20) * interpolate(frame, [470, 500], [5, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  // Damage popup
  const dmgShow = interpolate(frame, [290, 300, 400, 420], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dmgScale = spring({ frame, fps, config: { damping: 8, stiffness: 150 }, delay: 290 });

  // Narrative
  const narrativeOp = interpolate(frame, [340, 360], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Enemy counter
  const counterOp = interpolate(frame, [450, 470], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const counterFlash = frame >= 470 && frame <= 485 ? interpolate(frame, [470, 475, 485], [0, 0.3, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  // Creativity score animation
  const scoreReveal = interpolate(frame, [310, 330], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scoreValue = 8;

  return (
    <AbsoluteFill style={{
      backgroundColor: "#050510",
      transform: `scale(${uiScale}) translateX(${shakeX + shakeX2}px)`,
    }}>
      {/* Subtle battle scene background */}
      <Img src={staticFile("assets/battle-scene.png")} style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        objectFit: "cover", imageRendering: "pixelated", opacity: 0.15,
      }} />
      <div style={{ position: "absolute", inset: 0, background: "rgba(5,5,16,0.7)" }} />

      {/* Battle header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        padding: "30px 60px", borderBottom: "2px solid #1a1a2e",
      }}>
        {/* Player side */}
        <div style={{ width: 500 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <Img src={staticFile("assets/hero.png")} style={{ width: 48, height: 48, borderRadius: 4, objectFit: "cover", imageRendering: "pixelated", border: "2px solid #00ff4140" }} />
            <span style={{ fontSize: 24, fontFamily: "'Courier New', monospace", fontWeight: 900, color: "#00ff41" }}>YOU</span>
          </div>
          {/* Player HP bar */}
          <div style={{ width: "100%", height: 20, background: "#111", border: "1px solid #333", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ width: `${playerHpPercent}%`, height: "100%", background: playerHpPercent > 50 ? "#00ff41" : "#ffaa00", boxShadow: "0 0 8px rgba(0,255,65,0.3)" }} />
          </div>
          <div style={{ fontSize: 14, color: "#888", fontFamily: "'Courier New', monospace", marginTop: 4 }}>{Math.round(playerHpPercent)}/100</div>
        </div>

        <div style={{ fontSize: 20, color: "#444", fontFamily: "'Courier New', monospace", paddingTop: 20 }}>Turn 1/20</div>

        {/* Enemy side */}
        <div style={{ width: 500, textAlign: "right" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "flex-end", marginBottom: 10 }}>
            <span style={{ fontSize: 24, fontFamily: "'Courier New', monospace", fontWeight: 900, color: "#ff3333" }}>SLIME KING</span>
            <Img src={staticFile("assets/slime-king.png")} style={{ width: 48, height: 48, borderRadius: 4, objectFit: "cover", imageRendering: "pixelated", border: "2px solid #ff333340" }} />
          </div>
          <div style={{ width: "100%", height: 20, background: "#111", border: "1px solid #333", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ width: `${enemyHpPercent}%`, height: "100%", background: enemyHpPercent > 50 ? "#ff3333" : "#ffaa00", boxShadow: "0 0 8px rgba(255,51,51,0.3)", marginLeft: "auto" }} />
          </div>
          <div style={{ fontSize: 14, color: "#888", fontFamily: "'Courier New', monospace", marginTop: 4 }}>{Math.round(enemyHpPercent * 0.8)}/80</div>
        </div>
      </div>

      {/* Battle log area */}
      <div style={{ flex: 1, padding: "30px 60px", display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Player prompt */}
        {frame >= 60 && (
          <div style={{
            background: "rgba(0,255,65,0.03)", border: "1px solid #00ff4120",
            padding: "20px 25px", borderRadius: 4, maxWidth: 800,
          }}>
            <div style={{ fontSize: 14, color: "#00ff4180", fontFamily: "'Courier New', monospace", marginBottom: 8 }}>{">"} YOUR ACTION:</div>
            <TypeWriter
              text="I hurl a massive fireball at the Slime King's crown, aiming to melt his royal symbol and exploit his fire weakness!"
              startFrame={80}
              charsPerFrame={0.8}
              fontSize={22}
              color="#ffffff"
            />
          </div>
        )}

        {/* Creativity score */}
        {frame >= 310 && (
          <div style={{ opacity: scoreReveal, display: "flex", alignItems: "center", gap: 12, fontFamily: "'Courier New', monospace" }}>
            <span style={{ color: "#666", fontSize: 16 }}>CREATIVITY:</span>
            <div style={{ display: "flex", gap: 3 }}>
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} style={{
                  width: 24, height: 24, borderRadius: 2,
                  background: i < scoreValue ? `hsl(${20 + i * 12}, 100%, 55%)` : "#1a1a2e",
                  border: `1px solid ${i < scoreValue ? `hsl(${20 + i * 12}, 100%, 55%)` : "#333"}`,
                  boxShadow: i < scoreValue ? `0 0 6px hsl(${20 + i * 12}, 100%, 55%)` : "none",
                  transform: `scale(${i < scoreValue ? spring({ frame, fps, config: { damping: 8, stiffness: 120 }, delay: 315 + i * 3 }) : 1})`,
                }} />
              ))}
            </div>
            <span style={{ color: "#ff6b35", fontSize: 22, fontWeight: 900 }}>{scoreValue}/10</span>
          </div>
        )}

        {/* Narrative */}
        {frame >= 340 && (
          <div style={{
            opacity: narrativeOp, padding: "20px 25px",
            background: "rgba(255,107,53,0.03)", border: "1px solid #ff6b3520", borderRadius: 4,
            maxWidth: 800,
          }}>
            <TypeWriter
              text="Your fireball engulfs the Slime King's crown! The gelatinous monarch shrieks as fire sears through his body. Chunks of molten slime splatter across the arena."
              startFrame={0}
              charsPerFrame={1.2}
              fontSize={20}
              color="#cccccc"
              showCursor={false}
            />
          </div>
        )}

        {/* Enemy counter narrative */}
        {frame >= 450 && (
          <div style={{
            opacity: counterOp, padding: "20px 25px",
            background: "rgba(255,51,51,0.03)", border: "1px solid #ff333320", borderRadius: 4,
            maxWidth: 800,
          }}>
            <TypeWriter
              text='"Heh, lucky shot!" The Slime King retaliates with an acid splash that burns your armor.'
              startFrame={0}
              charsPerFrame={1}
              fontSize={20}
              color="#ff8888"
              showCursor={false}
            />
          </div>
        )}
      </div>

      {/* Damage popup */}
      {frame >= 290 && (
        <div style={{
          position: "absolute", top: "25%", right: "20%",
          transform: `scale(${dmgScale})`, opacity: dmgShow,
          textAlign: "center",
        }}>
          <div style={{
            fontSize: 100, fontWeight: 900, fontFamily: "'Courier New', monospace",
            color: "#ff6b35", textShadow: "0 0 40px rgba(255,107,53,0.8), 0 0 80px rgba(255,107,53,0.4)",
          }}>-28</div>
        </div>
      )}

      {/* Player damage popup */}
      {frame >= 480 && (
        <div style={{
          position: "absolute", top: "25%", left: "15%",
          transform: `scale(${spring({ frame, fps, config: { damping: 8, stiffness: 150 }, delay: 480 })})`,
          opacity: interpolate(frame, [480, 490, 560, 580], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          textAlign: "center",
        }}>
          <div style={{
            fontSize: 60, fontWeight: 900, fontFamily: "'Courier New', monospace",
            color: "#ff3333", textShadow: "0 0 30px rgba(255,51,51,0.6)",
          }}>-12</div>
        </div>
      )}

      {/* Attack flash */}
      <AbsoluteFill style={{ backgroundColor: `rgba(255,107,53,${attackFlash})`, pointerEvents: "none" }} />
      <AbsoluteFill style={{ backgroundColor: `rgba(255,51,51,${counterFlash})`, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
