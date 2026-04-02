import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

export const Tagline = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = ["YOUR", "WORDS", "ARE", "YOUR", "WEAPONS"];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a14",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Radial glow */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,107,53,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Words appear one by one */}
      <div
        style={{
          display: "flex",
          gap: 25,
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: 1200,
        }}
      >
        {words.map((word, i) => {
          const delay = i * 12;
          const wordScale = spring({
            frame,
            fps,
            config: { damping: 10, stiffness: 120, mass: 0.8 },
            delay: 15 + delay,
          });

          const isWeapons = word === "WEAPONS";

          return (
            <span
              key={i}
              style={{
                fontSize: isWeapons ? 110 : 90,
                fontFamily: "'Courier New', monospace",
                fontWeight: 900,
                color: isWeapons ? "#ff6b35" : "#ffffff",
                textShadow: isWeapons
                  ? "0 0 30px #ff6b3580, 0 0 60px #ff6b3540"
                  : "0 0 20px rgba(255,255,255,0.2)",
                transform: `scale(${wordScale})`,
                opacity: wordScale,
              }}
            >
              {word}
            </span>
          );
        })}
      </div>

      {/* Underline */}
      <div
        style={{
          marginTop: 40,
          height: 3,
          backgroundColor: "#ff6b35",
          boxShadow: "0 0 15px #ff6b35",
          width: interpolate(frame, [100, 140], [0, 700], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />

      {/* Sub text */}
      <div
        style={{
          marginTop: 30,
          fontSize: 28,
          fontFamily: "'Courier New', monospace",
          color: "#00ff41",
          opacity: interpolate(frame, [140, 160], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          letterSpacing: 4,
        }}
      >
        A TURN-BASED RPG POWERED BY AI
      </div>
    </AbsoluteFill>
  );
};
