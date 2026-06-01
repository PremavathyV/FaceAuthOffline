/**
 * In-memory + JSON storage using React Native's built-in global storage.
 * No native modules required.
 */

export interface UserRecord {
  id: string;
  name: string;
  embedding: number[];
  enrolledAt: number;
  synced: boolean;
}

export interface AttendanceRecord {
  id?: string;
  userId: string;
  timestamp: number;
  synced: boolean;
}

// In-memory store (persists during app session)
let users: UserRecord[] = [];
let attendance: AttendanceRecord[] = [];
let initialized = false;

export async function initDatabase(): Promise<void> {
  if (initialized) return;
  initialized = true;
  users = [];
  attendance = [];
}

export const DatabaseService = {
  async saveUser(user: UserRecord): Promise<void> {
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) users[idx] = user;
    else users.push(user);
  },

  async getAllUsers(): Promise<UserRecord[]> {
    return [...users];
  },

  async logAttendance(record: AttendanceRecord): Promise<void> {
    attendance.push({ ...record, id: Date.now().toString() });
  },

  async getUnsyncedAttendance(): Promise<AttendanceRecord[]> {
    return attendance.filter(r => !r.synced);
  },

  async getUnsyncedUsers(): Promise<UserRecord[]> {
    return users.filter(u => !u.synced);
  },

  async markAttendanceSynced(ids: string[]): Promise<void> {
    attendance = attendance.map(r =>
      ids.includes(r.id ?? '') ? { ...r, synced: true } : r,
    );
  },

  async markUsersSynced(ids: string[]): Promise<void> {
    users = users.map(u =>
      ids.includes(u.id) ? { ...u, synced: true } : u,
    );
  },

  async purgeSyncedData(): Promise<void> {
    attendance = attendance.filter(r => !r.synced);
  },
};
