# 🌙 Dream Interpreter App

AI 기반 꿈 해석 및 기억 복원 모바일 애플리케이션

## 📱 주요 기능

### 🔮 꿈 해석
- **AI 기반 해석**: OpenAI GPT를 활용한 정확하고 상세한 꿈 해석
- **오프라인 지원**: 네트워크 연결이 없을 때도 기본 해석 엔진으로 동작
- **다양한 꿈 테마**: 20가지 이상의 꿈 테마별 맞춤 해석
- **해석 기록 저장**: 모든 꿈 해석 결과를 로컬에 안전하게 저장

### 🧠 기억 복원
- **AI 기반 질문**: 망각된 기억을 되살리는 맞춤형 질문 생성
- **단계별 복원**: 체계적인 질문을 통한 점진적 기억 복원
- **감정 분석**: 기억과 관련된 감정 상태 분석

### 📊 통계 분석
- **꿈 패턴 분석**: 자주 나타나는 꿈 테마와 패턴 분석
- **감정 추이**: 꿈을 통한 감정 변화 추적
- **월별/연도별 통계**: 시간대별 꿈 해석 통계

### ⚙️ 설정 및 관리
- **다크/라이트 모드**: 사용자 선호에 따른 테마 전환
- **알림 설정**: 꿈 기록 알림 및 리마인더 설정
- **데이터 백업**: 꿈 기록 내보내기/가져오기 기능
- **피드백 시스템**: 개발자에게 개선사항 제안

### 💰 후원 기능
- **토스/카카오페이**: QR 코드를 통한 간편 후원
- **개발자 지원**: 앱 개발 및 유지보수 지원

## 🛠 기술 스택

- **Frontend**: React Native, TypeScript
- **AI Integration**: OpenAI GPT API
- **State Management**: React Context API
- **Local Storage**: AsyncStorage
- **Navigation**: React Navigation
- **Notifications**: Expo Notifications
- **Build System**: Expo (EAS Build)
- **Advertising**: Kakao AdFit

## 🚀 설치 및 실행

### 필수 요구사항
- Node.js 18+ 
- npm 또는 yarn
- Expo CLI
- iOS Simulator (iOS 개발용)
- Android Studio (Android 개발용)

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

# .env 파일에 OpenAI API 키 추가
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
EXPO_PUBLIC_ADFIT_UNIT_ID=your_adfit_unit_id_here
```

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
    ├── DreamStorage.ts  # 꿈 데이터 저장
    ├── NetworkService.ts # 네트워크 상태 관리
    ├── NotificationService.ts # 알림 관리
    ├── BackupService.ts # 데이터 백업
    └── FeedbackService.ts # 피드백 관리
```

## 🔐 보안 및 개인정보

- **로컬 저장**: 모든 꿈 기록은 디바이스에 로컬로 저장
- **API 키 보안**: 환경 변수를 통한 안전한 API 키 관리
- **개인정보 보호**: 사용자 데이터는 외부로 전송되지 않음
- **오프라인 지원**: 네트워크 없이도 기본 기능 사용 가능

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

- OpenAI GPT API
- Expo 개발팀
- React Native 커뮤니티
- 모든 사용자들의 피드백과 지원

---

**Dream Interpreter App**으로 더 나은 꿈과 기억을 경험해보세요! 🌙✨
