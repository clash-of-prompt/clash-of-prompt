import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";
import { TypeWriter } from "../components/TypeWriter";

export const HowItWorks = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: Keyboard + typing (0-180)
  // Phase 2: AI brain processing (180-320)
  // Phase 3: Damage explosion (320-480)

  const phase = frame < 180 ? 1 : frame < 320 ? 2 : 3;

  // Keyboard scene
  const kbOpacity = interpolate(frame, [0, 20, 160, 180], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const kbScale = interpolate(frame, [0, 20], [1.05, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Step labels
  const step1Scale = spring({ frame, fps, config: { damping: 10, stiffness: 100 }, delay: 5 });
  const step2Scale = spring({ frame, fps, config: { damping: 10, stiffness: 100 }, delay: 185 });
  const step3Scale = spring({ frame, fps, config: { damping: 10, stiffness: 100 }, delay: 325 });

  // Battle scene for phase 3
  const battleOpacity = interpolate(frame, [320, 340, 460, 480], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // AI processing visual
  const aiOpacity = interpolate(frame, [180, 200, 300, 320], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Creativity meter animation
  const meterFill = interpolate(frame, [230, 290], [0, 0.8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Damage number
  const dmgScale = spring({ frame, fps, config: { damping: 6, stiffness: 120 }, delay: 370 });

  // Screen shake on damage
  const shakeX = frame >= 365 && frame <= 385 ? Math.sin(frame * 30) * interpolate(frame, [365, 385], [10, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#050510", transform: `translateX(${shakeX}px)` }}>
      {/* Phase 1: Typing */}
      <div style={{ position: "absolute", inset: 0, opacity: kbOpacity }}>
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          transform: `scale(${kbScale})`,
        }}>
          <Img src={staticFile("assets/keyboard.png")} style={{
            height: 500, imageRendering: "pixelated", opacity: 0.6,
          }} />
        </div>

        {/* Step label */}
        <div style={{
          position: "absolute", top: 60, left: "50%", transform: `translateX(-50%) scale(${step1Scale})`,
        }}>
          <div style={{
            fontSize: 22, color: "#00ff41", fontFamily: "'Courier New', monospace",
            letterSpacing: 6, opacity: 0.6,
          }}>STEP 01</div>
          <div style={{
            fontSize: 48, color: "#ffffff", fontFamily: "'Courier New', monospace", fontWeight: 900,
            textShadow: "0 0 20px rgba(255,255,255,0.2)",
          }}>TYPE YOUR ATTACK</div>
        </div>

        {/* Typing prompt overlay */}
        <div style={{
          position: "absolute", bottom: 120, left: "50%", transform: "translateX(-50%)",
          width: 800, padding: "20px 30px",
          background: "rgba(0,0,0,0.8)", border: "2px solid #00ff4140", borderRadius: 4,
        }}>
          <div style={{ fontSize: 14, color: "#00ff4180", fontFamily: "'Courier New', monospace", marginBottom: 8 }}>
            {">"} YOUR ACTION:
          </div>
          <TypeWriter
            text='I cast a fireball at the Slime King, exploiting his fire weakness!'
            startFrame={30}
            charsPerFrame={0.7}
            fontSize={24}
            color="#ffffff"
          />
        </div>
      </div>

      {/* Phase 2: AI Processing */}
      <div style={{ position: "absolute", inset: 0, opacity: aiOpacity, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          position: "absolute", top: 60, left: "50%", transform: `translateX(-50%) scale(${step2Scale})`,
        }}>
          <div style={{ fontSize: 22, color: "#ff6b35", fontFamily: "'Courier New', monospace", letterSpacing: 6, opacity: 0.6 }}>STEP 02</div>
          <div style={{ fontSize: 48, color: "#ffffff", fontFamily: "'Courier New', monospace", fontWeight: 900, textShadow: "0 0 20px rgba(255,255,255,0.2)" }}>AI EVALUATES</div>
        </div>

        {/* Creativity meter */}
        <div style={{ width: 600 }}>
          <div style={{ fontSize: 20, color: "#888", fontFamily: "'Courier New', monospace", marginBottom: 12, textAlign: "center" }}>
            CREATIVITY SCORE
          </div>
          <div style={{ width: "100%", height: 40, background: "#111", border: "2px solid #333", borderRadius: 4, overflow: "hidden" }}>
            <div style={{
              width: `${meterFill * 100}%`, height: "100%",
              background: "linear-gradient(90deg, #ff6b35, #00ff41)",
              boxShadow: `0 0 20px rgba(0,255,65,${meterFill * 0.5})`,
              transition: "none",
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontFamily: "'Courier New', monospace" }}>
            <span style={{ color: "#666", fontSize: 16 }}>GENERIC</span>
            <span style={{
              color: "#00ff41", fontSize: 28, fontWeight: 900,
              opacity: meterFill > 0.5 ? 1 : 0,
              textShadow: "0 0 15px rgba(0,255,65,0.5)",
            }}>8 / 10</span>
            <span style={{ color: "#00ff41", fontSize: 16 }}>BRILLIANT</span>
          </div>
        </div>

        {/* Analysis lines */}
        {[
          { text: "Relevance: exploits weakness", delay: 220, color: "#00ff41" },
          { text: "Strategy: targets known vulnerability", delay: 240, color: "#ff6b35" },
          { text: "Creativity: specific + dramatic", delay: 260, color: "#4488ff" },
        ].map((line, i) => {
          const lineOp = interpolate(frame, [line.delay, line.delay + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={i} style={{
              marginTop: i === 0 ? 40 : 8, opacity: lineOp,
              fontSize: 18, color: line.color, fontFamily: "'Courier New', monospace",
              transform: `translateX(${(1 - lineOp) * 20}px)`,
            }}>
              [{"\u2713"}] {line.text}
            </div>
          );
        })}
      </div>

      {/* Phase 3: Damage */}
      <div style={{ position: "absolute", inset: 0, opacity: battleOpacity }}>
        {/* Battle scene background */}
        <Img src={staticFile("assets/battle-scene.png")} style={{
          width: "100%", height: "100%", objectFit: "cover", imageRendering: "pixelated", opacity: 0.5,
        }} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(5,5,16,0.4)" }} />

        <div style={{ position: "absolute", top: 60, left: "50%", transform: `translateX(-50%) scale(${step3Scale})` }}>
          <div style={{ fontSize: 22, color: "#ff3333", fontFamily: "'Courier New', monospace", letterSpacing: 6, opacity: 0.6 }}>STEP 03</div>
          <div style={{ fontSize: 48, color: "#ffffff", fontFamily: "'Courier New', monospace", fontWeight: 900, textShadow: "0 0 20px rgba(255,255,255,0.2)" }}>DEAL DAMAGE</div>
        </div>

        {/* Big damage number */}
        <div style={{
          position: "absolute", top: "40%", left: "50%",
          transform: `translate(-50%, -50%) scale(${dmgScale})`,
          textAlign: "center",
        }}>
          <div style={{
            fontSize: 160, fontWeight: 900, fontFamily: "'Courier New', monospace",
            color: "#ff6b35",
            textShadow: "0 0 60px rgba(255,107,53,0.8), 0 0 120px rgba(255,107,53,0.4)",
          }}>-32</div>
          <div style={{
            fontSize: 36, color: "#00ff41", fontFamily: "'Courier New', monospace", fontWeight: 900,
            textShadow: "0 0 20px rgba(0,255,65,0.5)",
            opacity: interpolate(frame, [390, 400], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}>SUPER EFFECTIVE!</div>
        </div>
      </div>

      {/* Flash on damage */}
      {frame >= 365 && frame <= 375 && (
        <AbsoluteFill style={{
          backgroundColor: `rgba(255,107,53,${interpolate(frame, [365, 368, 375], [0, 0.5, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
        }} />
      )}
    </AbsoluteFill>
  );
};
