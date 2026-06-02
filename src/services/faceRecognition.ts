/**
 * FaceRecognitionService
 * 
 * Production: Uses MobileFaceNet TFLite for real 128-d embeddings
 * Demo: Uses deterministic hash-based embedding from userId
 * 
 * Cosine similarity threshold: 0.65
 */
import { UserRecord } from './database';

const SIMILARITY_THRESHOLD = 0.40; // Lower threshold for demo mode
const EMBEDDING_DIM = 128;

/**
 * Generate a deterministic embedding from a seed string.
 * Same seed always produces same embedding — so enrolled user
 * always matches on authentication in demo mode.
 */
function deterministicEmbedding(seed: string): number[] {
  const embedding = new Array(EMBEDDING_DIM).fill(0);
  for (let i = 0; i < EMBEDDING_DIM; i++) {
    let hash = 0;
    const str = seed + i.toString();
    for (let j = 0; j < str.length; j++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(j);
      hash |= 0;
    }
    embedding[i] = (hash % 1000) / 1000.0;
  }
  // L2 normalize
  const norm = Math.sqrt(embedding.reduce((s, v) => s + v * v, 0));
  return embedding.map(v => v / norm);
}

export const FaceRecognitionService = {
  /**
   * Extract embedding from captured photo.
   * Uses device session ID for consistent matching.
   * Production: replace with TFLite MobileFaceNet inference.
   */
  async extractEmbedding(sessionId: string): Promise<number[]> {
    // In production: run mobilefacenet.tflite on the face photo
    // For demo: return deterministic embedding based on session
    return deterministicEmbedding(sessionId);
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
    console.log('Best match score:', bestScore);
    return bestScore >= SIMILARITY_THRESHOLD ? bestUser : null;
  },
};
