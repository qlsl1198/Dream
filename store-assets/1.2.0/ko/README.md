# 드림로그 1.2.0 한국어 스토어 홍보 이미지

## 2026-11-04 실제 iOS 캡처 최종본

- `ipad/01-home.png` ~ `04-journey.png`: 실제 전용 iPad Pro 13-inch (M5), iPadOS Simulator 26.5 캡처 기반. 2064 × 2752 PNG, 알파 없음.
- `iphone/01-home.png` ~ `04-journey.png`: 11월 3일 실제 iPhone 17 Pro, iOS Simulator 26.5 캡처 기반. 1206 × 2622 PNG, 알파 없음.
- 캡처 원본: `native-ipad/`, `native-iphone/`. 앱 1.2.0 EAS Simulator 빌드 `fd83b144-15ef-4bcf-94a7-fb19b8c2663a`.
- 사용자 선택에 따라 코드 기반 합성. 앱 화면 전체를 비율 유지하여 배치하고, UI 내부를 재작성하지 않았다. 제목·배경·캐릭터 장식은 화면 외부에 배치했다.
- iPad는 새 전용 기기로 개인 기록 0개. iPhone은 기록이 없는 즐겨찾기·기간 필터 화면을 사용하여 개인 꿈 텍스트를 공개하지 않는다.
- 8장 모두 육안 검수 및 규격·알파 검사 완료. 2026-11-04 ASC 1.2.0 한국어 iPhone 중형/iPad 13-inch 슬롯에 각각 4장 등록 완료.
- 새로고침 후 홈→앨범→도감→여정 순서, 처리 오류 없음, 저장 유지 및 썸네일 표시를 확인했다. 이전 홈 이미지는 1.2.0 초안에서만 제거했고 자산 보관함과 공개 1.1.0은 유지했다.
- 2026-11-04 오전 9:29 (KST) 1.2.0 (12) 최종 심사 제출 완료, ‘심사 대기 중’ 확인. 제출 ID `cded5e21-6eb0-49a3-8975-875e70c53bd1`.
- 아래 초안/웹 미리보기 관련 기록은 과거 이력이며 최종 업로드 대상이 아니다.

## 상태

- 제작 방식: 기본 내장 imagegen, 4개 개별 시안.
- 시안의 UI 입력은 웹 미리보기이며 **iOS 캡처가 아니다**.
- 시안은 업로드 금지. 실제 iPhone/iPad 화면으로 교체하고 글자·수치·기능 일치 여부를 검수해야 한다.
- App Store Connect 등록 및 공개는 아직 완료되지 않았다.
- 시안 파일: `01-home-draft.png`, `02-album-draft.png`, `03-dictionary-draft.png`, `04-journey-draft.png` (각 852 × 1846). 업로드 규격으로 출력한 최종본이 아니다.
- 생성 후 육안 검수: 홍보 문구는 읽히지만 원본 UI에 없던 테두리/광택 등 스타일 변화가 있어, 실제 캡처 무변형 합성으로 대체해야 한다.
- 2026-11-03 ASC 확인: 기존 브라우저 탭이 로그인 URL(`authResult=FAILED`)에 있으며 페이지 연결도 시간 초과. 1.2.0 버전 초안 및 빌드 처리 상태는 확인하지 못했다. 외부 변경 없음.
- 후속 확인: 사용자 로그인 후 연결 복구. TestFlight 1.2.0 (12) ‘제출 준비 완료’ 확인. 1.2.0 ‘제출 준비 중’ 초안 생성, 기존 1.1.0 유지. 초안에는 이전 iPhone/iPad 스크린샷이 상속되어 있으며 새 이미지 업로드는 아직 하지 않았다.
- 사용자 선택: 실제 iOS 캡처 원본을 유지하고 코드 기반 레이아웃으로 합성. `scripts/render-store-art.swift` 준비 (실제 캡처 입력으로 실행/검수는 아직 하지 않음).
- 캡처용 EAS Simulator 빌드: `fd83b144-15ef-4bcf-94a7-fb19b8c2663a`, 진행 중.
- 로컬 실행 대기 사유: Mac 여유 공간이 작업 중 약 1.8GB에서 818MB로 감소. 기존 네이티브 앱 빌드 없음. 다른 앱용 기기 KMate Store iPhone/iPad는 변경하지 않았으며, 데이터 삭제도 하지 않았다. 캡처 작업 전 최소 5GB 이상 여유 공간 확보 필요.
- 기존 공개 버전 1.1.0의 스크린샷을 덮어쓰지 않고 1.2.0 업데이트용으로 준비한다.

## 순서와 문구

### 실제 화면 무변형 합성 미리보기

사용자 요청으로 공간 확보를 기다리지 않고 기존 웹 캡처 원본을 합성했다.
생성형 AI로 UI를 다시 그리지 않았으며, 원본 화면은 비율을 유지한 채 확대했다.
하단에 웹 미리보기 기반임을 표시했다. 저해상도 원본이므로 최종 iOS 캡처 교체는 여전히 필요하다.
이 파일들은 스토어에 업로드하지 않았다.

- [홈](composed-preview/01-home.png)
- [꿈 앨범](composed-preview/02-album.png)
- [상징 도감](composed-preview/03-dictionary.png)
- [꿈의 여정](composed-preview/04-journey.png)

4장 모두 1206 × 2622, PNG, 알파 없음 확인. 육안으로 제목·보조 문구 줄바꿈과 화면 잘림 여부 확인.
재현 명령 (프로젝트 루트, 출력 디렉터리는 기존 파일 없는 새 경로 사용):

```sh
swift -module-cache-path /private/tmp/dreamlog-art-module-cache scripts/render-store-art.swift store-assets/1.2.0/ko/web-preview-inputs <새-출력-디렉터리> iphone web-preview
```

| 순서 | 화면 | 큰 문구 | 보조 문구 |
| --- | --- | --- | --- |
| 01 | 홈 / 몽이 | 어젯밤의 꿈이 / 나만의 이야기가 돼요 | 드림로그 |
| 02 | 꿈 앨범 | 밤마다 쌓이는 / 나만의 꿈 앨범 | 기록하고, 찾고, 다시 꺼내보세요 |
| 03 | 상징 도감 | 꿈속 단서를 / 한 장씩 펼쳐보세요 | 28개의 상징, 나를 돌아보는 작은 힌트 |
| 04 | 꿈의 여정 | 쌓인 꿈 속에서 / 나의 마음을 만나요 | 기록과 감정을 천천히 돌아보는 시간 |

## 이미지 생성 프롬프트 세트

공통: Use case ads-marketing. Premium Korean App Store screenshot DESIGN DRAFT for 드림로그, portrait 9:19.5. Midnight navy #0B1426, restrained gold #E8CE96, warm ivory #F7F1E5, quiet editorial typography, generous margins. Existing UI reference shown intact inside a large front-facing rounded panel occupying lower 67%; no invented features, hardware mockups, ratings, awards, testimonials or App Store badges. Exact Korean headlines as in the table. Tiny bottom caption: `디자인 시안 · 실제 iOS 화면으로 교체 예정`. One portrait creative per output, not a collage.

- 01: Ivory moon rabbit 몽이 holding a golden star; preserve identity from assets/dream-world/mongi.png. Exact home UI from dreamlog-v2-home.png. Top 28% with brand and headline. Mascot peeks at lower right outside the UI without covering text. Few delicate stars and moonlit haze. Do not claim AI image generation.
- 02: Exact dream album UI from dreamlog-v2-history.png. Atmospheric moonlit lake backdrop. Preserve the single fictional example record and its values; do not add records or photo gallery features. No claims of AI image generation.
- 03: Exact dictionary UI from dreamlog-dictionary-list.png. Muted lavender haze and tiny gold stars. Subtle open storybook motif at upper right; no unrelated characters. Preserve 28-symbol count and all UI text.
- 04: Exact stats UI from dreamlog-v2-stats.png. Subtle constellation motif and warm gold lines. Preserve all example numbers and charts. No diagnosis, scientific mental health inference or fortune prediction claims.

## 최종 캡처/등록 체크

- TestFlight 1.2.0 (12)에서 캡처. 앱 버전 확인 후 홈·꿈 앨범·상징 도감·꿈의 여정 각 1장.
- iPad는 실제 iPad 레이아웃 별도 사용. iPhone 화면을 늘려서 대체하지 않는다.
- 개인 꿈·전화번호·이메일·알림·계정 정보는 포함하지 않는다. 가상 예시를 쓰면 예시임을 명시한다.
- AI는 지원 기기/설정에 따라 달라지므로 모든 기기에서 동일한 AI 기능을 제공한다고 쓰지 않는다.
- 이미지 카드에 대해 매번 새로운 그림을 생성한다고 표현하지 않는다.
- 진단·예언·심리 분석의 정확성을 보장하지 않는다.
- 시안 안내 문구는 실제 iOS 화면 교체 및 최종 검수 후에만 제거한다.
- ASC 초안에서 확인한 필수 iPhone medium 슬롯에 맞춰 목표 출력: 1206 × 2622 PNG, iPad 13-inch: 2064 × 2752 PNG. iPhone large 1320 × 2868 슬롯도 별도 지원된다. 등록 직전 해당 슬롯을 재확인한다.
- 업로드 후 4장 순서, 썸네일, 처리 오류, 저장 성공을 확인한다. 심사 제출은 별도 작업이다.

Apple 기준:
- https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/
- https://developer.apple.com/app-store/review/guidelines/ (2.3 Accurate Metadata)
