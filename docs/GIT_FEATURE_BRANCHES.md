# 1.2.0 기능별 Git 분리

기준: `origin/main`의 `eeef0fd` (공개 개인정보/약관/지원 페이지 포함).
아래 브랜치는 의존 순서대로 연결한 stacked branches다. 각 브랜치의 새 커밋은 한 기능 단위이며, 앞 브랜치의 커밋을 상속한다.
순서대로 병합하거나 PR의 base를 바로 앞 브랜치로 지정한다. 마지막 브랜치에 전체 변경이 모인다.
이번 작업에서 `main` 병합, 강제 푸시, 기존 rebase/stash 정리는 하지 않는다.

| 순서 | 브랜치 | 변경 |
| --- | --- | --- |
| 1 | feat/git-workflow | 기능별 Git 규칙·비밀정보 제외·Node 버전 |
| 2 | feat/on-device-ai | Foundation Models 브리지·기본 해석·회상 일기 |
| 3 | feat/privacy-no-ads | 광고/추적 제거·개인정보·약관 |
| 4 | fix/native-build-dependencies | React Native/Hermes·CocoaPods·의존성 |
| 5 | fix/storage-backup | 동시 저장·백업 검증·손상 데이터 보존 |
| 6 | fix/local-calendar | 기기 시간대 날짜·연속 기록 |
| 7 | fix/notification-settings | 알림 시간·설정 저장 순서 |
| 8 | feat/support-feedback | 로컬 피드백·선택적 이메일 문의 |
| 9 | fix/ios-scene-lifecycle | UIScene·콜드/웜 링크 |
| 10 | fix/launch-splash | 정사각형 스플래시·배경 전환 |
| 11 | fix/app-error-recovery | 오류 경계·재시도 |
| 12 | feat/dream-world-ui | 몽이·별자리·풍경·홈·공통 UI |
| 13 | feat/dream-album | 앨범·상세 카드 |
| 14 | feat/symbol-dictionary | 그림책 도감·반응형 카드 |
| 15 | feat/dream-journey | 통계·여정 배너 |
| 16 | feat/settings-privacy | 설정·백업·데이터 관리 화면 |
| 17 | feat/release-validation | 회귀·타입·iOS 생명주기 검사 |
| 18 | feat/ios-release-config | 1.2.0 버전·EAS 빌드/제출 설정 |
| 19 | feat/store-screenshots | 실제 캡처·홍보 이미지·합성 스크립트·시안 이력 |
| 20 | feat/store-header-search | 몽이 헤더/검색 결과 이미지·규격 출력 |
| 21 | feat/release-documentation | 앱 안내·심사/배포/검수 기록·브랜치 지도 |

## 검증 범위

최종 누적 상태에서 Node 22 타입 검사, 저장/백업/AI/도감 회귀 검사, iOS 생명주기 검사와 diff 공백 검사를 실행한다.
2026-11-04 최종 누적 상태에서 위 검사 통과, Expo Doctor는 네트워크 접근을 허용한 재검사에서 17/17 통과했다.
원본 변경/신규 파일 116개의 내용이 작업 복사본과 동일함도 확인했다(브랜치 지도 기록 시점).
각 중간 브랜치의 독립 네이티브 빌드나 각 중간 커밋별 전체 테스트를 했다는 의미는 아니다.
기존 EAS 성공 빌드와 실제 Simulator 검수 범위는 RELEASE_STATUS.md 및 NATIVE_CAPTURE_QA_2026-11-04.md를 따른다.
원본 작업 폴더의 기존 rebase 표식은 보존하고 별도 작업 복사본에서 커밋을 구성했다.
