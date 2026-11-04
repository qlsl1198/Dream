import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MemoryRecord {
  id: string;
  description: string;
  clues: string[];
  questions: string[];
  status: 'in_progress' | 'completed' | 'failed';
  date: string;
  createdAt: string;
  aiAnalysis?: string;
  recoveredMemory?: string;
}

import { validateMemory } from './BackupValidation';
import { withStorageLock } from './StorageQueue';

const MEMORIES_KEY = 'memory_records';

export class MemoryStorage {
  static async saveMemory(memory: MemoryRecord): Promise<void> {
    return withStorageLock(async () => {
    const existing = await this.getMemories();
    const updated = [memory, ...existing.filter((m) => m.id !== memory.id)];
    await AsyncStorage.setItem(MEMORIES_KEY, JSON.stringify(updated));
    });
  }

  static async getMemories(): Promise<MemoryRecord[]> {
    try {
      const json = await AsyncStorage.getItem(MEMORIES_KEY);
      const records: unknown = json ? JSON.parse(json) : [];
      if (!Array.isArray(records) || !records.every(validateMemory)) throw new Error('INVALID_MEMORY');
      return records;
    } catch {
      throw new Error('회상 기록을 읽을 수 없습니다. 기존 데이터는 보존됩니다.');
    }
  }

  static async deleteMemory(id: string): Promise<void> {
    return withStorageLock(async () => {
    const existing = await this.getMemories();
    await AsyncStorage.setItem(
      MEMORIES_KEY,
      JSON.stringify(existing.filter((m) => m.id !== id))
    );
    });
  }

  static async clearAll(): Promise<void> {
    await AsyncStorage.removeItem(MEMORIES_KEY);
  }
}
