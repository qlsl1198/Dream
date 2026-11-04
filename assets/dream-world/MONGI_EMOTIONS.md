# 몽이 감정 아틀라스

`mongi-emotions.png`는 내장 imagegen으로 기존 `mongi.png`를 참고해 생성한 1536×1024 RGBA 아틀라스다.
투명 배경의 3열×2행이며 각 셀은 512×512다. 눈·입·귀·앞발 자세가 실제로 다른 여섯 표정이다.
원본 `mongi.png`는 기본 열린 눈 표정과 이미지 로드 실패 시 폴백으로 유지한다.

| 셀 | 표정 | 용도 |
| --- | --- | --- |
| 0 | 편안하게 눈 감음 | 평온, 기본 표정의 짧은 눈 깜빡임 |
| 1 | 기쁜 눈·손 인사 | 기쁨, 터치 인사 |
| 2 | 위를 보며 생각함 | 해석 처리 중 |
| 3 | 별을 안고 다독임 | 사용자가 슬픔·두려움·분노 선택 |
| 4 | 눈 동그랗게 놀람 | 놀람, 터치 인사 |
| 5 | 웃으며 별 들기 | 저장 완료 후 잠깐 축하 |

`MongiSprite`가 셀을 잘라 보여주므로 외부 다운로드/이미지 API가 필요 없다.
감정은 명시적으로 선택한 버튼에만 반응하며 꿈 텍스트에서 사용자의 심리 상태를 추론하지 않는다.
기본 호흡/둥실 움직임·기울임·별빛은 native-driver Animated로 표현한다.
동작 줄이기, 앱 백그라운드, 홈 탭 비활성 상태에서는 반복 애니메이션/눈 깜빡임을 중단한다.
동작 줄이기에서도 정적인 표정과 문구 변화는 유지한다.
사용자의 기록 여부에 따른 벌점·보살핌 의무·슬픈 방치 반응은 없다.

## 생성 프롬프트 (내장 도구, CLI/API 미사용)

Use case: illustration-story. Asset: one production sprite ATLAS for an existing React Native app character. Create exactly SIX full-body pose/expression sprites of the SAME ivory floppy-eared moon rabbit Mongi shown in reference. One single sheet, strict 3 columns x 2 rows of equally sized SQUARE cells, overall landscape aspect3:2, target1536x1024. Genuine transparent alpha throughout all empty space. No background, no grid lines, no frames, no shadows outside cells, no text or labels. Every cell rabbit occupies centered same82% of square, same scale, same sitting baseline, entire ears/feet fully inside each cell with 9% padding. Reference preserves identity: soft cream plush watercolor fur, tiny gold crescent forehead, lavender inner ears, pink cheeks, gold star held at chest, same rabbit body proportions. Row1 left: calm face, softly CLOSED eyes, peaceful small smile and relaxed ears (restful/blink frame). Row1 middle: HAPPY, closed joyful crescent eyes, open delighted smile, one paw lifted greeting and other holds star. Row1 right: THINKING, looking slightly upward, tiny thoughtful mouth, head gently tilted, star hugged thoughtfully. Row2 left: COMFORTING, soft sympathetic eyes with slightly lowered brows, reassuring warm smile, both paws cuddle star, no tears or distressed face. Row2 middle: SURPRISED, round wide eyes, small O mouth, ears lifted slightly, holding star. Row2 right: CELEBRATING saved dream, delighted eyes, star lifted proudly near chin, slightly bouncy seated posture, no extra symbols outside character. All six clearly different expressions, same painterly high quality, consistent lighting/proportions. This is a technical sprite sheet, not a scene or poster. Uniform equal square cells, strict3x2 alignment and ample margins are essential for code to crop each cell without image editing.
