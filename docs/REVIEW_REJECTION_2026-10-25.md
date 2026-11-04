# App Store 심사 거절 분석 — 2026-10-25

## Apple에서 확인한 사실

- 제출 ID: `121029f2-4980-48be-8665-74202cad54d5`
- 앱: 드림로그 - 꿈 일기와 해석, 1.1.0 (8)
- 사유: Guideline 2.1(a), 실행 직후 충돌로 심사 불가
- 기기: iPad Air 11-inch (M3), iPadOS 27.0.1 (24A446)
- 첨부 로그 2개 모두 `EXC_BREAKPOINT / SIGTRAP`, 메인 스레드의
  `___UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption_block_invoke`에서 종료
- 첫 로그는 실행 후 약 0.13초에 종료: JavaScript 화면이나 AI 생성 이전의 UIKit 실행 단계 문제

## 원인과 보완 방향

iOS/iPadOS 27 SDK로 빌드한 앱에는 UIKit scene 기반 생명주기가 필요하다.
현재 심사 빌드는 이 요구를 충족하지 못했다. `UIApplicationSceneManifest`만
추가하면 창이 scene에 연결되지 않아 검은 화면이 될 수 있으므로, 창 생성과
React Native 시작을 `UIWindowSceneDelegate`로 함께 이전해야 한다.

- scene 설정은 단일 창으로 등록한다.
- `UIWindow(windowScene:)`로 창을 만들고 React Native factory를 한 번 시작한다.
- AppDelegate의 window 참조를 유지해 기존 Expo/RN 호환성을 보존한다.
- cold/warm URL과 universal link를 기존 AppDelegate 경로에 전달한다.
- 온디바이스 AI, 로컬 데이터, 대한민국 단독/무료 출시는 변경하지 않는다.

## 검증 및 재제출 조건

- [x] AppDelegate의 창 생성을 SceneDelegate로 이전, cold/warm 링크 전달 보존
- [x] native Info.plist와 Expo app.json에 동일한 단일 scene 등록
- [x] `plutil -lint` 및 `swiftc -frontend -parse` 통과 (문법 검사이며 전체 타입/링크 검사는 아님)
- [x] `node scripts/check-ios-lifecycle.cjs` 통과; npm test에 회귀 검사 추가
- [x] 기존 JavaScript 회귀 테스트 통과 (2026-10-30 재확인: 백업 검증, 동시 저장, 손상 데이터 보존, 날짜, AI 파싱, 오프라인 대체)
- [x] 타입 검사: 동일 소스의 임시 로컬 복사본에서 `tsc --noEmit --preserveSymlinks` 통과 (2026-10-30)
- [x] Release arm64 Simulator 빌드 성공 (2026-10-30, Xcode 26.6 / Simulator 26.5)
- [x] iPhone 17 / iPad Pro 13-inch (M5) 홈 표시 및 종료 후 재실행 확인 (Simulator 26.5)
- [x] iPhone에서 background/resume 확인
- [x] iPad에서 background/resume 확인 (동일 프로세스 복귀 및 홈 화면 캡처)
- [ ] iPadOS 27 이상의 실제 기기 또는 Simulator에서 실행 확인
- [ ] 새 서명 빌드를 TestFlight에서 실행 확인
- [ ] 새 빌드를 선택하고 Apple 심사에 수정 내역 회신 후 재제출

분석 문서 작성만으로 충돌 수정이나 검증이 완료된 것은 아니다.

2026-10-30 로컬 검증 환경은 Xcode 26.6 / iOS Simulator 26.5이다.
iOS 27 런타임은 설치되어 있지 않으므로 해당 OS에서 해결되었다고 단정하지 않는다.
Release 빌드와 두 Simulator의 홈 화면/재실행은 확인했지만, 실제 기기의 AI 생성과
새 서명 빌드의 TestFlight 검증은 남아 있다.

로컬 의존성 복구 과정에서 Hermes 0.79.6의 Debug 바이너리와 이전 Release 캐시
표시가 섞여 JS 스레드 EXC_BAD_ACCESS가 발생했다. Release 아티팩트를 다시 적용한
빌드는 정상 실행되었다. 이는 Apple 심사 로그의 UIScene SIGTRAP과 별개인 로컬
빌드 캐시 문제다. Podfile에서 설치 후 구성 캐시를 무효화하여 재발을 방지했다.

Expo 자동 연결의 검색 범위를 프로젝트 내부로 제한하고 CocoaPods에는 절대 경로를
전달했다. 상위 iCloud 폴더를 탐색하던 npx도 설치된 도구의 Node 직접 실행으로 바꿨다.
최종 pod install은 성공했고 Podfile.lock과 설치 Manifest.lock이 일치한다.
이후 scene 구조 검사와 기존 JavaScript 회귀 테스트도 다시 통과했다.

2026-10-30 `node_modules/@types`에 iCloud 중복 폴더(`react 2`,
`babel__core 3` 등)가 있어 자동 전역 타입 검색이 실패하는 것을 확인했다.
`tsconfig.json`에 전역 타입을 `react`, `node`로 명시했으며, 중복 폴더는
삭제하지 않았다. 임시 로컬 복사본의 타입 검사는 통과했지만 원본 iCloud 경로의
검사는 상위 폴더 의존 파일 조회에서 지연되어 시간 제한으로 중단했다.

## Apple 회신 초안 (아직 전송하지 않음)

### 2026-10-30 사용자 테스트 및 시작 화면 후속 보완

사용자는 빌드 9 테스트에서 시작 시 정사각형 이미지가 잠깐 보이는 문제 외에는
이상이 없다고 보고했다. 테스트 기기 모델과 정확한 OS 버전은 아직 받지 못했다.
따라서 특정 iPadOS 27 기기의 통과 증거로 확대해서 기록하지 않는다.

native SplashScreen.storyboard는 예전 정사각형 이미지와 흰 배경을 참조하고 있어
Expo 설정의 남색 배경과 불일치했다. 오래된 이미지 뷰를 제거하고 native 색상,
Expo 설정, React Native 초기 root view 배경을 #0B1426으로 통일했다.
이미지 파일 자체는 삭제하지 않았다. 인위적인 표시 지연은 추가하지 않았다.
문법/구조 검사는 통과했으며 새 기기용 빌드와 시작 화면 육안 확인은 별도 필요하다.

아래 문구는 새 빌드의 실제 실행 검증이 끝난 뒤 빌드 번호와 검증 환경을
채워 전송해야 한다. 현재 빌드 8의 문제가 해결되었다고 보고해서는 안 된다.

> We identified the launch failure in the attached reports as a missing UIKit
> scene-based lifecycle. We moved window creation and React Native initialization
> into a UIWindowSceneDelegate, registered the scene configuration, and preserved
> cold/warm URL handling. The replacement build is [BUILD NUMBER]. We verified
> cold launch and background/resume on [DEVICE AND OS]. Please review this new
> build. The app continues to process AI requests on device; no AI server or login
> is required.

## 근거

- Apple 심사 메시지 및 첨부 crashlog 03447DFE / 9DE15E32 (2026-10-29 직접 확인)
- [Apple TN3187](https://developer.apple.com/documentation/technotes/tn3187-migrating-to-the-uikit-scene-based-life-cycle)
- [Expo upstream scene lifecycle 논의](https://github.com/expo/expo/issues/50179)
