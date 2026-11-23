# 드림로그 1.2.3 배포 인수인계

- 최신 원격 main `327ed1d`에 상징 매칭 → 기록 편집·초안 → 풍경 다양화 → 원문 중심 앨범 → 개인 상징 기록 순서로 통합했다. 병합 커밋 `7cafd69`; 원본의 미커밋 작업은 변경하지 않았다.
- App Store Connect에서 1.2.2(21) 배포 준비됨, 해당 심사 완료, 새 심사 없음과 기존 Team (Expo) 내부 테스터 1명을 확인했다.
- 새 버전 1.2.3의 앱·iOS 프로젝트·plist·패키지 표시 버전을 일치시킨다. EAS production 프로필이 빌드 번호를 원격에서 배정한다.
- Node 22에서 `npm test`, `npm run typecheck`, `git diff --check`를 실행한다. 네이티브 실기기 검증 여부는 별도 기록한다.
- Apple 업로드 성공과 TestFlight 준비 완료, App Review 제출은 서로 다른 상태다. 실제로 확인한 상태만 추가한다.
- 대한민국 단독 무료·온디바이스 처리·기존 스토어 자산을 유지한다.

## 2026-11-23 배포 진행

- 소스 `dd08b27`을 main과 `fix/ios-album-release`에 푸시했다. Node 22 회귀 검사·타입 검사·diff 검사를 통과했다.
- [서명 빌드 1.2.3(22)](https://expo.dev/accounts/qlsl1198/projects/DreamInterpreterApp/builds/54f2aa90-bca4-4ade-92f0-debbe13faf58) 소스 업로드 완료.
- EAS 빌드 성공. 서명 IPA의 압축 무결성, 번들 ID, 버전 1.2.3(22), UIScene 등록 및 `ITSAppUsesNonExemptEncryption=false`를 확인했다. 새 바이너리를 실기기에서 실행했다는 의미는 아니다.
- [EAS Apple 업로드 작업](https://expo.dev/accounts/qlsl1198/projects/DreamInterpreterApp/submissions/7a63ec80-61b0-4fbc-b2b0-93e652ffa2ce) 예약. EAS의 'submission'은 바이너리 전송이며 App Review 제출이 아니다.
- [App Store Connect 1.2.3 초안](https://appstoreconnect.apple.com/apps/6825689455/distribution/ios/version/inflight)에 한국어 업데이트 설명을 저장했다. 기존 iPhone/iPad 이미지·지원/개인정보 URL·심사 연락처·대한민국 무료·승인 후 자동 출시 설정을 확인했다.
- 심사 메모에 로그인 불필요, 앨범·도감 확인 경로, 기록 편집과 온디바이스 처리 안내를 저장했다.
- [TestFlight](https://appstoreconnect.apple.com/teams/9971145e-f3dc-41f3-bf29-f35c9129157c/apps/6825689455/testflight/ios)에서 빌드 22 검증 완료와 기존 내부 `Team (Expo)` 그룹 연결을 확인했다. 한국어 테스트 안내를 저장했고 기존 테스터와 이전 빌드는 변경하지 않았다.
- **App Store 심사 제출 완료, 심사 대기 중**. 2026-11-23 17:56 KST [제출 상세](https://appstoreconnect.apple.com/apps/6825689455/distribution/reviewsubmissions/details/d09508c0-383f-485f-8587-7a3840cdb6ce)의 제출 항목은 iOS 1.2.3(22) 한 건이다.
- 남은 확인: TestFlight 실기기 설치·실행 및 Apple 심사 결과. 승인이나 1.2.3 공개를 확인한 것은 아니다.
