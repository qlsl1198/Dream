import { Linking, Platform, Share, Alert } from 'react-native';
import { APP_CONFIG } from '../constants/AppConfig';
import { DreamRecord } from './DreamStorage';
import { getEmotionLabel, formatFullDate } from '../utils/dreamHelpers';

export class ShareService {
  static async shareApp(): Promise<void> {
    const url = Platform.OS === 'ios' ? APP_CONFIG.storeUrl.ios : APP_CONFIG.storeUrl.android;
    await Share.share({
      message: `${APP_CONFIG.name} — ${APP_CONFIG.tagline}\n꿈을 기록하고 AI로 해석해보세요.\n${url}`,
      title: APP_CONFIG.name,
    });
  }

  static async rateApp(): Promise<void> {
    const url = Platform.OS === 'ios' ? APP_CONFIG.storeUrl.ios : APP_CONFIG.storeUrl.android;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert('안내', '스토어 링크를 열 수 없습니다. 곧 업데이트될 예정입니다.');
    }
  }

  static async shareDream(dream: DreamRecord): Promise<void> {
    const text = [
      `🌙 ${APP_CONFIG.name} 꿈 기록`,
      `📅 ${formatFullDate(dream.date)}`,
      `감정: ${getEmotionLabel(dream.emotion)}`,
      '',
      `꿈 내용:`,
      dream.content,
      '',
      `해석:`,
      dream.interpretation,
      dream.recommendations?.length
        ? `\n추천:\n${dream.recommendations.map((r) => `• ${r}`).join('\n')}`
        : '',
      '',
      `#${APP_CONFIG.name} #꿈해몽 #꿈일기`,
    ]
      .filter(Boolean)
      .join('\n');

    await Share.share({ message: text, title: '꿈 해석 공유' });
  }

  static async contactSupport(subject = '드림로그 문의'): Promise<void> {
    const url = `mailto:${APP_CONFIG.supportEmail}?subject=${encodeURIComponent(subject)}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert('문의', `이메일로 연락해주세요: ${APP_CONFIG.supportEmail}`);
    }
  }
}
