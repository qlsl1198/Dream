import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DreamRecord {
  id: string;
  content: string;
  emotion: string;
  interpretation: string;
  date: string;
  confidence: number;
  recommendations?: string[];
  // 꿈 일기 & 감정 추적 추가 필드
  vividness?: number; // 꿈의 생생함 정도 (1-10)
  moodBefore?: string; // 꿈 전 기분
  moodAfter?: string; // 꿈 후 기분
  sleepQuality?: number; // 수면 품질 (1-10)
  dreamType?: 'normal' | 'lucid' | 'nightmare' | 'recurring'; // 꿈 유형
  tags?: string[]; // 꿈 태그
  notes?: string; // 개인 메모
}

const DREAMS_KEY = 'dream_records';

export class DreamStorage {
  static async saveDream(dream: DreamRecord): Promise<void> {
    try {
      const existingDreams = await this.getDreams();
      const updatedDreams = [dream, ...existingDreams];
      await AsyncStorage.setItem(DREAMS_KEY, JSON.stringify(updatedDreams));
    } catch (error) {
      console.error('꿈 저장 오류:', error);
      throw new Error('꿈을 저장하는 중 오류가 발생했습니다.');
    }
  }

  static async getDreams(): Promise<DreamRecord[]> {
    try {
      const dreamsJson = await AsyncStorage.getItem(DREAMS_KEY);
      return dreamsJson ? JSON.parse(dreamsJson) : [];
    } catch (error) {
      console.error('꿈 불러오기 오류:', error);
      return [];
    }
  }

  static async deleteDream(id: string): Promise<void> {
    try {
      const existingDreams = await this.getDreams();
      const updatedDreams = existingDreams.filter(dream => dream.id !== id);
      await AsyncStorage.setItem(DREAMS_KEY, JSON.stringify(updatedDreams));
    } catch (error) {
      console.error('꿈 삭제 오류:', error);
      throw new Error('꿈을 삭제하는 중 오류가 발생했습니다.');
    }
  }

  static async clearAllDreams(): Promise<void> {
    try {
      await AsyncStorage.removeItem(DREAMS_KEY);
    } catch (error) {
      console.error('모든 꿈 삭제 오류:', error);
      throw new Error('모든 꿈을 삭제하는 중 오류가 발생했습니다.');
    }
  }
}
