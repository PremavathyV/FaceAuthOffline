/**
 * FaceRecognitionService
 * Uses native Kotlin TFLite module to run MobileFaceNet on device.
 * Real 128-d face embeddings — actual face comparison.
 */
import { NativeModules } from 'react-native';
import { UserRecord } from './database';

const { FaceRecognitionModule } = NativeModules;
const SIMILARITY_THRESHOLD = 0.60;
const EMBEDDING_DIM = 192; // MobileFaceNet model outputs 192-d

export const FaceRecognitionService = {

  /**
   * Extract real 128-d face embedding from photo using MobileFaceNet TFLite
   * @param imagePath - file:// URI of captured photo
   */
  async extractEmbedding(imagePath: string): Promise<number[] | null> {
    try {
      if (FaceRecognitionModule && FaceRecognitionModule.extractEmbedding) {
        const embedding: number[] = await FaceRecognitionModule.extractEmbedding(imagePath);
        return embedding;
      }
      return null;
    } catch (e) {
      console.error('TFLite inference error:', e);
      return null;
    }
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
      console.log(`Comparing with ${user.name}: score=${score.toFixed(3)}`);
      if (score > bestScore) { bestScore = score; bestUser = user; }
    }
    console.log(`Best score: ${bestScore.toFixed(3)}, threshold: ${SIMILARITY_THRESHOLD}`);
    return bestScore >= SIMILARITY_THRESHOLD ? bestUser : null;
  },
};
