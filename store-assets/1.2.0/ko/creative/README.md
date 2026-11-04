# 헤더·검색 결과 공용 자산

내장 imagegen으로 몽이/앱 호수 일러스트를 참고해 제작한 독립 홍보 이미지.
사용자 선택에 따라 1.2.0 심사를 취소하고 자산을 추가한 뒤 동일 빌드 12로 재제출한다.
원본 `mongi-lake-source.png`, 규격 출력 `mongi-universal.png` (5244×2950 PNG, sRGB, 불투명).
규격 출력은 Swift/AppKit으로 종횡비 유지 중앙 맞춤 및 알파 제거만 수행한다. 기존 이미지를 덮어쓰지 않는다.

## 최종 생성 프롬프트

Use case: ads-marketing. Asset: premium universal landscape App Store header and search result artwork for 드림로그 dream journaling app. Generate one single landscape 16:9 image at the highest possible resolution. Reference1 exact mascot identity: ivory floppy-eared moon rabbit 몽이, subtle gold crescent on forehead, holding one glowing gold star. Reference2 app's bundled dream-lake painting color/style. Preserve mascot identity very closely. Scene: moonlit lake with soft lavender mountains and deep navy sky, painterly velvety storybook illustration, sophisticated calm atmosphere, small golden star reflections. A single large Mongi seated on a quiet bank, central-right near x58%, y50%, all ears and feet fully visible, holding glowing star; delicate constellation arcs in sky. Main mascot and supporting crescent moon must stay within central 55% width and central45% height so wide21:9 header and3:2 search crops both work. Outer left/right quarters and top/bottom quarters are atmospheric backdrop only, low contrast. No typography, no text, no logos, no UI, no hardware, no ratings, no awards, no badges, no buttons, no watermark, no price, no websites. Do not depict invented in-app functionality. This is illustrative branding of an existing mascot and dream landscape, not gameplay or an AI image generation feature. Restrained navy#0B1426, cream#F7F1E5, gold#E8CE96 with muted lavender. Make a high quality coherent cover illustration, full bleed opaque.

## 원본과 기준

- 캐릭터 참고: assets/dream-world/mongi.png
- 색/풍경 참고: assets/dream-world/moon-lake.png
- https://developer.apple.com/help/app-store-connect/reference/app-information/creative-assets-specifications
- https://developer.apple.com/app-store/asset-best-practices/

업로드·실제 배치·심사 재제출 결과는 docs/RELEASE_STATUS.md 최신 기록을 따른다.

## 배치 검수

2026-11-04 한국어 1.2.0에 헤더 1개 및 ‘검색 결과에서 헤더 자산 사용’을 저장했다.
새로고침 후 양쪽 각각 1개 유지 및 처리 오류 없음을 확인했다.
App Store Connect의 제품 페이지/검색 결과 미리보기에서 얼굴·별이 보임을 확인했다.
비율별로 배경 가장자리와 몸 아래쪽은 크롭된다. 기존 iPhone/iPad 스크린샷 각4장은 유지한다.
공용 이미지 SHA-256: `4f3972b58ee0143cc691a1d178e8d1146d57371f0d679850df7a5077f5ff3779`.

2026-11-04 오전 9:36 (KST), 헤더·검색 결과 배치를 포함한 1.2.0 (12) 재제출 완료.
현재 ‘심사 대기 중’. 제출 ID: `b73e93c0-36b6-4a59-82f5-acaa24a0a503`.
