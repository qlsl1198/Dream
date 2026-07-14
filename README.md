# 🌙 Dream Interpreter App

AI 기반 꿈 해석 및 기억 복원 모바일 애플리케이션

## 📱 주요 기능

### 🔮 꿈 해석
- **로컬 AI 해석**: Ollama / LM Studio 등 로컬 LLM을 활용한 꿈 해석
- **오프라인 폴백**: 로컬 AI에 연결할 수 없을 때 기본 해석 엔진으로 동작
- **다양한 꿈 테마**: 20가지 이상의 꿈 테마별 맞춤 해석
- **해석 기록 저장**: 모든 꿈 해석 결과를 로컬에 안전하게 저장

### 🧠 기억 복원
- **로컬 AI 질문**: 망각된 기억을 되살리는 맞춤형 질문 생성
- **단계별 복원**: 체계적인 질문을 통한 점진적 기억 복원
- **감정 분석**: 기억과 관련된 감정 상태 분석

### 📊 통계 분석
- **꿈 패턴 분석**: 자주 나타나는 꿈 테마와 패턴 분석
- **감정 추이**: 꿈을 통한 감정 변화 추적
- **월별/연도별 통계**: 시간대별 꿈 해석 통계

### ⚙️ 설정 및 관리
- **다크/라이트 모드**: 사용자 상황에 따른 테마 전환
- **알림 설정**: 꿈 기록 알림 및 리마인더 설정
- **데이터 백업**: 꿈 기록 내보내기/가져오기 기능
- **피드백 시스템**: 개발자에게 개선사항 제안

### 💰 후원 기능
- **토스/카카오페이**: QR 코드를 통한 간편 후원
- **개발자 지원**: 앱 개발 및 유지보수 지원

## 🛠 기술 스택

- **Frontend**: React Native, TypeScript
- **AI Integration**: 로컬 LLM (Ollama / LM Studio, OpenAI 호환 API)
- **State Management**: React Context API
- **Local Storage**: AsyncStorage
- **Navigation**: React Navigation
- **Notifications**: Expo Notifications
- **Build System**: Expo (EAS Build)
- **Advertising**: Google AdMob

## 🚀 설치 및 실행

### 필수 요구사항
- Node.js 18+
- npm 또는 yarn
- Expo CLI
- 로컬 AI 서버 (Ollama 또는 LM Studio 권장)
- iOS Simulator (iOS 개발용)
- Android Studio (Android 개발용)

### 로컬 AI 준비 (Ollama 예시)

```bash
# Ollama 설치 후 모델 다운로드
ollama pull llama3.2

# 서버가 http://localhost:11434 에서 실행 중인지 확인
ollama serve
```

### 설치 방법

1. **저장소 클론**
```bash
git clone https://github.com/qlsl1198/Dream.git
cd Dream
```

2. **의존성 설치**
```bash
npm install
```

3. **환경 변수 설정**
```bash
# .env 파일 생성
cp env.example .env

# .env 파일에서 로컬 AI 설정 확인/수정
EXPO_PUBLIC_LOCAL_AI_BASE_URL=http://localhost:11434/v1
EXPO_PUBLIC_LOCAL_AI_MODEL=llama3.2
EXPO_PUBLIC_LOCAL_AI_API_KEY=local-ai
EXPO_PUBLIC_ADMOB_UNIT_ID=your_admob_unit_id_here
```

**플랫폼별 base URL 참고**

| 환경 | URL |
|------|-----|
| iOS 시뮬레이터 / 웹 | `http://localhost:11434/v1` |
| Android 에뮬레이터 | `http://10.0.2.2:11434/v1` (기본값으로 자동 적용) |
| 실기기 | PC의 LAN IP, 예: `http://192.168.0.10:11434/v1` |
| LM Studio | `http://localhost:1234/v1` (포트는 앱 설정 확인) |

`EXPO_PUBLIC_LOCAL_AI_BASE_URL`을 비워 두면 iOS/웹은 localhost, Android 에뮬레이터는 `10.0.2.2`로 자동 설정됩니다.

4. **개발 서버 실행**
```bash
# 웹에서 실행
npx expo start --web

# iOS 시뮬레이터에서 실행
npx expo start --ios

# Android 에뮬레이터에서 실행
npx expo start --android
```

## 📱 빌드 및 배포

### Android APK 빌드
```bash
# EAS Build를 사용한 프로덕션 빌드
npx eas build --platform android --profile production
```

### iOS 빌드
```bash
# iOS 시뮬레이터용 빌드
npx expo run:ios

# iOS 디바이스용 빌드
npx eas build --platform ios --profile production
```

## 🔧 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── AdFitBanner.tsx  # 광고 배너 컴포넌트
│   ├── DonationModal.tsx # 후원 모달
│   └── FeedbackModal.tsx # 피드백 모달
├── contexts/            # React Context
│   └── ThemeContext.tsx # 테마 관리
├── screens/             # 화면 컴포넌트
│   ├── HomeScreen.tsx   # 메인 화면 (꿈 해석)
│   ├── MemoryScreen.tsx # 기억 복원 화면
│   ├── HistoryScreen.tsx # 꿈 기록 화면
│   ├── StatsScreen.tsx  # 통계 화면
│   ├── SettingsScreen.tsx # 설정 화면
│   └── SplashScreen.tsx # 스플래시 화면
└── services/            # 비즈니스 로직
    ├── LocalAIService.ts # 로컬 AI (Ollama/LM Studio) 클라이언트
    ├── DreamStorage.ts  # 꿈 데이터 저장
    ├── NetworkService.ts # 네트워크 상태 관리
    ├── NotificationService.ts # 알림 관리
    ├── BackupService.ts # 데이터 백업
    └── FeedbackService.ts # 피드백 관리
```

## 🔐 보안 및 개인정보

- **로컬 저장**: 모든 꿈 기록은 디바이스에 로컬로 저장
- **로컬 AI**: 꿈/기억 텍스트는 클라우드 API가 아닌 로컬 LLM으로 처리
- **개인정보 보호**: 외부 OpenAI 등으로 데이터가 전송되지 않음
- **폴백 해석**: 로컬 AI 서버가 없어도 기본 규칙 엔진으로 동작

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의 및 지원

- **이슈 리포트**: [GitHub Issues](https://github.com/qlsl1198/Dream/issues)
- **피드백**: 앱 내 피드백 기능 사용
- **후원**: 앱 내 후원 기능을 통한 개발 지원

## 🙏 감사의 말

- Ollama / LM Studio 로컬 AI 생태계
- Expo 개발팀
- React Native 커뮤니티
- 모든 사용자들의 피드백과 지원

---

**Dream Interpreter App**으로 더 나은 꿈과 기억을 경험해보세요! 🌙✨
