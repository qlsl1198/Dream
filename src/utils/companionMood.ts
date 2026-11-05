// Reactions to explicit UI selections only; never infer a person's mental state.
export type CompanionMood = 'idle' | 'calm' | 'happy' | 'thinking' | 'comfort' | 'surprised' | 'celebrate'
  | 'shy' | 'curious' | 'sleepy' | 'sad' | 'worried' | 'determined';
export const COMPANION_FRAMES: Record<Exclude<CompanionMood, 'idle'>, number> = {
  calm: 0, happy: 1, thinking: 2, comfort: 3, surprised: 4, celebrate: 5,
  shy: 6, curious: 7, sleepy: 8, sad: 9, worried: 10, determined: 11,
};
export const TOUCH_MOODS: readonly CompanionMood[] = ['happy', 'shy', 'surprised', 'curious', 'sleepy', 'calm'];
const REACTIONS: Record<CompanionMood, { label: string; message: string }> = {
  idle: { label: '반가운 몽이', message: '어렴풋한 장면 하나도 좋아요.' },
  calm: { label: '편안한 몽이', message: '잠깐 숨을 고르고, 나의 속도로 남겨요.' },
  happy: { label: '신나는 몽이', message: '기분 좋은 꿈,\n함께 간직해요!' },
  thinking: { label: '생각 중인 몽이', message: '꿈의 조각을 천천히 살펴보고 있어요…' },
  comfort: { label: '다독이는 몽이', message: '편한 만큼만 이야기해요. 몽이가 곁에 있어요.' },
  surprised: { label: '귀 쫑긋 몽이', message: '와, 어떤 장면이었나요? 귀 기울여 들을게요.' },
  celebrate: { label: '축하하는 몽이', message: '꿈 한 조각이 별이 되었어요. 반짝, 고마워요!' },
  shy: { label: '수줍은 몽이', message: '앗, 나를 불렀나요? 반가워요!' },
  curious: { label: '궁금한 몽이', message: '그다음엔 어떤 장면이 이어졌나요?' },
  sleepy: { label: '졸린 몽이', message: '졸린 눈을 비비는 중… 이야기는 잘 듣고 있어요.' },
  sad: { label: '토닥이는 몽이', message: '속상한 꿈도 괜찮아요. 편한 만큼만 남겨요.' },
  worried: { label: '곁을 지키는 몽이', message: '놀란 마음은 잠깐 쉬어가요. 몽이가 여기 있어요.' },
  determined: { label: '힘내는 몽이', message: '마음이 복잡했다면, 천천히 풀어봐요.' },
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
  else if (emotion === 'sadness') mood = 'sad';
  else if (emotion === 'fear') mood = 'worried';
  else if (emotion === 'anger') mood = 'determined';
  else if (emotion === 'neutral') mood = 'calm';
  return { mood, ...REACTIONS[mood] };
}
export function canAnimateCompanion(reducedMotion: boolean, focused: boolean, foreground: boolean) {
  return !reducedMotion && focused && foreground;
}
export function getCompanionFrame(mood: CompanionMood) {
  if (mood === 'idle') return null;
  return COMPANION_FRAMES[mood] ?? null;
}
export function getCompanionSpriteLocation(mood: CompanionMood) {
  const frame = getCompanionFrame(mood);
  return frame === null ? null : { sheet: Math.floor(frame / 6), column: frame % 3, row: Math.floor((frame % 6) / 3) };
}
