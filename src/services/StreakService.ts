import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateStreak } from '../utils/dreamHelpers';
import { DreamStorage } from './DreamStorage';

const STREAK_KEY = 'dream_streak_meta';

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  totalDreams: number;
  todayLogged: boolean;
}

export class StreakService {
  static async getStreakInfo(): Promise<StreakInfo> {
    const dreams = await DreamStorage.getDreams();
    const dates = dreams.map((d) => d.date);
    const currentStreak = calculateStreak(dates);
    const today = new Date().toISOString().split('T')[0];
    const todayLogged = dates.includes(today);

    let longestStreak = currentStreak;
    try {
      const saved = await AsyncStorage.getItem(STREAK_KEY);
      if (saved) {
        const meta = JSON.parse(saved);
        longestStreak = Math.max(meta.longestStreak || 0, currentStreak);
      }
    } catch {
      // ignore
    }

    await AsyncStorage.setItem(
      STREAK_KEY,
      JSON.stringify({ longestStreak, updatedAt: new Date().toISOString() })
    );

    return {
      currentStreak,
      longestStreak,
      totalDreams: dreams.length,
      todayLogged,
    };
  }
}
