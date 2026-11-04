# 드림로그 — iOS
꿈 일기, 상징 사전, 감정 통계, 온디바이스 해석 앱입니다.

## AI
iOS 26 이상의 Apple Intelligence 지원 기기에서 시스템 모델이 준비되면 Apple Foundation Models의 온디바이스 모델을 사용합니다. 별도 서버·API 키·PC가 필요하지 않습니다. 미지원 기기, 모델 준비 전, 생성 실패 시 규칙 기반 해석으로 자동 전환합니다. Expo Go에는 커스텀 네이티브 브리지가 없으므로 AI 검증은 네이티브 빌드와 실기기에서 해야 합니다.

## 개발
Node 22, Xcode 26 이상과 CocoaPods가 필요합니다.
```sh
npm ci
cd ios
pod install
cd ..
npm run verify
npx expo run:ios
```

이 저장소는 ios/ 네이티브 프로젝트를 직접 관리합니다. app.json만 수정하면 네이티브 설정에 자동 반영되지 않습니다. 특히 DreamOnDeviceAI.swift/.m의 Xcode 타깃 소스 등록을 유지해야 합니다. prebuild --clean은 사용자 정의 브리지를 지울 수 있으므로 사용하지 않습니다. Expo Doctor의 CNG 설정 동기화 경고는 이 방식 때문에 비활성화되어 있습니다.

## 데이터
AsyncStorage에 기록하며 동시 저장은 직렬화합니다. 읽기 실패 시 기존 데이터를 덮어쓰지 않습니다. JSON 백업에는 꿈·회상 기록이 포함되며 가져오기는 같은 ID의 현재 기록을 우선해 병합합니다. HTML 내보내기는 읽기용입니다. 파일은 공유 후 앱 임시 저장소에서 제거합니다. 이용자가 내보낸 사본은 이용자가 관리해야 합니다.

광고·추적 SDK와 외부 AI 호출은 출시 의존성에서 제거했습니다. iOS Pods는 반드시 다시 설치해 반영해야 합니다.

## 출시
```sh
npm run build:ios
npm run submit:ios
```
실제 제출에는 EAS 로그인, 배포 인증서와 App Store Connect 앱이 필요합니다. 숫자 앱 ID를 발급받으면 EXPO_PUBLIC_IOS_STORE_URL에 실제 스토어 URL을 지정합니다.

검증되지 않은 Archive를 출시 완료로 취급하지 않습니다. 현재 검증·남은 작업은 [STORE_CHECKLIST.md](STORE_CHECKLIST.md), 심사 설명은 [스토어 자료](docs/APP_STORE_METADATA.ko.md)에 있습니다.
