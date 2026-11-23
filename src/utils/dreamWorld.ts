// Visual associations, not predictions or psychological diagnoses. All local.
export const DREAM_SCENES = [
  { id: 'library', title: '페이지 사이의 별빛', hint: '아직 펼치지 않은 이야기를 천천히 읽어요.', words: ['도서관', '서점', '책', '독서', '책장', 'library', 'book', 'books'] },
  { id: 'train', title: '새벽으로 가는 기차', hint: '어디로 향하고 있었는지 떠올려요.', words: ['기차', '철도', '역에서', '역으로', '플랫폼', '여행', '공항', '비행기', '지하철', '열차', 'train', 'station', 'airport', 'travel'] },
  { id: 'desert', title: '모래 위의 발자국', hint: '넓은 풍경에 남은 발자국을 따라가요.', words: ['사막', '모래언덕', '모래바람', '낙타', '오아시스', 'desert', 'dunes', 'oasis'] },
  { id: 'snow', title: '눈이 머무는 계곡', hint: '차가운 공기와 고요했던 순간을 간직해요.', words: ['눈밭', '눈사람', '눈송이', '함박눈', '하얀 눈', '눈이 내', '눈이 쌓', '겨울', '빙하', '스키', '얼음', 'snow', 'winter', 'ice'] },
  { id: 'ruins', title: '시간 너머의 문', hint: '오래된 문 뒤에 남은 장면을 돌아봐요.', words: ['성곽', '궁전', '폐허', '유적', '동굴', '성문', '신전', 'castle', 'ruins', 'cave', 'palace'] },
  { id: 'festival', title: '등불이 흐르는 밤', hint: '빛과 소리가 가득했던 순간을 기억해요.', words: ['축제', '놀이공원', '회전목마', '불꽃놀이', '공연', '무대', '음악', '피아노', '노래', 'festival', 'carnival', 'music', 'concert'] },
  { id: 'sea', title: '달빛 물결', hint: '물결 사이에 남은 장면을 떠올려요.', words: ['바다', '물결', '파도', '수영', '호수', '강물', '강가', '해변', '물', 'ocean', 'sea', 'swim', 'lake', 'river'] },
  { id: 'forest', title: '속삭이는 숲', hint: '나뭇잎 사이로 장면을 천천히 따라가요.', words: ['숲', '나무', '산', '등산', '산길', '꽃', '정원', '풀밭', '동산', 'forest', 'tree', 'mountain', 'garden'] },
  { id: 'sky', title: '구름 위 산책', hint: '꿈속 하늘에 남은 이야기를 돌아봐요.', words: ['하늘', '날아', '나는 꿈', '날개', '비행', '구름', '우주', '별', '날았', '날고', '날다', '추락', '떨어', 'sky', 'flying', 'cloud', 'space', 'falling'] },
  { id: 'city', title: '별빛 골목', hint: '익숙한 풍경 속 새로운 이야기를 찾아요.', words: ['학교', '도시', '골목', '건물', '버스', '자동차', '운전', '시험', '교실', '회사', '병원', '식당', '가게', '거리', '길을 잃', '미로', 'city', 'school', 'car', 'exam'] },
  { id: 'cozy', title: '불빛이 머무는 방', hint: '가까운 얼굴과 작은 순간을 간직해요.', words: ['집', '가족', '엄마', '아빠', '부모', '친구', '아기', '강아지', '고양이', '결혼', '식탁', '침대', '거실', 'home', 'family', 'friend', 'cat', 'dog'] },
  { id: 'storm', title: '구름 너머의 빛', hint: '선명했던 장면을 나의 속도로 돌아봐요.', words: ['폭풍', '천둥', '번개', '태풍', '쫓기', '쫓아', '도망', '악몽', '괴물', '화재', '불', '죽음', '장례', '피', 'storm', 'chased', 'nightmare', 'fire'] },
  { id: 'night', title: '고요한 달의 정원', hint: '정답 없이, 나만의 시선으로 돌아보는 밤.', words: [] as string[] },
] as const;

type Scene = (typeof DREAM_SCENES)[number];
const ambientIds = ['night', 'sea', 'forest', 'sky', 'library', 'snow', 'desert'] as const;
const alternateTitles: Record<Scene['id'], readonly [string, string]> = {
  sea: ["푸른 수평선의 기억","은빛 파도가 닿는 곳"],
  forest: ["이슬 맺힌 숲길","나뭇잎 사이의 꿈"],
  sky: ["별 사이를 건너서","바람을 따라 흐르는 밤"],
  city: ["낯선 거리의 불빛","잠들지 않은 창문"],
  cozy: ["따뜻한 창가의 기억","다시 돌아온 작은 방"],
  storm: ["바람이 지나간 자리","새벽을 기다리는 길"],
  night: ["달 아래 남겨둔 이야기","잠든 정원의 속삭임"],
  library: ["잊힌 책갈피","이야기가 잠든 서가"],
  train: ["낯선 역의 불빛","창밖으로 흐르는 꿈"],
  desert: ["사막에 뜬 달","지평선 너머의 오아시스"],
  snow: ["겨울빛의 기억","하얀 숲의 고요"],
  ruins: ["달빛에 열린 성문","오래된 돌의 기억"],
  festival: ["멀리서 들려온 노래","빛이 춤추는 거리"],
};
const shortNoun = /^(집|산|별|물|불|숲|피|책)$/;
const broadCharacter = /^(친구|가족|엄마|아빠|부모|고양이|강아지|friend|family|cat|dog)$/;

export function getDreamScene(content: string, symbols: readonly string[] = []) {
  const find = (input: string) => {
    const text = input.normalize('NFC').toLowerCase();
    let selected: (typeof DREAM_SCENES)[number] | undefined;
    let best = 0;
    for (const scene of DREAM_SCENES) {
      const score = scene.words.reduce((sum, word) => {
        const matches = shortNoun.test(word)
          ? new RegExp(`(^|[^가-힣a-z])${word}(?=$|[^가-힣a-z]|에서|으로|처럼|에게|까지|부터|에는|에|을|를|은|는|이|가|와|과|도|만|속|위|아래)`).test(text)
          : /^[a-z]+$/.test(word) ? new RegExp(`(^|[^a-z])${word}(?=$|[^a-z])`).test(text) : text.includes(word);
        return sum + (matches ? broadCharacter.test(word) ? 1 : Math.min(4, word.length + 1) : 0);
      }, 0);
      if (score > best) { selected = scene; best = score; }
    }
    return selected;
  };
  const key = content.normalize('NFC').trim().toLowerCase();
  let hash = 2166136261;
  for (const char of key) hash = Math.imul(hash ^ char.codePointAt(0)!, 16777619) >>> 0;
  const explicit = find(key) ?? find(symbols.join(' '));
  const fallbackId = key ? ambientIds[hash % ambientIds.length] : 'night';
  const scene = explicit ?? DREAM_SCENES.find(candidate => candidate.id === fallbackId)!;
  const titleIndex = key ? hash % 3 : 0;
  return {
    ...scene,
    title: titleIndex === 0 ? scene.title : alternateTitles[scene.id][titleIndex - 1],
    hint: explicit ? scene.hint : '단서가 적어도 꿈은 한 장의 이야기가 돼요.',
    association: explicit ? 'keyword' as const : 'ambient' as const,
  };
}

export function getConstellationProgress(count: number) {
  const total = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  return { total, chapter: Math.floor(total / 6) + 1, stars: total % 6, completed: Math.floor(total / 6) };
}
