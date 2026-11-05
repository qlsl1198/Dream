import type { EmotionKey } from '../constants/AppConfig';

export const EMOTION_ICONS = {
  joy: 'emoticon-happy-outline',
  sadness: 'emoticon-sad-outline',
  fear: 'emoticon-confused-outline',
  anger: 'emoticon-angry-outline',
  surprise: 'emoticon-excited-outline',
  neutral: 'emoticon-neutral-outline',
} as const satisfies Record<EmotionKey, string>;

export function getEmotionIconName(emotion: string) {
  return Object.hasOwn(EMOTION_ICONS, emotion)
    ? EMOTION_ICONS[emotion as EmotionKey] : EMOTION_ICONS.neutral;
}
