import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { TypeWriter } from "../components/TypeWriter";

export const HowItWorks = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const steps = [
    {
      icon: "⌨️",
      title: "TYPE YOUR ATTACK",
      desc: '"I cast a fireball at the slime\'s crown!"',
      startFrame: 0,
    },
    {
      icon: "🤖",
      title: "AI EVALUATES",
      desc: "Claude AI scores creativity & strategy",
      startFrame: 120,
    },
    {
      icon: "💥",
      title: "DEAL DAMAGE",
      desc: "Higher creativity = more damage!",
      startFrame: 240,
    },
  ];

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
      {/* Section title */}
      <div
        style={{
          fontSize: 52,
          fontFamily: "'Courier New', monospace",
          fontWeight: 900,
          color: "#00ff41",
          marginBottom: 80,
          textShadow: "0 0 20px #00ff4140",
          opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(frame, [0, 15], [20, 0], { extrapolateRight: "clamp" })}px)`,
        }}
      >
        {"// HOW IT WORKS"}
      </div>

      {/* Steps */}
      <div style={{ display: "flex", gap: 60 }}>
        {steps.map((step, i) => {
          const stepProgress = spring({
            frame,
            fps,
            config: { damping: 12, stiffness: 100 },
            delay: step.startFrame + 20,
          });

          return (
            <div
              key={i}
              style={{
                width: 480,
                padding: 40,
                backgroundColor: "rgba(0, 255, 65, 0.04)",
                border: "2px solid #00ff4130",
                borderRadius: 4,
                transform: `scale(${stepProgress}) translateY(${(1 - stepProgress) * 30}px)`,
                opacity: stepProgress,
              }}
            >
              {/* Step number */}
              <div
                style={{
                  fontSize: 18,
                  fontFamily: "'Courier New', monospace",
                  color: "#ff6b35",
                  marginBottom: 15,
                  letterSpacing: 3,
                }}
              >
                STEP {i + 1}
              </div>

              {/* Icon */}
              <div style={{ fontSize: 60, marginBottom: 20 }}>{step.icon}</div>

              {/* Title */}
              <div
                style={{
                  fontSize: 28,
                  fontFamily: "'Courier New', monospace",
                  fontWeight: 900,
                  color: "#ffffff",
                  marginBottom: 15,
                }}
              >
                {step.title}
              </div>

              {/* Description with typewriter */}
              {frame > step.startFrame + 40 && (
                <TypeWriter
                  text={step.desc}
                  startFrame={0}
                  charsPerFrame={0.6}
                  fontSize={22}
                  color="#888888"
                  showCursor={false}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Connector arrows */}
      {[0, 1].map((i) => {
        const arrowOpacity = interpolate(
          frame,
          [steps[i].startFrame + 80, steps[i].startFrame + 100],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "55%",
              left: `${33 + i * 33}%`,
              transform: "translateX(-50%)",
              fontSize: 40,
              color: "#ff6b35",
              opacity: arrowOpacity,
              textShadow: "0 0 10px #ff6b3560",
            }}
          >
            →
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
