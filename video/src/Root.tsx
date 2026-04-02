import { Composition } from "remotion";
import { ClashOfPromptVideo } from "./Video";

export const RemotionRoot = () => {
  return (
    <Composition
      id="ClashOfPrompt"
      component={ClashOfPromptVideo}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={2700}
    />
  );
};
