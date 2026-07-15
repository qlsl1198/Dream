import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationSettings {
  enabled: boolean;
  hour: number;
  minute: number;
  interpretationReminder: boolean;
  diaryReminder: boolean;
  weeklyAnalysis: boolean;
  tips: boolean;
}

const NOTIFICATION_SETTINGS_KEY = 'notification_settings';

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  hour: 22,
  minute: 0,
  interpretationReminder: false,
  diaryReminder: false,
  weeklyAnalysis: false,
  tips: false,
};

const NOTIFICATION_MESSAGES = [
  '오늘 밤 꿈을 기록해보세요! 잊어버리기 전에 적어두는 것이 좋아요.',
  '꿈의 세계로 떠나기 전에, 어제 꿈을 정리해보는 건 어떨까요?',
  '꿈은 우리의 무의식을 보여주는 거울이에요. 오늘의 꿈을 기록해보세요!',
  '잠들기 전에 어제 꿈을 되돌아보며 하루를 마무리해보세요.',
  '꿈 속에서 만난 특별한 순간들을 기록으로 남겨보세요.',
];

const INTERPRETATION_REMINDER_MESSAGES = [
  '어제 기록한 꿈을 해석해보는 건 어떨까요?',
  '꿈의 의미를 찾아보세요! AI가 도와드릴게요.',
  '기록한 꿈을 분석해보면 새로운 인사이트를 얻을 수 있어요.',
];

const DIARY_REMINDER_MESSAGES = [
  '오늘의 꿈에 대해 더 자세히 기록해보세요!',
  '꿈의 감정과 기분을 함께 적어보는 건 어떨까요?',
  '꿈의 생생함 정도도 기록해보세요!',
];

export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice && Platform.OS !== 'web') {
      // 시뮬레이터에서도 설정 저장은 허용
      console.log('시뮬레이터/웹: 알림 권한 제한적 지원');
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('dream-reminders', {
        name: '꿈 기록 알림',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  }

  static async scheduleDreamReminder(hour: number, minute: number): Promise<void> {
    const randomMessage =
      NOTIFICATION_MESSAGES[Math.floor(Math.random() * NOTIFICATION_MESSAGES.length)];

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '드림로그 · 꿈 기록 시간',
        body: randomMessage,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  }

  static async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  static async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const json = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (json) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(json) };
      }
      return { ...DEFAULT_SETTINGS };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  static async saveNotificationSettings(settings: NotificationSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));

      await this.cancelAllNotifications();

      if (!settings.enabled) return;

      await this.scheduleDreamReminder(settings.hour, settings.minute);

      if (settings.interpretationReminder) {
        await this.scheduleInterpretationReminder(20, 0);
      }
      if (settings.diaryReminder) {
        await this.scheduleDiaryReminder(21, 0);
      }
      if (settings.weeklyAnalysis) {
        await this.scheduleWeeklyAnalysisReminder();
      }
      if (settings.tips) {
        await this.schedulePersonalizedTips();
      }
    } catch (error) {
      console.error('알림 설정 저장 오류:', error);
      throw new Error('알림 설정을 저장하는 중 오류가 발생했습니다.');
    }
  }

  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch {
      return [];
    }
  }

  static async scheduleInterpretationReminder(hour: number, minute: number): Promise<void> {
    const randomMessage =
      INTERPRETATION_REMINDER_MESSAGES[
        Math.floor(Math.random() * INTERPRETATION_REMINDER_MESSAGES.length)
      ];

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '드림로그 · 꿈 해석 시간',
        body: randomMessage,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  }

  static async scheduleDiaryReminder(hour: number, minute: number): Promise<void> {
    const randomMessage =
      DIARY_REMINDER_MESSAGES[Math.floor(Math.random() * DIARY_REMINDER_MESSAGES.length)];

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '드림로그 · 꿈 일기 작성',
        body: randomMessage,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  }

  static async scheduleWeeklyAnalysisReminder(): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '드림로그 · 주간 꿈 분석',
        body: '이번 주 꿈 기록을 분석해보고 통계를 확인해보세요!',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: 1,
        hour: 9,
        minute: 0,
      },
    });
  }

  static async schedulePersonalizedTips(): Promise<void> {
    const tips = [
      '꿈을 더 생생하게 기억하려면 잠들기 전에 꿈을 꾸겠다고 의도해보세요!',
      '꿈 일기를 정기적으로 작성하면 꿈의 패턴을 발견할 수 있어요!',
      '꿈 해석을 통해 자신의 감정 상태를 더 잘 이해할 수 있어요!',
      '꿈 태그를 사용하면 비슷한 꿈들을 쉽게 찾을 수 있어요!',
    ];

    const randomTip = tips[Math.floor(Math.random() * tips.length)];

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '드림로그 · 꿈 기록 팁',
        body: randomTip,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 14,
        minute: 0,
      },
    });
  }
}
