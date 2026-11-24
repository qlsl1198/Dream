# 드림로그 1.2.4 TestFlight 인수인계

- 범위: 두 기능을 main에 병합하고 기존 내부 TestFlight 그룹으로 배포한다. 기존 App Store 제출·출시 설정은 변경하지 않고 1.2.4의 App Store 심사는 제출하지 않는다.
- 기준 main `6e59eeb` → 본문 단서 `024c130` → 몽이 초안 `88e41bc` → 웹 검증 기록 `5c9b610` → 병합 `d53c6f6`.
- 앱 표시·package·iOS 프로젝트·plist 버전을 1.2.4로 통일해 이미 제출한 1.2.3과 테스트 대상을 분리한다. 빌드 번호는 기존 EAS 원격 자동 증가 정책을 유지한다.
- 재현: Node 22 `npm test`, `npm run typecheck`, `git diff --check`. 앱 안에서 ‘아침 한 조각’ 초안을 닫고 다시 열며, 앨범에 기록이 추가되지 않는지 확인한다. 해석 화면에서 백분율 대신 본문 발췌와 단서 없음 안내가 먼저 나오는지 확인한다.
- 기존 웹 검증의 React 반복 업데이트 경고와 웹 삭제 미동작은 별도 조사 대상이다. [기능 QA](MONGI_MORNING_FRAGMENT.md) 참조. 웹 QA와 iOS 실기기 테스트는 구분한다.

## 2026-11-24 배포 경과

- `d63593e`를 원격 main과 `fix/ios-morning-testflight`에 푸시했다. Node 22.23.3 타입·회귀·공백 검사 통과. App Store Connect에서 기존 1.2.3(22) 승인 및 대한민국 공개를 확인했다.
- EAS 클라우드 무료 한도 소진(Expo 안내: 12월 1일 초기화)으로 번호 23의 빌드 작업은 생성되지 않았다. 요금제는 변경하지 않았다.
- macOS의 기존 Xcode 27.2와 Node 22, fastlane 2.242.0, CocoaPods 1.17.0으로 [로컬 EAS 빌드](https://docs.expo.dev/build-reference/local-builds/)를 사용했다. 번호 24는 fastlane 설치 후 Ruby와 기존 CocoaPods의 호환 문제로 컴파일 전 중단됐다. CocoaPods를 복구한 뒤 번호 25로 재시도했다.
- 재현: `npx eas-cli@25.3.0 build --platform ios --profile production --local --non-interactive --output <임시 폴더>/DreamLog-1.2.4.ipa`. 기존 원격 서명 자격 증명을 사용한다. 인증서나 프로비저닝 파일을 Git에 넣지 않는다.
- 번호 25의 iOS 번들·Xcode Release 아카이브·App Store용 IPA 내보내기 성공. 로컬 빌드는 임시 키체인과 프로비저닝을 정리했다. `unzip -tq`, `codesign --verify --deep --strict` 및 plist에서 1.2.4(25), 앱 번들 ID, SceneDelegate, 비면제 암호화 미사용 설정을 재확인했다.
- 로컬 IPA 경로를 명시해 `npx eas-cli@25.3.0 submit --platform ios --profile production --path <검증된 IPA> --non-interactive --no-wait` 실행. [Apple 전송 작업](https://expo.dev/accounts/qlsl1198/projects/DreamInterpreterApp/submissions/07b8d837-0f79-482f-88d4-306ddb0b161f)은 App Review 제출과 다르다.
- 2026-11-24 11:30 KST: [TestFlight 1.2.4(25)](https://appstoreconnect.apple.com/teams/9971145e-f3dc-41f3-bf29-f35c9129157c/apps/6825689455/testflight/ios/86529542-04c9-45bf-a003-ea701432400c)의 Apple 처리 및 바이너리 검증 완료, 기존 내부 `Team (Expo)` 그룹과 테스터 1명 연결, 한국어 테스트 안내 저장을 확인했다.
- 남은 확인: 새 빌드를 iOS 실기기에서 설치·실행해 짧은 초안 복원과 단서 우선 표시를 테스트한다. 1.2.4 App Store 초안 및 심사 제출은 만들지 않았다.
