// Reactions to explicit UI selections only; never infer a person's mental state.
export type CompanionMood = 'idle' | 'calm' | 'happy' | 'thinking' | 'comfort' | 'surprised' | 'celebrate';
export const COMPANION_FRAMES: Record<Exclude<CompanionMood, 'idle'>, number> = {
  calm: 0, happy: 1, thinking: 2, comfort: 3, surprised: 4, celebrate: 5,
};
const REACTIONS: Record<CompanionMood, { label: string; message: string }> = {
  idle: { label: '반가운 몽이', message: '어렴풋한 장면 하나도 좋아요.' },
  calm: { label: '편안한 몽이', message: '잠깐 숨을 고르고, 나의 속도로 남겨요.' },
  happy: { label: '신나는 몽이', message: '기분 좋은 꿈,\n함께 간직해요!' },
  thinking: { label: '생각 중인 몽이', message: '꿈의 조각을 천천히 살펴보고 있어요…' },
  comfort: { label: '다독이는 몽이', message: '편한 만큼만 이야기해요. 몽이가 곁에 있어요.' },
  surprised: { label: '귀 쫑긋 몽이', message: '와, 어떤 장면이었나요? 귀 기울여 들을게요.' },
  celebrate: { label: '축하하는 몽이', message: '꿈 한 조각이 별이 되었어요. 반짝, 고마워요!' },
};
export function getCompanionReaction({ emotion = '', busy = false, celebrating = false, interaction = null }: {
  emotion?: string; busy?: boolean; celebrating?: boolean; interaction?: CompanionMood | null;
}) {
  let mood: CompanionMood = 'idle';
  if (busy) mood = 'thinking';
  else if (celebrating) mood = 'celebrate';
  else if (interaction) mood = interaction;
  else if (emotion === 'joy') mood = 'happy';
  else if (emotion === 'surprise') mood = 'surprised';
  else if (['sadness', 'fear', 'anger'].includes(emotion)) mood = 'comfort';
  else if (emotion === 'neutral') mood = 'calm';
  return { mood, ...REACTIONS[mood] };
}
export function canAnimateCompanion(reducedMotion: boolean, focused: boolean, foreground: boolean) {
  return !reducedMotion && focused && foreground;
}
export function getCompanionFrame(mood: CompanionMood, blink = false) {
  if (mood === 'idle') return blink ? COMPANION_FRAMES.calm : null;
  return COMPANION_FRAMES[mood];
}
