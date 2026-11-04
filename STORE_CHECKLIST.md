# iOS 출시 상태 — 2026-10-22

## 구현
- [x] Apple Foundation Models 기기 내 AI 브리지와 미지원 폴백
- [x] 중복 해석 엔진 통합, 상세 옵션 저장
- [x] 외부 OpenAI·Ollama·LM Studio 호출 제거
- [x] 광고 SDK 의존성 제거 및 광고 UI 비활성화
- [x] JSON 백업 검증·가져오기와 기록 병합
- [x] 동시 저장 직렬화, 손상 데이터 덮어쓰기 방지
- [x] 개인정보·약관과 온보딩 고지 수정
- [x] 전체 데이터 삭제와 예약 알림 취소
- [x] 심사 설명 및 한국어 메타데이터 초안

## 확인된 검증
- [x] 서비스 회귀 테스트 (scripts/test.cjs)
- [x] 소스 TS/TSX 구문 검사
- [x] Foundation Models Swift SDK 타입 검사 (React 타입은 테스트용 대체)
- [x] Xcode 프로젝트·Info.plist·Privacy Manifest 형식 검사
- [x] npm 잠금 파일에서 광고 제거 / document-picker 반영
- [x] 전체 TypeScript 타입 검사 및 Expo Doctor 17/17 통과
- [x] 의존성 설치 및 pod install 완료
- [x] Xcode 26.6 Release 시뮬레이터 앱 빌드
- [x] 시뮬레이터 온보딩·약관·홈 화면 기본 UI 확인
- [ ] 전체 사용자 흐름 UI 검증·스토어 스크린샷
- [ ] Apple Intelligence 지원 실기기에서 비행기 모드 AI 실행
- [ ] 미지원/AI 꺼짐/모델 준비 중/생성 실패 처리
- [ ] TestFlight에서 백업 복원·알림·삭제 실기기 검증
- [x] GitHub Pages 지원·개인정보·약관 게시 및 HTTP 200 확인
- [x] Apple Distribution 인증서·App Store 프로비저닝 프로파일 등록
- [x] EAS 서명된 App Store용 iOS 1.1.0(8) 빌드 성공
- [x] App Store Connect 앱 생성 (6825689455)
- [ ] App Store Connect 앱 ID·배포 인증서·심사 설문
- [ ] 서명된 Archive 업로드와 심사 제출

## 현재 배포 제약
저장 공간 및 iCloud 파일 다운로드 문제는 해결됐고, Release 시뮬레이터 빌드는 성공했습니다. 배포 인증서·프로비저닝 프로파일 등록과 GitHub Pages 법적 페이지 공개도 완료됐습니다. 실기기 오프라인 AI 검증, 서명된 배포 빌드 완성·업로드, App Store Connect 심사 제출은 아직 완료되지 않았으므로 출시 완료 상태가 아닙니다.
