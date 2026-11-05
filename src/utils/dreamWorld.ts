// Visual associations, not predictions or psychological diagnoses. All local.
export const DREAM_SCENES = [
  { id: 'sea', title: '달빛 물결', hint: '물결 사이에 남은 장면을 떠올려요.', words: ['바다', '물결', '파도', '수영', '호수', '강물', '강가', '해변', '물', 'ocean', 'sea', 'swim', 'lake', 'river'] },
  { id: 'forest', title: '속삭이는 숲', hint: '나뭇잎 사이로 장면을 천천히 따라가요.', words: ['숲', '나무', '산', '등산', '산길', '꽃', '정원', '풀밭', '동산', 'forest', 'tree', 'mountain', 'garden'] },
  { id: 'sky', title: '구름 위 산책', hint: '꿈속 하늘에 남은 이야기를 돌아봐요.', words: ['하늘', '날아', '나는 꿈', '날개', '비행', '구름', '우주', '별', '날았', '날고', '날다', '추락', '떨어', 'sky', 'flying', 'cloud', 'space', 'falling'] },
  { id: 'city', title: '별빛 골목', hint: '익숙한 풍경 속 새로운 이야기를 찾아요.', words: ['학교', '도시', '골목', '건물', '기차', '버스', '자동차', '운전', '시험', '교실', '회사', '지하철', '길을 잃', '미로', 'city', 'school', 'train', 'car', 'exam'] },
  { id: 'cozy', title: '불빛이 머무는 방', hint: '가까운 얼굴과 작은 순간을 간직해요.', words: ['집', '가족', '엄마', '아빠', '부모', '친구', '아기', '강아지', '고양이', '결혼', '식탁', '침대', '거실', 'home', 'family', 'friend', 'cat', 'dog'] },
  { id: 'storm', title: '구름 너머의 빛', hint: '선명했던 장면을 나의 속도로 돌아봐요.', words: ['폭풍', '천둥', '번개', '태풍', '쫓기', '쫓아', '도망', '악몽', '괴물', '화재', '불', '죽음', '장례', '피', 'storm', 'chased', 'nightmare', 'fire'] },
  { id: 'night', title: '고요한 달의 정원', hint: '정답 없이, 나만의 시선으로 돌아보는 밤.', words: [] as string[] },
] as const;

export function getDreamScene(content: string, symbols: readonly string[] = []) {
  // User-written content takes precedence over broad model-matched symbols.
  // Short Korean nouns require a boundary/particle, avoiding 집중/계산/별로/피아노.
  const shortNoun = /^(집|산|별|물|불|숲|피)$/;
  const find = (input: string) => {
    const text = input.normalize('NFC').toLowerCase();
    let selected: (typeof DREAM_SCENES)[number] | undefined;
    let best = 0;
    for (const scene of DREAM_SCENES) {
      const score = scene.words.reduce((sum, word) => {
        const matches = shortNoun.test(word)
          ? new RegExp(`(^|[^가-힣a-z])${word}(?=$|[^가-힣a-z]|에서|으로|처럼|에게|까지|부터|에는|에|을|를|은|는|이|가|와|과|도|만|속|위|아래)`).test(text)
          : /^[a-z]+$/.test(word) ? new RegExp(`\\b${word}\\b`).test(text) : text.includes(word);
        return sum + (matches ? Math.min(4, word.length + 1) : 0);
      }, 0);
      if (score > best) { selected = scene; best = score; }
    }
    return selected;
  };
  return find(content) ?? find(symbols.join(' ')) ?? DREAM_SCENES[DREAM_SCENES.length - 1];
}

export function getConstellationProgress(count: number) {
  const total = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  return { total, chapter: Math.floor(total / 6) + 1, stars: total % 6, completed: Math.floor(total / 6) };
}
