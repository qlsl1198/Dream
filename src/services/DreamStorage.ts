import AsyncStorage from '@react-native-async-storage/async-storage';
import { withStorageLock } from './StorageQueue';
import { validateDream } from './BackupValidation';
import { localDateKey } from '../utils/dreamHelpers';
import { DreamTypeKey } from '../constants/AppConfig';

export interface DreamRecord {
  id: string;
  content: string;
  emotion: string;
  interpretation: string;
  date: string;
  createdAt: string;
  confidence: number;
  recommendations?: string[];
  themes?: string[];
  matchedSymbols?: string[];
  isFavorite?: boolean;
  vividness?: number;
  moodBefore?: string;
  moodAfter?: string;
  sleepQuality?: number;
  dreamType?: DreamTypeKey;
  tags?: string[];
  notes?: string;
}

const DREAMS_KEY = 'dream_records';

export class DreamStorage {
  static async saveDream(dream: DreamRecord, clearDraft = false): Promise<void> {
    return withStorageLock(async () => {
    try {
      const existingDreams = await this.getDreams();
      const updatedDreams = [dream, ...existingDreams.filter((d) => d.id !== dream.id)];
      const serialized = JSON.stringify(updatedDreams);
      if (clearDraft) await AsyncStorage.multiSet([[DREAMS_KEY, serialized], ['dream_draft', '']]);
      else await AsyncStorage.setItem(DREAMS_KEY, serialized);
    } catch (error) {
      console.error('꿈 저장 오류:', error);
      throw new Error('꿈을 저장하는 중 오류가 발생했습니다.');
    }
    });
  }

  static async updateDream(id: string, updates: Partial<DreamRecord>): Promise<DreamRecord | null> {
    return withStorageLock(async () => {
    try {
      const dreams = await this.getDreams();
      const index = dreams.findIndex((d) => d.id === id);
      if (index === -1) return null;

      const updated = { ...dreams[index], ...updates };
      dreams[index] = updated;
      await AsyncStorage.setItem(DREAMS_KEY, JSON.stringify(dreams));
      return updated;
    } catch (error) {
      console.error('꿈 업데이트 오류:', error);
      throw new Error('꿈을 수정하는 중 오류가 발생했습니다.');
    }
    });
  }

  static async getDreams(): Promise<DreamRecord[]> {
    try {
      const dreamsJson = await AsyncStorage.getItem(DREAMS_KEY);
      const dreams: unknown = dreamsJson ? JSON.parse(dreamsJson) : [];
      if (!Array.isArray(dreams) || !dreams.every(validateDream)) throw new Error('저장된 꿈 기록을 읽을 수 없습니다.');
      return dreams.sort((a, b) => {
        const aTime = a.createdAt || a.date;
        const bTime = b.createdAt || b.date;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });
    } catch (error) {
      console.error('꿈 불러오기 오류:', error);
      throw new Error('저장된 기록을 읽지 못했습니다. 기존 데이터는 보존됩니다.');
    }
  }

  static async getDreamById(id: string): Promise<DreamRecord | null> {
    const dreams = await this.getDreams();
    return dreams.find((d) => d.id === id) || null;
  }

  static async searchDreams(query: string): Promise<DreamRecord[]> {
    const dreams = await this.getDreams();
    const q = query.trim().toLowerCase();
    if (!q) return dreams;

    return dreams.filter((dream) => {
      const haystack = [
        dream.content,
        dream.interpretation,
        dream.emotion,
        dream.notes || '',
        ...(dream.tags || []),
        ...(dream.themes || []),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  static async getFavorites(): Promise<DreamRecord[]> {
    const dreams = await this.getDreams();
    return dreams.filter((d) => d.isFavorite);
  }

  static async toggleFavorite(id: string): Promise<boolean> {
    const dream = await this.getDreamById(id);
    if (!dream) return false;
    const next = !dream.isFavorite;
    await this.updateDream(id, { isFavorite: next });
    return next;
  }

  static async deleteDream(id: string): Promise<void> {
    return withStorageLock(async () => {
    try {
      const existingDreams = await this.getDreams();
      const updatedDreams = existingDreams.filter((dream) => dream.id !== id);
      await AsyncStorage.setItem(DREAMS_KEY, JSON.stringify(updatedDreams));
    } catch (error) {
      console.error('꿈 삭제 오류:', error);
      throw new Error('꿈을 삭제하는 중 오류가 발생했습니다.');
    }
    });
  }

  static async clearAllDreams(): Promise<void> {
    try {
      await AsyncStorage.removeItem(DREAMS_KEY);
    } catch (error) {
      console.error('모든 꿈 삭제 오류:', error);
      throw new Error('모든 꿈을 삭제하는 중 오류가 발생했습니다.');
    }
  }

  static async getDreamDates(): Promise<string[]> {
    const dreams = await this.getDreams();
    return dreams.map((d) => d.date);
  }

  static async getTodayCount(): Promise<number> {
    const today = localDateKey();
    const dreams = await this.getDreams();
    return dreams.filter((d) => d.date === today).length;
  }
}
