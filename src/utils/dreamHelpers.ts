import { EMOTIONS, DREAM_TYPES, EmotionKey, DreamTypeKey } from '../constants/AppConfig';

export function getEmotionLabel(emotion: string): string {
  return EMOTIONS.find((e) => e.key === emotion)?.label || emotion || '평온';
}

export function getEmotionEmoji(emotion: string): string {
  return EMOTIONS.find((e) => e.key === emotion)?.emoji || '😌';
}

export function getEmotionColor(emotion: string): string {
  return EMOTIONS.find((e) => e.key === emotion)?.color || '#9ca3af';
}

export function getDreamTypeLabel(type?: string): string {
  return DREAM_TYPES.find((t) => t.key === type)?.label || '일반 꿈';
}

export function isValidEmotion(value: string): value is EmotionKey {
  return EMOTIONS.some((e) => e.key === value);
}

export function isValidDreamType(value: string): value is DreamTypeKey {
  return DREAM_TYPES.some((t) => t.key === value);
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return '오늘';
  if (date.toDateString() === yesterday.toDateString()) return '어제';

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatFullDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
}

export function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;

  const uniqueDays = [...new Set(dates.map((d) => d.split('T')[0]))].sort().reverse();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let cursor = new Date(today);

  for (const day of uniqueDays) {
    const dayDate = new Date(day);
    dayDate.setHours(0, 0, 0, 0);
    const diffDays = Math.round((cursor.getTime() - dayDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0 || (streak === 0 && diffDays === 1)) {
      streak += 1;
      cursor = new Date(dayDate);
      cursor.setDate(cursor.getDate() - 1);
    } else if (diffDays > 1) {
      break;
    }
  }

  return streak;
}

export function extractKeywords(content: string, limit = 8): string[] {
  const stopWords = new Set([
    '그리고', '그런데', '하지만', '그래서', '있는', '없는', '하는', '했다', '같다',
    '있었다', '나는', '나를', '나의', '정말', '갑자기', '그때', '어떤', '했다가',
    '되고', '되면', '했다', '했다.', '같다.', '같은', '매우', '너무', '조금',
  ]);

  const words = content
    .replace(/[^\uAC00-\uD7A3a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 2 && !stopWords.has(w));

  const counts: Record<string, number> = {};
  words.forEach((w) => {
    counts[w] = (counts[w] || 0) + 1;
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}
