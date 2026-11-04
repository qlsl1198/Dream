// Visual associations, not predictions or psychological diagnoses. All local.
export const DREAM_SCENES = [
  { id: 'sea', title: '달빛 바다', hint: '잔잔한 물결에 꿈 한 조각을 띄워요.', words: ['바다', '물결', '파도', '수영', '호수', '강물'] },
  { id: 'forest', title: '속삭이는 숲', hint: '나뭇잎 사이로 장면을 천천히 따라가요.', words: ['숲', '나무', '산', '꽃', '정원', '풀밭'] },
  { id: 'sky', title: '구름 위 산책', hint: '가벼운 마음으로 꿈속 하늘을 돌아봐요.', words: ['하늘', '날아', '날개', '비행', '구름', '우주', '별'] },
  { id: 'city', title: '별빛 골목', hint: '익숙한 풍경 속 새로운 이야기를 찾아요.', words: ['학교', '집', '도시', '골목', '건물', '기차', '버스'] },
  { id: 'night', title: '고요한 달의 정원', hint: '정답 없이, 나만의 시선으로 돌아보는 밤.', words: [] as string[] },
] as const;

export function getDreamScene(content: string, symbols: readonly string[] = []) {
  const text = `${content} ${symbols.join(' ')}`;
  let selected: (typeof DREAM_SCENES)[number] = DREAM_SCENES[4];
  let best = 0;
  for (const scene of DREAM_SCENES) {
    const score = scene.words.reduce((sum, word) => sum + Number(text.includes(word)), 0);
    if (score > best) { selected = scene; best = score; }
  }
  return selected;
}

export function getConstellationProgress(count: number) {
  const total = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  return { total, chapter: Math.floor(total / 6) + 1, stars: total % 6, completed: Math.floor(total / 6) };
}
