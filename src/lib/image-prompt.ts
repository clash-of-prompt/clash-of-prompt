interface ImagePromptData {
  narrative: string;
  enemyNarrative: string;
  enemyName: string;
  enemyDescription: string;
}

export function buildImagePrompt(data: ImagePromptData): string {
  // Extract key action phrases (first sentence of each narrative)
  const playerAction = extractFirstSentence(data.narrative);
  const enemyAction = extractFirstSentence(data.enemyNarrative);

  return `16-bit pixel art RPG battle scene in a 2x2 comic panel grid layout. Each panel separated by thick black borders. Dark dungeon background, vibrant colors, retro SNES style. No text, no speech bubbles, no words.

Top-left panel: A pixel art warrior hero ${playerAction}
Top-right panel: The attack connects - showing the impact and damage effect on ${data.enemyName}
Bottom-left panel: ${data.enemyName} counterattacks - ${enemyAction}
Bottom-right panel: Both fighters stand facing each other after the exchange, battle damage visible

Characters: A heroic pixel art warrior with a sword. ${data.enemyName} - ${data.enemyDescription}
Art style: 16-bit SNES-era RPG pixel art, limited color palette, clean pixel edges, dramatic lighting, dark atmospheric background. Each panel is a distinct scene in the sequence.`;
}

function extractFirstSentence(text: string): string {
  // Get first sentence, max 100 chars
  const match = text.match(/^[^.!?]+[.!?]/);
  const sentence = match ? match[0] : text.slice(0, 100);
  return sentence.slice(0, 120);
}
