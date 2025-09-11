import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DreamFeedback {
  dreamId: string;
  isAccurate: boolean; // 해석이 정확한지
  helpfulness: number; // 도움 정도 (1-5)
  suggestions?: string; // 개선 제안
  timestamp: string;
}

const FEEDBACK_KEY = 'dream_feedback';

export class FeedbackService {
  static async saveFeedback(feedback: DreamFeedback): Promise<void> {
    try {
      const existingFeedback = await this.getFeedback();
      const updatedFeedback = [...existingFeedback, feedback];
      await AsyncStorage.setItem(FEEDBACK_KEY, JSON.stringify(updatedFeedback));
    } catch (error) {
      console.error('피드백 저장 오류:', error);
      throw new Error('피드백을 저장하는 중 오류가 발생했습니다.');
    }
  }

  static async getFeedback(): Promise<DreamFeedback[]> {
    try {
      const feedbackJson = await AsyncStorage.getItem(FEEDBACK_KEY);
      return feedbackJson ? JSON.parse(feedbackJson) : [];
    } catch (error) {
      console.error('피드백 불러오기 오류:', error);
      return [];
    }
  }

  static async getFeedbackForDream(dreamId: string): Promise<DreamFeedback | null> {
    try {
      const allFeedback = await this.getFeedback();
      return allFeedback.find(feedback => feedback.dreamId === dreamId) || null;
    } catch (error) {
      console.error('꿈별 피드백 조회 오류:', error);
      return null;
    }
  }

  static async getFeedbackStats(): Promise<{
    totalFeedback: number;
    accuracyRate: number;
    averageHelpfulness: number;
  }> {
    try {
      const allFeedback = await this.getFeedback();
      if (allFeedback.length === 0) {
        return { totalFeedback: 0, accuracyRate: 0, averageHelpfulness: 0 };
      }

      const accurateCount = allFeedback.filter(f => f.isAccurate).length;
      const accuracyRate = (accurateCount / allFeedback.length) * 100;
      const averageHelpfulness = allFeedback.reduce((sum, f) => sum + f.helpfulness, 0) / allFeedback.length;

      return {
        totalFeedback: allFeedback.length,
        accuracyRate,
        averageHelpfulness,
      };
    } catch (error) {
      console.error('피드백 통계 계산 오류:', error);
      return { totalFeedback: 0, accuracyRate: 0, averageHelpfulness: 0 };
    }
  }

  static async clearAllFeedback(): Promise<void> {
    try {
      await AsyncStorage.removeItem(FEEDBACK_KEY);
    } catch (error) {
      console.error('피드백 삭제 오류:', error);
      throw new Error('피드백을 삭제하는 중 오류가 발생했습니다.');
    }
  }
}
