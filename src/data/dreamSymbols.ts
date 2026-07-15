export interface DreamSymbol {
  id: string;
  name: string;
  category: string;
  keywords: string[];
  traditional: string;
  psychological: string;
  tips: string[];
}

export const DREAM_CATEGORIES = [
  '전체',
  '동물',
  '사람',
  '자연',
  '장소',
  '행동',
  '사물',
  '감정',
  '숫자·색',
] as const;

export const DREAM_SYMBOLS: DreamSymbol[] = [
  {
    id: 'snake',
    name: '뱀',
    category: '동물',
    keywords: ['뱀', '구렁이', '독사'],
    traditional: '전통적으로 재물운·변화의 징조로 해석됩니다. 큰 뱀은 큰 기회, 물린다면 주의가 필요할 수 있습니다.',
    psychological: '억압된 두려움, 치유와 변신, 혹은 경계해야 할 대상을 상징합니다. 융 심리학에서는 무의식의 에너지를 나타냅니다.',
    tips: ['뱀의 색과 크기를 기록하세요', '물렸는지·피했는지 여부를 적어보세요', '최근 갈등 상황과 연결해보세요'],
  },
  {
    id: 'water',
    name: '물',
    category: '자연',
    keywords: ['물', '바다', '강', '호수', '비', '홍수', '수영'],
    traditional: '맑은 물은 길몽, 탁한 물·홍수는 감정의 혼란이나 사건으로 해석되는 경우가 많습니다.',
    psychological: '감정과 무의식의 흐름을 나타냅니다. 잔잔한 물은 안정, 거센 물은 정서적 과부하를 암시할 수 있습니다.',
    tips: ['물의 맑기·깊이·흐름을 기록하세요', '물에 빠졌는지 헤엄쳤는지 구분하세요'],
  },
  {
    id: 'falling',
    name: '추락',
    category: '행동',
    keywords: ['떨어지다', '추락', '절벽', '떨어짐'],
    traditional: '불안·실수·지위 하락의 경각심으로 해석되곤 합니다. 깨기 직전 추락은 흔한 생리·심리적 반응입니다.',
    psychological: '통제감 상실, 중요한 결정 앞의 불안, 자신감 저하를 반영할 수 있습니다.',
    tips: ['어디서 떨어졌는지 적어보세요', '깨기 직전이었는지 확인하세요', '현실의 불안 요소를 점검하세요'],
  },
  {
    id: 'flying',
    name: '날기',
    category: '행동',
    keywords: ['날다', '비행', '날개', '공중', '날아'],
    traditional: '해방과 상승운의 상징으로 보며, 자유로운 비행은 좋은 기운으로 여겨집니다.',
    psychological: '자유 욕구, 자아 확장, 현실 제약으로부터의 해방을 의미합니다. 조종 불능이면 통제 불안을 시사합니다.',
    tips: ['자유롭게 날았는지, 힘들었는지 기록하세요', '높이·속도·방향을 메모하세요'],
  },
  {
    id: 'teeth',
    name: '이빨',
    category: '사람',
    keywords: ['이빨', '치아', '이', '빠지다'],
    traditional: '이빨이 빠지는 꿈은 건강·재물·가족 관련 걱정으로 해석되는 경우가 많습니다.',
    psychological: '외모·발화·자신감에 대한 불안, 상실감, 노화에 대한 두려움을 나타낼 수 있습니다.',
    tips: ['어떤 이가 빠졌는지 기록하세요', '피나 통증이 있었는지 적어보세요'],
  },
  {
    id: 'exam',
    name: '시험',
    category: '행동',
    keywords: ['시험', '시험장', '문제', '답안', '학교'],
    traditional: '평가받는 상황이나 새로운 도전에 대한 경계로 해석됩니다.',
    psychological: '완벽주의, 준비 부족감, 타인에게 평가받는 두려움(impoter syndrome)과 연결됩니다.',
    tips: ['시험 과목을 기억나나요?', '답을 몰랐는지, 준비했는지 적어보세요'],
  },
  {
    id: 'chase',
    name: '쫓김',
    category: '행동',
    keywords: ['쫓기다', '도망', '추격', '뒤쫓'],
    traditional: '재난·시비·압박에서 벗어나려는 심리로 해석됩니다.',
    psychological: '회피하고 싶은 책임, 갈등, 감정을 상징합니다. 쫓는 대상이 누구/무엇인지가 핵심입니다.',
    tips: ['누가(무엇이) 쫓았는지 기록하세요', '숨었는지 싸웠는지 적어보세요'],
  },
  {
    id: 'house',
    name: '집',
    category: '장소',
    keywords: ['집', '방', '현관', '지하', '다락'],
    traditional: '자신과 가족· basise을 상징합니다. 깨끗한 집은 안녕, 낡은 집은 정비가 필요할 수 있습니다.',
    psychological: '자아의 구조입니다. 지하실은 무의식, 다락은 과거 기억, 방은 성격의 다양한 면을 나타냅니다.',
    tips: ['어느 공간이 인상적이었나요?', '집이 익숙한지 낯선지 기록하세요'],
  },
  {
    id: 'death',
    name: '죽음',
    category: '감정',
    keywords: ['죽음', '죽다', '장례', '시체', '유령'],
    traditional: '끝과 시작의 경계로 보기도 하며, 반드시 불길하다고만 보지 않습니다.',
    psychological: '전환, 오래된 자아/관계의 마침, 변화를 수용하는 과정의 상징일 수 있습니다.',
    tips: ['누구의 죽음이었는지 기록하세요', '감정(슬픔/평온/공포)을 적어보세요'],
  },
  {
    id: 'baby',
    name: '아기',
    category: '사람',
    keywords: ['아기', '아이', '유아', '갓난'],
    traditional: '새로운 시작, 결실, 기쁜 소식의 상징으로 자주 해석됩니다.',
    psychological: '새로운 프로젝트·자기 돌봄·취약한 내면 아이를 의미할 수 있습니다.',
    tips: ['아기의 상태(울음/미소)를 기록하세요', '내가 돌봤는지 관찰했는지 적어보세요'],
  },
  {
    id: 'car',
    name: '자동차',
    category: '사물',
    keywords: ['차', '자동차', '운전', '버스', '지하철'],
    traditional: '인생의 진행 방향과 관련된 꿈으로 봅니다. 고장·사고는 주의 신호로 해석됩니다.',
    psychological: '삶의 통제력과 방향성을 상징합니다. 운전석에 있는지, 승객인지도 중요합니다.',
    tips: ['직접 운전했는지 기록하세요', '목적지가 있었는지 적어보세요'],
  },
  {
    id: 'fire',
    name: '불',
    category: '자연',
    keywords: ['불', '화재', '불꽃', '타다', '연기'],
    traditional: '정화·열정·격변의 상징입니다. 통제된 불은 길, 번지는 불은 갈등의 징후일 수 있습니다.',
    psychological: '분노, 열정, 변혁 욕구를 나타냅니다. 불에 탐/소화 여부가 해석의 실마리입니다.',
    tips: ['불이 커졌는지 꺼졌는지 기록하세요', '두려웠는지 황홀했는지 메모하세요'],
  },
  {
    id: 'money',
    name: '돈',
    category: '사물',
    keywords: ['돈', '현금', '지갑', '금', '부자'],
    traditional: '재물운·기회·가치 평가와 관련된 꿈으로 해석됩니다.',
    psychological: '자존감, 가치 인정, 자원에 대한 태도를 반영합니다. 돈을 잃은 꿈은 상실 불안과 연결됩니다.',
    tips: ['얼마나/어떤 형태로 나타났는지 기록하세요', '줍거나 잃은 상황을 적어보세요'],
  },
  {
    id: 'dog',
    name: '개',
    category: '동물',
    keywords: ['개', '강아지', '멍멍'],
    traditional: '충성과 보호, 혹은 경계의 상징입니다. 친절한 개는 좋은 인연으로 해석됩니다.',
    psychological: '우정, 본능, 보호 욕구를 나타냅니다. 공격적인 개는 억압된 본능이나 불신을 시사합니다.',
    tips: ['개의 태도(친근/공격)를 기록하세요', '아는 개인지 낯선 개인지 적어보세요'],
  },
  {
    id: 'cat',
    name: '고양이',
    category: '동물',
    keywords: ['고양이', '야옹', '길고양이'],
    traditional: '독립성·직관·여성적 에너지를 상징합니다. 까만 고양이는 문화권에 따라 해석이 갈립니다.',
    psychological: '자율성, 민감함, 때로는 거리 두기 욕구를 반영합니다.',
    tips: ['고양이의 색·행동을 기록하세요', '안겼는지 도망갔는지 적어보세요'],
  },
  {
    id: 'school',
    name: '학교',
    category: '장소',
    keywords: ['학교', '교실', '교무실', '선생님'],
    traditional: '배움과 사회적 평가의 장으로 해석됩니다.',
    psychological: '미해결된 성장 과제, 사회 규칙, 자기 평가 불안을 나타냅니다.',
    tips: ['어느 학년/학교였는지 기록하세요', '시험·친구·선생 중 무엇이 중심이었나요?'],
  },
  {
    id: 'bridge',
    name: '다리',
    category: '장소',
    keywords: ['다리', '교각', '건너다'],
    traditional: '전환과 연결의 상징입니다. 무사히 건너면 목표 달성, 무너지면 갈등으로 봅니다.',
    psychological: '인생의 전환기, 관계의 연결, 과거와 미래 사이의 선택을 의미합니다.',
    tips: ['다리를 건넜는지 도중에 멈췄는지 기록하세요'],
  },
  {
    id: 'mirror',
    name: '거울',
    category: '사물',
    keywords: ['거울', '비치다', '반사'],
    traditional: '진실·자기 인식과 관련된 꿈으로 해석됩니다.',
    psychological: '자기상, 정체성, 타인이 보는 나와의 괴리를 드러냅니다. 깨진 거울은 자기상 붕괴를 시사할 수 있습니다.',
    tips: ['거울 속 모습이 어땠는지 기록하세요', '깨졌는지 깨끗한지 적어보세요'],
  },
  {
    id: 'phone',
    name: '전화',
    category: '사물',
    keywords: ['전화', '핸드폰', '통화', '문자'],
    traditional: '소식·인연·소통의 징조로 해석됩니다.',
    psychological: '연결 욕구, 놓친 메시지, 관계 단절에 대한 불안을 나타냅니다.',
    tips: ['누구와 통화했는지/연결이 됐는지 기록하세요'],
  },
  {
    id: 'stairs',
    name: '계단',
    category: '장소',
    keywords: ['계단', '올라가다', '내려가다'],
    traditional: '상승은 발전, 하강은 성찰·주의로 해석됩니다.',
    psychological: '성장 과정, 계층/지위 인식, 노력의 단계를 상징합니다.',
    tips: ['올라가나요 내려가나요?', '끝이 보였는지 기록하세요'],
  },
  {
    id: 'red',
    name: '빨간색',
    category: '숫자·색',
    keywords: ['빨강', '빨간', '붉은'],
    traditional: '열정·경고·중요 사건의 색으로 해석됩니다.',
    psychological: '강렬한 감정(사랑, 분노, 생명력)을 강조합니다.',
    tips: ['무엇이 빨갰는지 구체적으로 기록하세요'],
  },
  {
    id: 'black',
    name: '검은색',
    category: '숫자·색',
    keywords: ['검정', '검은', '어둠'],
    traditional: '미지·비밀·전환기의 색으로 해석됩니다.',
    psychological: '억압된 면, 슬픔, 잠재력의 그림자 측면을 나타낼 수 있습니다.',
    tips: ['공포였는지 고요함이었는지 구분해 적으세요'],
  },
  {
    id: 'three',
    name: '숫자 3',
    category: '숫자·색',
    keywords: ['셋', '세 개', '3', '삼'],
    traditional: '완성·조화·길한 수의 상징으로 자주 봅니다.',
    psychological: '균형, 선택지, 관계의 삼각형 구조를 암시할 수 있습니다.',
    tips: ['무엇이 세 개였는지 기록하세요'],
  },
  {
    id: 'lost',
    name: '길을 잃음',
    category: '행동',
    keywords: ['길을 잃', '헤매', '미로', '길잃'],
    traditional: '방향 상실·선택의 기로로 해석됩니다.',
    psychological: '정체성·진로·관계에서의 혼란을 반영합니다.',
    tips: ['어디서 헤맸는지, 결국 찾았는지 기록하세요'],
  },
  {
    id: 'wedding',
    name: '결혼',
    category: '사람',
    keywords: ['결혼', '웨딩', '신랑', '신부', '예식'],
    traditional: '결합·새로운 인연·전환의 길몽으로 해석되는 경우가 많습니다.',
    psychological: '통합, 약속, 자아의 이질적 측면이 합쳐지는 과정을 의미할 수 있습니다.',
    tips: ['누가 결혼했는지, 당신의 역할은 무엇이었는지 적으세요'],
  },
  {
    id: 'ocean',
    name: '바다',
    category: '자연',
    keywords: ['바다', '해변', '파도', '해변'],
    traditional: '광활한 운세와 감정의 바다로 해석됩니다. 잔잔하면 길, 폭풍이면 시련입니다.',
    psychological: '거대한 무의식과 감정을 상징합니다. 수영·익사·파도에 따라 해석이 달라집니다.',
    tips: ['파도의 세기와 물의 색을 기록하세요'],
  },
  {
    id: 'mountain',
    name: '산',
    category: '자연',
    keywords: ['산', '등산', '정상', '봉우리'],
    traditional: '목표 달성·난관 극복의 상징입니다.',
    psychological: '야망, 자기 도전, 관점의 확장을 나타냅니다. 정상 도달 여부가 중요합니다.',
    tips: ['올랐는지, 내려왔는지, 날씨는 어땠는지 적으세요'],
  },
  {
    id: 'blood',
    name: '피',
    category: '감정',
    keywords: ['피', '출혈', '피남'],
    traditional: '활력의 손실 또는 강한 생명의 신호로 양면 해석됩니다.',
    psychological: '에너지 소진, 상처, 강렬한 생명력·희생을 상징할 수 있습니다.',
    tips: ['누구의 피인지, 양이 어느 정도인지 기록하세요'],
  },
];

export function searchSymbols(query: string, category = '전체'): DreamSymbol[] {
  const q = query.trim().toLowerCase();
  return DREAM_SYMBOLS.filter((symbol) => {
    const matchCategory = category === '전체' || symbol.category === category;
    if (!matchCategory) return false;
    if (!q) return true;
    return (
      symbol.name.toLowerCase().includes(q) ||
      symbol.keywords.some((k) => k.toLowerCase().includes(q)) ||
      symbol.traditional.includes(query) ||
      symbol.psychological.includes(query)
    );
  });
}

export function matchSymbolsInText(content: string): DreamSymbol[] {
  const lower = content.toLowerCase();
  return DREAM_SYMBOLS.filter((symbol) =>
    symbol.keywords.some((k) => lower.includes(k.toLowerCase()))
  );
}
