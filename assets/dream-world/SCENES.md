# 내용별 꿈 풍경 (2026-11-05)

기존 호수·정원 2장만 재사용하던 배경을 7개 장면과 서로 다른 파일로 연결했다.
`scene-forest.png`, `scene-sky.png`, `scene-city.png`, `scene-cozy.png`, `scene-storm.png`은 내장 이미지 생성 도구로 제작한 원본 1536×1024 PNG다. 기존 `moon-lake.png`·`moon-garden.png`는 물결·기본 밤 장면에 유지한다.

공통 최종 프롬프트: `Use case: illustration-story. Asset: bundled offline background illustration for Dreamlog dream journal iOS app. [subject] Style: sophisticated soft hand-painted storybook watercolor, delicate paper grain, midnight navy, muted periwinkle and subtle warm gold. Wide landscape 3:2 composition, full-bleed scenery, clear recognizable scene in upper two thirds and quiet dark lower third for native app text overlay. Original illustration. No rabbit or mascot, no UI, no text, no letters, no border, no watermark. One image only.`

각 subject:

- forest: A quiet deep forest with tall arching trees, fern-covered path, tiny golden fireflies, misty emerald and blue foliage. Clearly a FOREST, not a lake, no buildings.
- sky: A dream of FLYING: sweeping soft cloud islands floating high above the earth, open starry indigo sky, luminous crescent and wind-swept ribbons of cloud. No lake, no forest, no buildings.
- city: A dreamlike Korean CITY street at blue hour, small warm-lit apartment windows, a winding pedestrian lane, a bus stop without lettering, gentle distant urban skyline. Clearly architecture, not garden or water.
- cozy: A comforting HOME interior at night: a warm amber reading lamp, soft armchair, small table with closed book, large window framing a crescent moon. No people, no text. Cozy cream and navy atmosphere.
- storm: A mysterious but non-frightening STORM landscape: dark violet clouds, distant silver lightning, a winding empty path and wind-blown grasses, a thin warm break in the clouds. No gore, no people, no monsters, no lake.

앱 실행 중 생성하는 이미지가 아니다. 꿈 본문을 우선해 로컬 키워드로 분류하고, 본문에 단서가 없을 때만 추출 상징을 참고한다. 둘 다 단서가 없으면 기본 밤 장면이다. 같은 분류의 꿈은 같은 일러스트를 사용하며 꿈마다 고유 그림을 생성한다고 표현하지 않는다. 외부 전송·SDK·추가 의존성·기록 스키마 변경 없음. 기존 저장 기록도 상세 열기 시 새 분류를 사용한다.
