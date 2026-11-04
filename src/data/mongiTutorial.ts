import type { Ionicons } from '@expo/vector-icons';
import type { CompanionMood } from '../utils/companionMood';

interface TutorialStep {
  id: string; mood: CompanionMood; title: string; speech: string;
  icon: keyof typeof Ionicons.glyphMap; label: string; detail: string;
}

export const MONGI_TUTORIAL: readonly TutorialStep[] = [
  { id: 'hello', mood: 'happy', title: '안녕! 나는 몽이야.',
    speech: '잠에서 깬 뒤 남은 작은 장면, 나와 함께 모아볼래? 드림로그에서 할 수 있는 일들을 알려줄게.',
    icon: 'moon-outline', label: '꿈을 모으는 나만의 공간', detail: '정답을 찾기보다 꿈을 기록하고 나를 돌아보는 앱이에요.' },
  { id: 'record', mood: 'thinking', title: '기억나는 만큼만 적어줘.',
    speech: '해석 탭에서 꿈을 적고 그때의 감정을 골라봐. 한 장면만 남겨도 괜찮아. 감정을 고르면 내 표정도 달라져!',
    icon: 'create-outline', label: '꿈 입력 → 감정 선택 → 해석', detail: '지원 기기에서는 온디바이스 AI를 사용해요. iOS 26 이상·Apple Intelligence 지원 및 활성화가 필요하며, 사용할 수 없으면 기본 해석을 제공해요.' },
  { id: 'album', mood: 'celebrate', title: '우리의 꿈 앨범을 채워보자.',
    speech: '기록 탭에서 지난 꿈과 해석을 다시 만날 수 있어. 꿈이 쌓일수록 홈의 별자리에도 작은 이야기가 모여.',
    icon: 'journal-outline', label: '기록에서 다시 보기', detail: '소중한 기록은 설정의 백업 기능으로 직접 내보낼 수 있어요.' },
  { id: 'discover', mood: 'surprised', title: '꿈속 상징이 궁금하다면?',
    speech: '사전 탭에서 물, 숲, 동물 같은 상징을 찾아봐. 통계 탭에서는 쌓인 꿈의 감정과 흐름을 돌아볼 수 있어.',
    icon: 'book-outline', label: '사전과 통계로 넓혀가는 꿈의 여정', detail: '상징 해석은 참고용이에요. 미래를 예언하거나 의학적·심리적 진단을 하지 않아요.' },
  { id: 'privacy', mood: 'comfort', title: '네 이야기는 네 기기 안에.',
    speech: '꿈 기록과 AI 처리는 기기 안에서 이루어져. 공유나 백업은 네가 직접 선택할 때만 내보내. 편한 만큼만 이야기해줘!',
    icon: 'shield-checkmark-outline', label: '언제든 다시 만나는 안내서', detail: '설정 → 몽이 사용 안내에서 이 설명을 다시 볼 수 있어요. 준비되면 첫 꿈을 남겨볼까요?' },
];
