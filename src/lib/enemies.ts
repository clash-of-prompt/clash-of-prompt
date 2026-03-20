export interface Enemy {
  id: number;
  name: string;
  hp: number;
  atk: number;
  def: number;
  weakness: string[];
  personality: string;
  specialAbilities: string[];
  description: string;
  difficulty: "easy" | "medium" | "boss";
}

export const ENEMIES: Enemy[] = [
  {
    id: 1,
    name: "Slime King",
    hp: 80,
    atk: 8,
    def: 3,
    weakness: ["fire", "piercing"],
    personality: "Cocky and overconfident. Underestimates the player. Taunts frequently.",
    specialAbilities: ["Split into smaller slimes", "Acid splash"],
    description:
      "A wobbling mass of green slime wearing a tiny golden crown. It jiggles menacingly.",
    difficulty: "easy",
  },
  {
    id: 2,
    name: "Shadow Wolf",
    hp: 120,
    atk: 15,
    def: 8,
    weakness: ["light", "loud noises"],
    personality:
      "Cunning and strategic. Circles the player, looking for openings. Silent and deadly.",
    specialAbilities: ["Shadow step (dodge)", "Pack howl (fear)", "Fang combo"],
    description:
      "A wolf made of living shadow, with glowing red eyes. It phases in and out of darkness.",
    difficulty: "medium",
  },
  {
    id: 3,
    name: "Ancient Golem",
    hp: 160,
    atk: 20,
    def: 15,
    weakness: ["water", "precision strikes at joints"],
    personality:
      "Slow but honorable. Respects worthy opponents. Speaks in ancient riddles.",
    specialAbilities: [
      "Earthquake stomp",
      "Stone armor (shield)",
      "Ancient curse",
    ],
    description:
      "A towering construct of ancient stone, covered in glowing runes. Each step shakes the ground.",
    difficulty: "boss",
  },
];

export function getEnemyById(id: number): Enemy | undefined {
  return ENEMIES.find((e) => e.id === id);
}
