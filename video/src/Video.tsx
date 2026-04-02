import { AbsoluteFill, Sequence } from "remotion";
import { GlitchIntro } from "./scenes/GlitchIntro";
import { Tagline } from "./scenes/Tagline";
import { HowItWorks } from "./scenes/HowItWorks";
import { BattleDemo } from "./scenes/BattleDemo";
import { EnemiesShowcase } from "./scenes/EnemiesShowcase";
import { Features } from "./scenes/Features";
import { CallToAction } from "./scenes/CallToAction";
import { Scanlines } from "./components/Scanlines";

export const ClashOfPromptVideo = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      {/* Scene 1: Glitch Intro (0-5s) */}
      <Sequence from={0} durationInFrames={150} name="Glitch Intro">
        <GlitchIntro />
      </Sequence>

      {/* Scene 2: Tagline (5-12s) */}
      <Sequence from={150} durationInFrames={210} name="Tagline">
        <Tagline />
      </Sequence>

      {/* Scene 3: How It Works (12-28s) */}
      <Sequence from={360} durationInFrames={480} name="How It Works">
        <HowItWorks />
      </Sequence>

      {/* Scene 4: Battle Demo (28-50s) */}
      <Sequence from={840} durationInFrames={660} name="Battle Demo">
        <BattleDemo />
      </Sequence>

      {/* Scene 5: Enemies Showcase (50-65s) */}
      <Sequence from={1500} durationInFrames={450} name="Enemies">
        <EnemiesShowcase />
      </Sequence>

      {/* Scene 6: Features (65-78s) */}
      <Sequence from={1950} durationInFrames={390} name="Features">
        <Features />
      </Sequence>

      {/* Scene 7: Call to Action (78-90s) */}
      <Sequence from={2340} durationInFrames={360} name="CTA">
        <CallToAction />
      </Sequence>

      {/* CRT Scanline overlay on everything */}
      <Scanlines />
    </AbsoluteFill>
  );
};
