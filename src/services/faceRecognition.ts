/**
 * FaceRecognitionService
 * Uses MobileFaceNet embeddings (128-d cosine similarity).
 * TFLite inference is stubbed for prototype — replace with
 * react-native-fast-tflite when building production APK.
 */
import { UserRecord } from './database';

const SIMILARITY_THRESHOLD = 0.65;
const EMBEDDING_DIM = 128;

export const FaceRecognitionService = {
  /**
   * Extract 128-d face embedding from image path.
   * Stub: returns null until TFLite model is linked.
   */
  async extractEmbedding(_imagePath: string): Promise<number[] | null> {
    // TODO: integrate react-native-fast-tflite for real inference
    return null;
  },

  cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0;
    for (let i = 0; i < EMBEDDING_DIM; i++) dot += (a[i] ?? 0) * (b[i] ?? 0);
    return dot;
  },

  findBestMatch(queryEmbedding: number[], users: UserRecord[]): UserRecord | null {
    let bestScore = -1;
    let bestUser: UserRecord | null = null;
    for (const user of users) {
      const score = this.cosineSimilarity(queryEmbedding, user.embedding);
      if (score > bestScore) { bestScore = score; bestUser = user; }
    }
    return bestScore >= SIMILARITY_THRESHOLD ? bestUser : null;
  },
};
