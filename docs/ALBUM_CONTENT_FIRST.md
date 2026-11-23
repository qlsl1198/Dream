# 꿈 앨범: 기록을 먼저

기반: `feat/diverse-dream-landscapes` (3b744f2), 다음 브랜치 `feat/personal-symbol-records`.
꿈을 찾을 때 사용자 원문이 이미지 이름보다 유용하다. `HistoryScreen.tsx` 카드에서
날짜·감정·유형과 꿈 원문을 위에 두고 풍경 이름은 작은 이미지 캡션으로 옮긴다.
앨범에서만 해석 점수와 완료 표식을 줄인다. 저장 계약·검색·상세 기능은 그대로다.
검증: Node 22에서 `npm test`, `npm run typecheck`, `git diff --check`.
수동 검증은 기록 탭에서 긴 꿈·기록만 저장한 꿈·즐겨찾기를 찾고 상세를 연다.
