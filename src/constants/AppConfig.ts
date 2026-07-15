export const APP_CONFIG = {
  name: '드림로그',
  nameEn: 'DreamLog',
  tagline: 'AI 꿈 일기 · 해몽 · 상징 사전',
  version: '1.1.0',
  buildNumber: '2',
  supportEmail: 'qlsl1198@gmail.com',
  privacyUrl: 'https://qlsl1198.github.io/Dream/privacy',
  termsUrl: 'https://qlsl1198.github.io/Dream/terms',
  storeUrl: {
    ios: 'https://apps.apple.com/app/id0000000000',
    android: 'https://play.google.com/store/apps/details?id=com.qlsl1198.DreamInterpreterApp',
  },
  maxDreamLength: 5000,
  minDreamLength: 5,
  freeDailyInterpretations: 10,
} as const;

export const EMOTIONS = [
  { key: 'joy', label: '기쁨', emoji: '😊', color: '#10b981' },
  { key: 'sadness', label: '슬픔', emoji: '😢', color: '#3b82f6' },
  { key: 'fear', label: '두려움', emoji: '😨', color: '#ef4444' },
  { key: 'anger', label: '분노', emoji: '😠', color: '#f59e0b' },
  { key: 'surprise', label: '놀람', emoji: '😲', color: '#8b5cf6' },
  { key: 'neutral', label: '평온', emoji: '😌', color: '#9ca3af' },
] as const;

export const DREAM_TYPES = [
  { key: 'normal', label: '일반 꿈', icon: 'moon-outline' },
  { key: 'lucid', label: '자각몽', icon: 'eye-outline' },
  { key: 'nightmare', label: '악몽', icon: 'alert-circle-outline' },
  { key: 'recurring', label: '반복꿈', icon: 'refresh-outline' },
] as const;

export type EmotionKey = (typeof EMOTIONS)[number]['key'];
export type DreamTypeKey = (typeof DREAM_TYPES)[number]['key'];
