# 해석 화면: 본문 단서 먼저

기반 main `6e59eeb`. 기능 순서: `feat/dream-evidence-first` → `feat/mongi-morning-fragment`.
홈 해석 결과와 저장된 기록 상세는 같은 `DreamEvidence`를 사용한다.
현재 본문의 상징·발췌를 해석보다 앞에 보여주고, 매칭이 없으면 안내한다.
본문과 직접 대조하지 않은 모델 상징 목록과 백분율은 두 화면에서 제거했다.
기존 저장·백업 호환을 위해 confidence와 matchedSymbols 저장 필드는 유지한다.
수정된 기록의 예전 해석에는 기존의 재해석 안내를 유지한다.
