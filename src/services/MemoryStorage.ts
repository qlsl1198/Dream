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

const MEMORIES_KEY = 'memory_records';

export class MemoryStorage {
  static async saveMemory(memory: MemoryRecord): Promise<void> {
    const existing = await this.getMemories();
    const updated = [memory, ...existing.filter((m) => m.id !== memory.id)];
    await AsyncStorage.setItem(MEMORIES_KEY, JSON.stringify(updated));
  }

  static async getMemories(): Promise<MemoryRecord[]> {
    try {
      const json = await AsyncStorage.getItem(MEMORIES_KEY);
      return json ? JSON.parse(json) : [];
    } catch {
      return [];
    }
  }

  static async deleteMemory(id: string): Promise<void> {
    const existing = await this.getMemories();
    await AsyncStorage.setItem(
      MEMORIES_KEY,
      JSON.stringify(existing.filter((m) => m.id !== id))
    );
  }

  static async clearAll(): Promise<void> {
    await AsyncStorage.removeItem(MEMORIES_KEY);
  }
}
