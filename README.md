# 드림로그 (DreamLog)

AI 꿈 일기 · 해몽 · 한국형 상징 사전 모바일 앱

## 주요 기능

- **AI / 오프라인 꿈 해석** — 네트워크·API 없이도 상징 기반 해석
- **꿈상징 사전** — 전통 + 심리 해석, 카테고리·검색
- **꿈 일기** — 감정, 유형(자각몽/악몽/반복꿈), 생생함, 수면, 태그
- **기록·검색·즐겨찾기·공유**
- **연속 기록(스트릭) · 감정/키워드 통계**
- **기억 복원 도구** (설정 내)
- **알림 리마인더 · 다크모드 · 백업보내기 · AdMob**

## 기술 스택

React Native (Expo 53), TypeScript, AsyncStorage, Expo Notifications, Google Mobile Ads, OpenAI API

## 시작하기

```bash
npm install
cp env.example .env
# EXPO_PUBLIC_OPENAI_API_KEY / EXPO_PUBLIC_ADMOB_UNIT_ID 설정
npx expo start
```

## 스토어 빌드

```bash
npx eas build --platform ios --profile production
npx eas build --platform android --profile production
npx eas submit --platform ios --profile production
```

## 개인정보 / 약관

- [PRIVACY.md](./PRIVACY.md)
- [TERMS.md](./TERMS.md)

꿈 기록은 기본적으로 기기에만 저장됩니다. AI 해석 시 입력 텍스트가 OpenAI로 전송될 수 있습니다.

## 버전

1.1.0 — 앱스토어 출시 대비 고도화 (온보딩, 상징 사전, 일기 확장, 법적 고지, UX/버그픽스)
