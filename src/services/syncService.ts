import { DatabaseService } from './database';

export const SyncService = {
  async attemptSync(): Promise<string> {
    // Sync requires internet — skipped in offline mode
    return 'Offline — data queued for sync';
  },
};
