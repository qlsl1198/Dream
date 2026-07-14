import AsyncStorage from '@react-native-async-storage/async-storage';

export interface InterpretationFeedback {
  kind: 'interpretation';
  dreamId: string;
  isAccurate: boolean;
  helpfulness: number;
  suggestions?: string;
  timestamp: string;
}

export interface SuggestionFeedback {
  kind: 'suggestion';
  id: string;
  content: string;
  type: 'suggestion' | 'bug' | 'feature' | 'other';
  date: string;
  status: 'pending' | 'reviewed';
}

export type AppFeedback = InterpretationFeedback | SuggestionFeedback;

const FEEDBACK_KEY = 'dream_feedback';
const SUGGESTION_KEY = 'app_suggestions';

export class FeedbackService {
  static async saveFeedback(feedback: InterpretationFeedback | SuggestionFeedback): Promise<void> {
    try {
      if (feedback.kind === 'suggestion' || 'content' in feedback) {
        const suggestion: SuggestionFeedback = {
          kind: 'suggestion',
          id: 'id' in feedback ? feedback.id : Date.now().toString(),
          content: (feedback as SuggestionFeedback).content,
          type: (feedback as SuggestionFeedback).type || 'suggestion',
          date: (feedback as SuggestionFeedback).date || new Date().toISOString(),
          status: (feedback as SuggestionFeedback).status || 'pending',
        };
        const existing = await this.getSuggestions();
        await AsyncStorage.setItem(SUGGESTION_KEY, JSON.stringify([...existing, suggestion]));
        return;
      }

      const existingFeedback = await this.getInterpretationFeedback();
      await AsyncStorage.setItem(FEEDBACK_KEY, JSON.stringify([...existingFeedback, feedback]));
    } catch (error) {
      console.error('피드백 저장 오류:', error);
      throw new Error('피드백을 저장하는 중 오류가 발생했습니다.');
    }
  }

  static async saveInterpretationFeedback(
    feedback: Omit<InterpretationFeedback, 'kind'>
  ): Promise<void> {
    await this.saveFeedback({ ...feedback, kind: 'interpretation' });
  }

  static async saveSuggestion(feedback: Omit<SuggestionFeedback, 'kind'>): Promise<void> {
    await this.saveFeedback({ ...feedback, kind: 'suggestion' });
  }

  static async getFeedback(): Promise<InterpretationFeedback[]> {
    return this.getInterpretationFeedback();
  }

  static async getInterpretationFeedback(): Promise<InterpretationFeedback[]> {
    try {
      const feedbackJson = await AsyncStorage.getItem(FEEDBACK_KEY);
      return feedbackJson ? JSON.parse(feedbackJson) : [];
    } catch {
      return [];
    }
  }

  static async getSuggestions(): Promise<SuggestionFeedback[]> {
    try {
      const json = await AsyncStorage.getItem(SUGGESTION_KEY);
      return json ? JSON.parse(json) : [];
    } catch {
      return [];
    }
  }

  static async getFeedbackForDream(dreamId: string): Promise<InterpretationFeedback | null> {
    const allFeedback = await this.getInterpretationFeedback();
    return allFeedback.find((feedback) => feedback.dreamId === dreamId) || null;
  }

  static async getFeedbackStats(): Promise<{
    totalFeedback: number;
    accuracyRate: number;
    averageHelpfulness: number;
  }> {
    const allFeedback = await this.getInterpretationFeedback();
    if (allFeedback.length === 0) {
      return { totalFeedback: 0, accuracyRate: 0, averageHelpfulness: 0 };
    }

    const accurateCount = allFeedback.filter((f) => f.isAccurate).length;
    return {
      totalFeedback: allFeedback.length,
      accuracyRate: (accurateCount / allFeedback.length) * 100,
      averageHelpfulness:
        allFeedback.reduce((sum, f) => sum + f.helpfulness, 0) / allFeedback.length,
    };
  }

  static async clearAllFeedback(): Promise<void> {
    await AsyncStorage.multiRemove([FEEDBACK_KEY, SUGGESTION_KEY]);
  }
}

export type DreamFeedback = InterpretationFeedback;
