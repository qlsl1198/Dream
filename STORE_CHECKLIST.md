# App Store / Play Store 출시 체크리스트

## 코드/빌드
- [x] 버전 1.1.0 / build 2
- [x] 표시 이름: 드림로그
- [x] 온보딩 + 개인정보 고지
- [x] 개인정보 처리방침 / 이용약관 인앱
- [x] 알림 권한 문구
- [x] ATT 문구 (iOS)
- [x] AdMob App ID 설정
- [ ] 실제 OpenAI API 키를 EAS Secret / 환경변수로 설정
- [ ] 실제 AdMob 배너 유닛 ID 설정
- [ ] App Store Connect / Play Console 앱 등록

## 스토어 메타 (제안)
- **이름**: 드림로그 - AI 꿈해몽·일기
- **부제**: 꿈 기록, 상징 사전, AI 해몽
- **카테고리**: 라이프스타일 / Lifestyle
- **키워드**: 꿈해몽, 꿈일기, 자각몽, 상징, AI해몽, 꿈해석
- **연령**: 12+ 권장 (광고 포함)
- **스크린샷**: 해석 / 사전 / 기록 / 통계 / 온보딩

## 제출 전 수동
1. `eas build -p ios --profile production`
2. `eas submit -p ios`
3. Privacy Nutrition Labels: Product Interaction(앱 기능), 광고 데이터
4. 심사용 계정/노트: "AI 키 미설정 시 오프라인 해석으로 동작"
5. 지원 URL / 개인정보 URL (PRIVACY.md를 GitHub Pages 등으로 호스팅)
