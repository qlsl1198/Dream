import OpenAI from 'openai';
import { matchSymbolsInText } from '../data/dreamSymbols';
import { APP_CONFIG } from '../constants/AppConfig';

export interface DreamAnalysisResult {
  themes: string[];
  interpretation: string;
  confidence: number;
  recommendations: string[];
  matchedSymbols: string[];
  summary: string;
  source: 'ai' | 'offline';
}

const EMOTION_KO: Record<string, string> = {
  joy: '기쁨',
  sadness: '슬픔',
  fear: '두려움',
  anger: '분노',
  surprise: '놀람',
  neutral: '평온함',
};

/** 오프라인 키워드 기반 해석 엔진 */
export class OfflineDreamInterpreter {
  private dreamThemes: Record<string, string[]> = {
    falling: ['떨어지다', '추락', '높은 곳', '절벽', '계단', '엘리베이터', '떨어'],
    chasing: ['쫓기다', '도망', '추격', '뒤쫓다', '숨다', '도주', '쫓아'],
    flying: ['날다', '비행', '하늘', '공중', '날개', '떠다니다', '날아'],
    water: ['물', '바다', '강', '호수', '비', '홍수', '수영', '파도'],
    teeth: ['이빨', '치아', '빠지다', '부러지다'],
    exam: ['시험', '시험장', '문제', '답안지', '교실', '선생님'],
    death: ['죽음', '죽다', '장례', '유령', '시체'],
    house: ['집', '방', '현관', '지하', '다락'],
    animal: ['개', '고양이', '뱀', '새', '말', '호랑이'],
    fire: ['불', '화재', '불꽃', '타다', '연기'],
  };

  private interpretations: Record<string, string> = {
    falling:
      '추락하는 꿈은 불안감이나 통제력 상실감을 나타낼 수 있습니다. 중요한 결정이나 변화에 대한 두려움과 관련될 때가 많습니다. 잠에서 깨기 직전 추락감은 흔히 나타나는 생리·심리적 현상이기도 합니다.',
    chasing:
      '쫓기는 꿈은 현실에서 피하고 싶은 문제·책임·감정을 상징합니다. 쫓는 대상이 누구(무엇)인지가 해석의 핵심 단서입니다.',
    flying:
      '날아다니는 꿈은 자유와 해방감을 나타냅니다. 현실의 제약에서 벗어나고 싶은 욕망이나 새로운 가능성에 대한 기대를 의미할 수 있습니다.',
    water:
      '물이 나오는 꿈은 감정의 상태를 반영합니다. 맑고 잔잔한 물은 평온을, 거칠거나 탁한 물은 감정의 혼란을 암시할 수 있습니다.',
    teeth:
      '이빨이 빠지거나 부서지는 꿈은 자신감·외모·발화에 대한 걱정과 연결되는 경우가 많습니다. 상실감이나 변화에 대한 두려움도 함께 살펴보세요.',
    exam:
      '시험을 보는 꿈은 평가받는 상황이나 준비 부족에 대한 불안을 나타냅니다. 중요한 도전 앞에서의 긴장감을 의미할 수 있습니다.',
    death:
      '죽음과 관련된 꿈은 반드시 불길한 것만은 아닙니다. 오래된 습관·관계·자아상의 마침과 새로운 전환을 상징할 수 있습니다.',
    house:
      '집은 자아의 상징입니다. 공간의 상태(깨끗함/낡음)와 어느 방인지(지하·다락·방)가 무의식의 구조를 드러냅니다.',
    animal:
      '동물이 등장하는 꿈은 본능·보호·관계의 특성을 반영합니다. 동물의 종류와 태도(친근/공격)를 함께 고려하세요.',
    fire:
      '불은 정화·열정·분노·변혁을 동시에 담을 수 있습니다. 불이 통제되었는지, 번졌는지에 따라 의미가 달라집니다.',
    general:
      '꿈은 무의식이 전하는 메시지입니다. 장면의 감정, 핵심 상징, 현실의 최근 사건을 연결어로 일기에 남겨두면 패턴이 보이기 시작합니다.',
  };

  private recommendations: Record<string, string[]> = {
    falling: [
      '지금 압박을 주는 일이 무엇인지 목록으로 적어보세요',
      '호흡 명상이나 짧은 산책으로 긴장을 낮춰보세요',
      '믿을 수 있는 사람과 현재 고민을 이야기해보세요',
    ],
    chasing: [
      '피하고 있는 문제를 한 가지라도 마주해보세요',
      '큰 과제를 작은 단위로 나누어 실행해보세요',
      '도움이 필요할 때 요청하는 연습을 해보세요',
    ],
    flying: [
      '해보고 싶었던 작은 도전을 하나 실천해보세요',
      '창의적인 활동에 시간을 내보세요',
      '스스로에게 자유로운 시간을 허락해보세요',
    ],
    water: [
      '감정을 일기나 메모로 표현해보세요',
      '수면 전 긴장을 푸는 루틴을 만들어보세요',
      '예술·음악 등 감정 발산 활동을 해보세요',
    ],
    teeth: [
      '자기비판적인 생각을 긍정 문장으로 바꿔보세요',
      '자신감을 키우는 작은 성공 경험을 쌓아보세요',
      '외모·건강 관리에 실천 가능한 루틴을 세워보세요',
    ],
    exam: [
      '중요한 일을 미리 준비하고 점검해보세요',
      '완벽보다 진행에 초점을 맞춰보세요',
      '실패를 배움의 과정으로 재해석해보세요',
    ],
    death: [
      '끝나가고 있는 일·관계가 무엇인지 돌아보세요',
      '새로운 시작을 위한 작은 의식을 가져보세요',
      '감정을 억누르지 말고 충분히 느껴보세요',
    ],
    house: [
      '생활 공간을 정리하며 마음을 정돈해보세요',
      '자기 돌봄 루틴을 점검해보세요',
      '가족·관계의 경계를 생각해보세요',
    ],
    animal: [
      '본능이 알려주는 신호를 무시하지 마세요',
      '관계에서 보호/거리 두기 욕구를 살펴보세요',
      '몸과 감정을 돌보는 활동을 해보세요',
    ],
    fire: [
      '억눌린 열정이나 분노를 건강한 방식으로 표현해보세요',
      '변화를 원한다면 작은 실행 계획을 세워보세요',
      '충분한 휴식과 에너지 관리에 신경 쓰세요',
    ],
    general: [
      '꿈의 장면을 가능한 자세히 기록하세요',
      '현재 현실의 스트레스·목표와 연결해보세요',
      '비슷한 꿈이 반복되는지 태그를 남겨두세요',
    ],
  };

  analyzeDream(content: string, emotion = ''): DreamAnalysisResult {
    const themes = this.identifyThemes(content);
    const primaryTheme = themes[0] || 'general';
    const matched = matchSymbolsInText(content);

    let interpretation = this.interpretations[primaryTheme] || this.interpretations.general;

    if (matched.length > 0) {
      const symbolNotes = matched
        .slice(0, 3)
        .map((s) => `「${s.name}」: ${s.psychological}`)
        .join('\n');
      interpretation += `\n\n감지된 상징:\n${symbolNotes}`;
    }

    if (emotion) {
      interpretation += `\n\n꿈에서 느낀 감정은 '${EMOTION_KO[emotion] || emotion}'입니다. 감정은 상징보다도 중요한 해석 단서이니, 현실의 비슷한 감정 상황과 연결해 보세요.`;
    }

    const confidence = Math.min(0.35 + themes.length * 0.12 + matched.length * 0.08, 0.82);

    return {
      themes: themes.length > 0 ? themes : ['general'],
      interpretation,
      confidence,
      recommendations: this.recommendations[primaryTheme] || this.recommendations.general,
      matchedSymbols: matched.map((s) => s.name),
      summary: matched.length
        ? `${matched[0].name} 등 ${matched.length}개 상징이 포함된 꿈`
        : '일상 심리와 연결된 꿈',
      source: 'offline',
    };
  }

  private identifyThemes(content: string): string[] {
    const themes: string[] = [];
    const lower = content.toLowerCase();

    for (const [theme, keywords] of Object.entries(this.dreamThemes)) {
      const matchCount = keywords.filter((keyword) => lower.includes(keyword.toLowerCase())).length;
      if (matchCount > 0) themes.push(theme);
    }

    return themes;
  }
}

/** AI 기반 꿈 해석 엔진 */
export class AIDreamInterpreter {
  private openai: OpenAI | null = null;
  private offline = new OfflineDreamInterpreter();

  constructor() {
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    if (apiKey && apiKey !== 'your_openai_api_key_here') {
      this.openai = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true,
      });
    }
  }

  hasApiKey(): boolean {
    return Boolean(this.openai);
  }

  async analyzeDream(content: string, emotion = '', offline = false): Promise<DreamAnalysisResult> {
    if (offline || !this.openai) {
      return this.offline.analyzeDream(content, emotion);
    }

    try {
      const prompt = this.createPrompt(content, emotion);
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              '당신은 공감 능력 있는 전문 꿈 해석가입니다. 단정적 예언이 아니라 심리적 통찰과 실천 가능한 조언을 한국어로 제공합니다. 사용자가 불안해하지 않도록 따뜻하고 균형 잡힌 톤을 유지하세요. 의료·법적 조언은 하지 마세요.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1200,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content || '';
      const parsed = this.parseResponse(response, content, emotion);
      return { ...parsed, source: 'ai' };
    } catch (error) {
      console.error('OpenAI API 오류:', error);
      const fallback = this.offline.analyzeDream(content, emotion);
      return {
        ...fallback,
        interpretation:
          'AI 해석에 일시적 문제가 있어 오프라인 해석을 제공합니다.\n\n' + fallback.interpretation,
      };
    }
  }

  private createPrompt(content: string, emotion: string): string {
    const truncated = content.slice(0, APP_CONFIG.maxDreamLength);
    let prompt = `다음 꿈을 분석해주세요.\n\n꿈 내용:\n${truncated}\n\n`;

    if (emotion) {
      prompt += `꿈에서 느낀 감정: ${EMOTION_KO[emotion] || emotion}\n\n`;
    }

    prompt += `반드시 아래 형식으로만 답변해주세요:
1. 주요 테마: (쉼표로 구분, 2~4개)
2. 한 줄 요약: (20자 내외)
3. 심리적 해석: (2~4문단, 구체적이고 공감적으로)
4. 조언: (실천 가능한 조언 3가지, 각 줄에 - 로 시작)
5. 신뢰도: (0-100% 숫자)`;

    return prompt;
  }

  private parseResponse(response: string, content: string, emotion: string): DreamAnalysisResult {
    const offline = this.offline.analyzeDream(content, emotion);
    const lines = response.split('\n').map((l) => l.trim()).filter(Boolean);

    let themes: string[] = [];
    let interpretation = '';
    let recommendations: string[] = [];
    let summary = '';
    let confidence = 0.75;

    let section: 'none' | 'interpretation' | 'advice' = 'none';

    for (const line of lines) {
      if (line.match(/주요\s*테마/) || line.startsWith('1.')) {
        const themeText = line.split(':').slice(1).join(':').trim();
        themes = themeText.split(/[,，、]/).map((t) => t.trim()).filter(Boolean);
        section = 'none';
      } else if (line.match(/한\s*줄\s*요약/) || line.includes('요약:')) {
        summary = line.split(':').slice(1).join(':').trim();
        section = 'none';
      } else if (line.match(/심리적\s*해석/) || line.includes('해석:')) {
        interpretation = line.split(':').slice(1).join(':').trim();
        section = 'interpretation';
      } else if (line.match(/조언/) || line.match(/추천/)) {
        const adviceInline = line.split(':').slice(1).join(':').trim();
        if (adviceInline) {
          recommendations.push(...adviceInline.split(/[,，]/).map((r) => r.replace(/^[-•\d.)\s]+/, '').trim()).filter(Boolean));
        }
        section = 'advice';
      } else if (line.includes('신뢰도')) {
        const match = line.match(/(\d+)\s*%?/);
        if (match) confidence = Math.min(parseInt(match[1], 10) / 100, 0.98);
        section = 'none';
      } else if (section === 'interpretation') {
        interpretation += (interpretation ? '\n' : '') + line;
      } else if (section === 'advice') {
        const cleaned = line.replace(/^[-•*\d.)\s]+/, '').trim();
        if (cleaned) recommendations.push(cleaned);
      }
    }

    if (!interpretation) interpretation = response;
    if (recommendations.length === 0) recommendations = offline.recommendations;
    if (themes.length === 0) themes = offline.themes;

    return {
      themes,
      interpretation: interpretation.trim(),
      confidence,
      recommendations: recommendations.slice(0, 5),
      matchedSymbols: offline.matchedSymbols,
      summary: summary || offline.summary,
      source: 'ai',
    };
  }
}

export const dreamInterpreter = new AIDreamInterpreter();
export const offlineDreamInterpreter = new OfflineDreamInterpreter();
