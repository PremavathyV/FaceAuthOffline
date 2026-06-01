export type ChallengeType = 'blink' | 'smile' | 'turn_left' | 'turn_right';

export interface LivenessChallenge {
  type: ChallengeType;
  instruction: string;
}

const CHALLENGES: LivenessChallenge[] = [
  { type: 'blink',      instruction: '👁  Please blink your eyes' },
  { type: 'smile',      instruction: '😊  Please smile' },
  { type: 'turn_left',  instruction: '⬅️  Turn your head slightly left' },
  { type: 'turn_right', instruction: '➡️  Turn your head slightly right' },
];

export const LivenessDetector = {
  getRandomChallenge(): LivenessChallenge {
    return CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
  },

  async verify(_imagePath: string, _challenge: LivenessChallenge): Promise<boolean> {
    return true; // Passive check stub — replace with TFLite model
  },
};
