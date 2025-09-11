import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// 알림 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface NotificationSettings {
  enabled: boolean;
  hour: number;
  minute: number;
}

const NOTIFICATION_SETTINGS_KEY = 'notification_settings';

// 다양한 알림 메시지들
const NOTIFICATION_MESSAGES = [
  "🌙 오늘 밤 꿈을 기록해보세요! 잊어버리기 전에 적어두는 것이 좋아요.",
  "✨ 꿈의 세계로 떠나기 전에, 어제 꿈을 정리해보는 건 어떨까요?",
  "🌙 꿈은 우리의 무의식을 보여주는 거울이에요. 오늘의 꿈을 기록해보세요!",
  "✨ 잠들기 전에 어제 꿈을 되돌아보며 하루를 마무리해보세요.",
  "🌙 꿈 속에서 만난 특별한 순간들을 기록으로 남겨보세요.",
  "✨ 꿈은 우리에게 중요한 메시지를 전달해요. 오늘의 꿈을 해석해보세요!",
  "🌙 꿈의 여행을 떠나기 전에, 어제의 꿈 여행을 정리해보세요.",
  "✨ 꿈 속에서 발견한 새로운 자신을 기록으로 남겨보세요.",
  "🌙 꿈은 우리의 마음속 이야기예요. 오늘의 이야기를 적어보세요!",
  "✨ 잠들기 전에 꿈의 세계로 떠나는 준비를 해보세요.",
];

// 꿈 해석 리마인더 메시지들
const INTERPRETATION_REMINDER_MESSAGES = [
  "🔍 어제 기록한 꿈을 해석해보는 건 어떨까요?",
  "✨ 꿈의 의미를 찾아보세요! AI가 도와드릴게요.",
  "🌙 기록한 꿈을 분석해보면 새로운 인사이트를 얻을 수 있어요.",
  "🔮 꿈의 숨겨진 메시지를 발견해보세요!",
  "💭 꿈 해석으로 자신을 더 깊이 이해해보세요.",
];

// 꿈 일기 작성 리마인더 메시지들
const DIARY_REMINDER_MESSAGES = [
  "📝 오늘의 꿈에 대해 더 자세히 기록해보세요!",
  "✨ 꿈의 감정과 기분을 함께 적어보는 건 어떨까요?",
  "🌙 꿈의 생생함 정도도 기록해보세요!",
  "💭 꿈 후 기분 변화도 함께 적어보세요.",
  "📖 꿈 일기를 통해 자신의 패턴을 발견해보세요.",
];

export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        return false;
      }
      
      return true;
    } else {
      console.log('실제 기기에서만 알림을 사용할 수 있습니다.');
      return false;
    }
  }

  static async scheduleDreamReminder(hour: number, minute: number): Promise<void> {
    try {
      // 기존 알림 취소
      await this.cancelAllNotifications();
      
      // 새로운 알림 스케줄링
      const randomMessage = NOTIFICATION_MESSAGES[Math.floor(Math.random() * NOTIFICATION_MESSAGES.length)];
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌙 꿈 기록 시간이에요!',
          body: randomMessage,
          sound: true,
        },
        trigger: {
          hour,
          minute,
          repeats: true,
        },
      });
      
      console.log(`꿈 기록 알림이 ${hour}:${minute.toString().padStart(2, '0')}에 설정되었습니다.`);
    } catch (error) {
      console.error('알림 스케줄링 오류:', error);
      throw new Error('알림을 설정하는 중 오류가 발생했습니다.');
    }
  }

  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('알림 취소 오류:', error);
    }
  }

  static async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const settingsJson = await Notifications.getPermissionsAsync();
      // 기본 설정 반환
      return {
        enabled: false,
        hour: 22,
        minute: 0,
      };
    } catch (error) {
      console.error('알림 설정 불러오기 오류:', error);
      return {
        enabled: false,
        hour: 22,
        minute: 0,
      };
    }
  }

  static async saveNotificationSettings(settings: NotificationSettings): Promise<void> {
    try {
      if (settings.enabled) {
        await this.scheduleDreamReminder(settings.hour, settings.minute);
      } else {
        await this.cancelAllNotifications();
      }
    } catch (error) {
      console.error('알림 설정 저장 오류:', error);
      throw new Error('알림 설정을 저장하는 중 오류가 발생했습니다.');
    }
  }

  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('스케줄된 알림 조회 오류:', error);
      return [];
    }
  }

  // 꿈 해석 리마인더 스케줄링
  static async scheduleInterpretationReminder(hour: number, minute: number): Promise<void> {
    try {
      const randomMessage = INTERPRETATION_REMINDER_MESSAGES[Math.floor(Math.random() * INTERPRETATION_REMINDER_MESSAGES.length)];
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔍 꿈 해석 시간이에요!',
          body: randomMessage,
          sound: true,
        },
        trigger: {
          hour,
          minute,
          repeats: true,
        },
      });
      
      console.log(`꿈 해석 리마인더가 ${hour}:${minute.toString().padStart(2, '0')}에 설정되었습니다.`);
    } catch (error) {
      console.error('꿈 해석 리마인더 스케줄링 오류:', error);
      throw new Error('꿈 해석 리마인더를 설정하는 중 오류가 발생했습니다.');
    }
  }

  // 꿈 일기 작성 리마인더 스케줄링
  static async scheduleDiaryReminder(hour: number, minute: number): Promise<void> {
    try {
      const randomMessage = DIARY_REMINDER_MESSAGES[Math.floor(Math.random() * DIARY_REMINDER_MESSAGES.length)];
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📝 꿈 일기 작성 시간이에요!',
          body: randomMessage,
          sound: true,
        },
        trigger: {
          hour,
          minute,
          repeats: true,
        },
      });
      
      console.log(`꿈 일기 리마인더가 ${hour}:${minute.toString().padStart(2, '0')}에 설정되었습니다.`);
    } catch (error) {
      console.error('꿈 일기 리마인더 스케줄링 오류:', error);
      throw new Error('꿈 일기 리마인더를 설정하는 중 오류가 발생했습니다.');
    }
  }

  // 주간 꿈 분석 리마인더
  static async scheduleWeeklyAnalysisReminder(): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📊 주간 꿈 분석 시간이에요!',
          body: '이번 주 꿈 기록을 분석해보고 통계를 확인해보세요!',
          sound: true,
        },
        trigger: {
          weekday: 1, // 월요일
          hour: 9,
          minute: 0,
          repeats: true,
        },
      });
      
      console.log('주간 꿈 분석 리마인더가 설정되었습니다.');
    } catch (error) {
      console.error('주간 분석 리마인더 스케줄링 오류:', error);
      throw new Error('주간 분석 리마인더를 설정하는 중 오류가 발생했습니다.');
    }
  }

  // 개인화된 꿈 기록 팁 알림
  static async schedulePersonalizedTips(): Promise<void> {
    try {
      const tips = [
        "💡 꿈을 더 생생하게 기억하려면 잠들기 전에 꿈을 꾸겠다고 의도해보세요!",
        "💡 꿈 일기를 정기적으로 작성하면 꿈의 패턴을 발견할 수 있어요!",
        "💡 꿈 해석을 통해 자신의 감정 상태를 더 잘 이해할 수 있어요!",
        "💡 꿈의 감정을 기록하면 수면 품질과의 연관성을 알 수 있어요!",
        "💡 꿈 태그를 사용하면 비슷한 꿈들을 쉽게 찾을 수 있어요!",
      ];

      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💡 꿈 기록 팁',
          body: randomTip,
          sound: true,
        },
        trigger: {
          hour: 14,
          minute: 0,
          repeats: true,
        },
      });
      
      console.log('개인화된 꿈 기록 팁이 설정되었습니다.');
    } catch (error) {
      console.error('개인화된 팁 스케줄링 오류:', error);
      throw new Error('개인화된 팁을 설정하는 중 오류가 발생했습니다.');
    }
  }
}
