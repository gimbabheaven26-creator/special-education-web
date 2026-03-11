import type { QuizQuestion } from '@/types/quiz';

export const visualImpairmentQuizzes: QuizQuestion[] = [
  {
    id: 'vi-q1',
    subject: 'visual-impairment',
    chapter: 'orientation-mobility',
    type: 'multiple',
    question:
      '시각장애 학생이 실내에서 핸드트레일링법과 상부보호법을 함께 사용하는 이유로 가장 적절한 것은?',
    options: [
      '벽면을 따라 이동하면서 동시에 상체 전방의 장애물로부터 머리와 상체를 보호하기 위해',
      '보행 속도를 높이기 위해',
      '지팡이 사용을 대체하기 위해',
      '방향 감각을 훈련하기 위해',
    ],
    answer: 0,
    explanation:
      '핸드트레일링법은 벽이나 난간 등을 손으로 따라가며 이동하는 기법이고, 상부보호법은 한쪽 손을 얼굴 앞에 올려 머리와 상체를 보호하는 기법입니다. 실내에서 벽을 따라 이동할 때 돌출된 장애물(게시판, 소화전 등)에 부딪히지 않도록 두 기법을 함께 사용합니다.',
    difficulty: 2,
    source: 'KICE 2026 전공A-8',
    tags: { disability: '시각장애' },
  },
  {
    id: 'vi-q2',
    subject: 'visual-impairment',
    chapter: 'orientation-mobility',
    type: 'fill_in',
    question:
      '보행훈련에서 랜드마크(landmark)란 일정한 위치에 고정되어 있어 자신의 현재 위치를 파악하는 데 도움이 되는 단서를 말한다. 랜드마크로 사용할 수 있는 조건은 ( )이어야 한다는 것이다.',
    answer: '위치가 고정적(영구적)',
    explanation:
      '랜드마크는 환경 내에서 항상 같은 위치에 고정되어 있는 사물이어야 합니다. 예를 들어 엘리베이터, 계단, 소화전 등은 고정되어 있으므로 랜드마크로 적합하지만, 이동 가능한 휴지통이나 우산꽂이 등은 위치가 변할 수 있어 랜드마크로 부적합합니다. KICE 2026 전공A-8에서 이 개념이 출제되었습니다.',
    difficulty: 2,
    source: 'KICE 2026 전공A-8',
    tags: { disability: '시각장애' },
  },
  {
    id: 'vi-q3',
    subject: 'visual-impairment',
    chapter: 'orientation-mobility',
    type: 'multiple',
    question:
      '안내보행에 대한 설명으로 옳지 않은 것은?',
    options: [
      '시각장애인이 안내자의 팔꿈치 위를 잡고 반 보 뒤에서 따라 걷는다',
      '좁은 통로를 지날 때 안내자가 팔을 등 뒤로 뻗어 시각장애인이 안내자 뒤로 이동한다',
      '안내견 보행 시 안내견이 "지적 불복종(intelligent disobedience)"을 하면 즉시 교정해야 한다',
      '안내보행은 독립보행 훈련 이전에 가장 기초적으로 배우는 보행 기술이다',
    ],
    answer: 2,
    explanation:
      '지적 불복종(intelligent disobedience)이란 안내견이 위험한 상황에서 사용자의 명령을 의도적으로 거부하는 행동으로, 안전을 위한 중요한 기능입니다. 따라서 교정하는 것이 아니라 이를 존중해야 합니다. KICE 2024 전공A에서 안내견 보행과 지적 불복종 개념이 출제되었습니다.',
    difficulty: 2,
    source: 'KICE 2024 전공A',
    tags: { disability: '시각장애' },
  },
  {
    id: 'vi-q4',
    subject: 'visual-impairment',
    chapter: 'visual-acuity',
    type: 'fill_in',
    question:
      '시력 측정에서 50cm 앞에서 손가락 개수를 셀 수 있는 정도의 시력을 ( )(이)라 하며, 빛의 유무만 감지할 수 있는 시력을 ( )(이)라 한다.',
    answer: '지수(指數) / 광각(光覺)',
    explanation:
      '시력의 수준은 다음과 같이 분류됩니다: 광각(빛의 유무만 감지) → 수동(手動, 눈앞에서 손의 움직임 감지) → 지수(指數, 일정 거리에서 손가락 개수 셈) → 소수시력(시력표로 측정). KICE 2026 전공A-8에서 "50cm 앞에서 손가락 개수를 셀 수 있는 정도"의 시력을 묻는 문항이 출제되었습니다.',
    difficulty: 2,
    source: 'KICE 2026 전공A-8',
    tags: { disability: '시각장애' },
  },
  {
    id: 'vi-q5',
    subject: 'visual-impairment',
    chapter: 'visual-training',
    type: 'multiple',
    question:
      '망막색소변성으로 터널 시야를 가진 학생에게 "움직이는 공 주고받기"와 "움직이는 단어 카드 읽기" 활동을 실시하였다. 이 시기능 훈련에서 활용하는 시각 활용 기술의 명칭은?',
    options: [
      '주시(fixation)',
      '추적(tracking)',
      '주사(scanning)',
      '변별(discrimination)',
    ],
    answer: 1,
    explanation:
      '추적(tracking)은 움직이는 대상을 시선으로 따라가는 시각 활용 기술입니다. 움직이는 공이나 단어 카드를 눈으로 따라가며 읽는 훈련은 추적 기술에 해당합니다. KICE 2025 전공A-7에서 시기능 훈련의 시각 활용 기술 명칭이 출제되었습니다.',
    difficulty: 2,
    source: 'KICE 2025 전공A-7',
    tags: { disability: '시각장애' },
  },
  {
    id: 'vi-q6',
    subject: 'visual-impairment',
    chapter: 'visual-training',
    type: 'fill_in',
    question:
      '황반변성으로 중심부 시야가 손상된 학생에게는 암점의 위치와 크기를 확인하여 ( ) 방법을 지도해야 한다.',
    answer: '편심 주시(eccentric viewing)',
    explanation:
      '편심 주시(eccentric viewing)는 중심부 시야(황반)에 암점이 있는 학생이 암점이 아닌 주변 망막 부위를 사용하여 대상을 보는 방법입니다. 학생이 고개나 시선을 약간 돌려 암점을 비켜 보도록 훈련합니다. KICE 2025 전공A-7에서 출제되었습니다.',
    difficulty: 2,
    source: 'KICE 2025 전공A-7',
    tags: { disability: '시각장애' },
  },
  {
    id: 'vi-q7',
    subject: 'visual-impairment',
    chapter: 'braille',
    type: 'ox',
    question:
      '한국 점자에서 수표(⠼)는 숫자 앞에 붙이며, 영어 점자에서 대문자 표기는 해당 알파벳 점자 앞에 대문자표(⠠)를 붙인다.',
    answer: 'O',
    explanation:
      '한국 점자에서 숫자를 나타내려면 수표(⠼, 3-4-5-6점)를 숫자 앞에 붙입니다. 영어 점자(UEB: Unified English Braille)에서 대문자를 나타내려면 대문자표(⠠, 6점)를 해당 알파벳 점자 앞에 붙입니다. 연속 대문자의 경우 이중 대문자표(⠠⠠)를 사용합니다. KICE 2026에서 영어 점자 대문자 표기가 출제되었습니다.',
    difficulty: 2,
    source: 'KICE 2026',
    tags: { disability: '시각장애' },
  },
  {
    id: 'vi-q8',
    subject: 'visual-impairment',
    chapter: 'assistive-tech',
    type: 'multiple',
    question:
      '점자정보단말기에 대한 설명으로 옳은 것은?',
    options: [
      '점자 출력만 가능하며 음성 출력 기능은 없다',
      '점자 입력과 출력, 음성 합성, 인터넷 접속 등의 기능을 갖춘 보조공학 기기이다',
      '시각장애 학생의 확대 읽기만을 위한 기기이다',
      '로우테크 보조공학 기기에 해당한다',
    ],
    answer: 1,
    explanation:
      '점자정보단말기는 점자 입출력, 음성 합성, 문서 작성, 인터넷 접속, 이메일 등 다양한 기능을 갖춘 하이테크 보조공학 기기입니다. 시각장애 학생의 정보 접근성을 높이는 핵심 기기로, KICE에서 보조공학 관련 문항에 자주 등장합니다.',
    difficulty: 1,
    tags: { disability: '시각장애' },
  },
  {
    id: 'vi-q9',
    subject: 'visual-impairment',
    chapter: 'visual-acuity',
    type: 'multiple',
    question:
      '스넬렌 시력표로 측정한 시력이 20/200인 학생에 대한 설명으로 옳은 것은?',
    options: [
      '정상 시력인이 200피트에서 볼 수 있는 것을 20피트에서 볼 수 있다',
      '이 학생은 저시력(low vision)에 해당하며 시각장애에 포함되지 않는다',
      '최대 교정시력이 20/200이면 법적 맹(legal blindness)에 해당한다',
      '스넬렌 시력표의 20/200은 소수시력 0.2에 해당한다',
    ],
    answer: 2,
    explanation:
      '스넬렌 시력 20/200은 정상인이 200피트에서 볼 수 있는 것을 20피트까지 가까이 가야 볼 수 있다는 의미입니다. 최대 교정시력이 20/200 이하이면 법적 맹(legal blindness)에 해당합니다. 소수시력으로 환산하면 20/200 = 0.1입니다.',
    difficulty: 2,
    tags: { disability: '시각장애' },
  },
  {
    id: 'vi-q10',
    subject: 'visual-impairment',
    chapter: 'visual-training',
    type: 'descriptive',
    caseContext: `다음은 ○○ 특수학교 시각장애 학생의 특성과 교육적 고려 사항이다.

[학생 특성]
- 학생A: 대뇌피질시각장애, 빛을 응시하는 경향이 있음
- 학생B: 황반변성, 황반부에 암점이 있음
- 학생C: 망막색소변성, 터널 시야가 나타남

[학생A의 교육적 고려 사항]
㉠ 단순한 수업 환경 제공하기
㉡ 대상을 제시한 후 시각적으로 바로 반응하게 지도하기
㉢ 교육 자료를 주기적으로 움직여 학생의 시각적 주의력 높이기

[학생B의 교육적 고려 사항]
㉣ 필기 시 굵고 진한 선이 있는 종이와 검정색 사인펜을 사용하기
㉤ 상대적 크기 확대법을 적용하여 확대 독서기로 학습자료 접근성 높이기`,
    question:
      '(1) 학생A의 교육적 고려 사항 ㉠~㉢ 중 틀린 내용을 2가지 찾아 기호를 쓰고, 바르게 고쳐 서술하시오. (2) 학생C에게 독서를 할 때 줄을 따라 읽도록 사용하는 보조도구의 명칭을 쓰시오.',
    answer: `(1) 틀린 내용 2가지
- ㉡: 대뇌피질시각장애 학생은 시각적 반응에 잠복기(latency)가 있으므로, "대상을 제시한 후 시각적으로 바로 반응하게 지도하기"가 아니라 "대상을 제시한 후 충분한 시간을 두고 시각적으로 반응할 수 있도록 기다려 주기"로 고쳐야 한다.
- ㉤: 황반변성은 중심부 시야가 손상된 것이므로 확대만으로는 한계가 있다. "상대적 크기 확대법"이 아니라 "상대적 거리 확대법"을 적용하거나, 확대 독서기 사용 시 편심 주시(eccentric viewing) 방법과 함께 지도해야 한다.

(2) 타이포스코프(typoscope)
- 타이포스코프는 검은색 판에 가로로 긴 직사각형 구멍이 뚫린 독서 보조도구로, 터널 시야를 가진 학생이 줄을 따라 읽는 것을 돕고 빛 번짐을 줄여줍니다.`,
    explanation:
      '대뇌피질시각장애(CVI) 학생의 주요 특성 중 하나는 시각적 반응 잠복기(visual latency)로, 대상을 본 후 반응하기까지 시간이 필요합니다. 즉각적 반응을 요구하면 안 됩니다. 이 문항은 KICE 2025 전공A-7의 구조를 참고하여 구성하였습니다.',
    difficulty: 3,
    source: 'KICE 2025 전공A-7',
    tags: { disability: '시각장애' },
  },
  // === Chapter: orientation-mobility (q11~q17) ===
  {
    id: 'vis-q11',
    subject: 'visual-impairment',
    chapter: 'orientation-mobility',
    type: 'multiple',
    question:
      '흰지팡이 보행법 중 터치법(touch technique)에 대한 설명으로 옳은 것은?',
    options: [
      '지팡이를 바닥에 대지 않고 대각선 방향으로 잡아 몸 앞을 보호한다',
      '지팡이 끝을 좌우로 호를 그리며 바닥을 두드려 전방의 장애물과 지면 변화를 탐지한다',
      '지팡이를 바닥에 밀착시켜 연속적으로 미끄러뜨리며 이동한다',
      '지팡이를 수직으로 세워 천장 높이의 장애물을 탐지한다',
    ],
    answer: 1,
    explanation:
      '터치법(touch technique, 2점 터치법)은 흰지팡이의 가장 기본적인 보행법으로, 지팡이 끝(팁)을 좌우로 호를 그리며 바닥을 가볍게 두드리는 방식입니다. 한 발을 내딛을 때 반대쪽 바닥을 터치하여 전방의 장애물, 계단, 경사로 등을 탐지합니다. 슬라이드법은 지팡이를 바닥에 밀착시켜 미끄러뜨리는 방법이며, 대각선법은 초보자나 실내에서 사용합니다.',
    difficulty: 1,
    tags: { disability: '시각장애' },
  },
  {
    id: 'vis-q12',
    subject: 'visual-impairment',
    chapter: 'orientation-mobility',
    type: 'fill_in',
    question:
      '방향정위(orientation)에서 활용하는 감각 단서 중, 일정한 위치에서 지속적으로 들리는 소리(예: 분수대, 에어컨 실외기)를 ( )(이)라 하고, 환경 내 물체에 부딪혀 되돌아오는 소리를 감지하여 장애물의 존재와 크기를 파악하는 것을 ( )(이)라 한다.',
    answer: '청각 랜드마크(sound landmark) / 반향정위(echolocation)',
    explanation:
      '방향정위에서 청각 단서는 매우 중요합니다. 청각 랜드마크는 항상 같은 위치에서 들리는 소리로 현재 위치를 파악하는 데 활용됩니다. 반향정위(echolocation)는 자신의 발소리, 지팡이 소리 등이 물체에 반사되어 돌아오는 소리를 통해 장애물의 유무, 크기, 거리를 감지하는 능력입니다.',
    difficulty: 2,
    tags: { disability: '시각장애' },
  },
  {
    id: 'vis-q13',
    subject: 'visual-impairment',
    chapter: 'orientation-mobility',
    type: 'ox',
    question:
      '흰지팡이 대각선법(diagonal technique)은 주로 익숙한 실내 환경에서 사용하며, 지팡이를 몸 앞 대각선 방향으로 잡아 하체를 보호하는 기법이다.',
    answer: 'O',
    explanation:
      '대각선법(diagonal technique)은 지팡이를 몸 앞 대각선 방향으로 잡아 하체와 발 앞을 보호하는 기법입니다. 주로 익숙한 실내 환경이나 좁은 통로에서 사용합니다. 실외나 낯선 환경에서는 터치법이나 슬라이드법이 더 적합합니다. 대각선법은 탐지 범위가 제한적이므로 상부보호법과 함께 사용하는 것이 권장됩니다.',
    difficulty: 1,
    tags: { disability: '시각장애' },
  },
  {
    id: 'vis-q14',
    subject: 'visual-impairment',
    chapter: 'orientation-mobility',
    type: 'multiple',
    question:
      '안내보행 시 좁은 통로를 지나갈 때의 올바른 방법은?',
    options: [
      '안내자가 시각장애인 앞에서 양손을 잡고 후진한다',
      '안내자가 팔을 등 뒤로 뻗으면 시각장애인이 안내자 바로 뒤로 이동하여 일렬로 걷는다',
      '시각장애인이 안내자의 어깨를 잡고 나란히 걷는다',
      '안내자가 시각장애인의 손을 놓고 먼저 통과한 후 다시 잡는다',
    ],
    answer: 1,
    explanation:
      '안내보행에서 좁은 통로를 지날 때 안내자는 잡힌 팔을 등 뒤로 뻗어 시각장애인에게 신호를 보냅니다. 시각장애인은 이 신호를 받고 안내자의 바로 뒤로 이동하여 일렬로 걸으며 통로를 통과합니다. 이 자세를 "좁은 통로 자세(narrow passage position)"라고 합니다.',
    difficulty: 1,
    tags: { disability: '시각장애' },
  },
  {
    id: 'vis-q15',
    subject: 'visual-impairment',
    chapter: 'orientation-mobility',
    type: 'fill_in',
    question:
      '흰지팡이 슬라이드법(slide technique)은 지팡이 끝을 바닥에 ( )시킨 채 좌우로 미끄러뜨리며 이동하는 방법으로, 터치법에 비해 ( )의 변화(예: 바닥 재질, 작은 단차)를 더 세밀하게 탐지할 수 있다.',
    answer: '밀착(접촉) / 지면(바닥 표면)',
    explanation:
      '슬라이드법은 지팡이 끝을 바닥에 밀착시킨 채 연속적으로 좌우로 미끄러뜨리는 방법입니다. 바닥과 지속적으로 접촉하므로 지면의 재질 변화, 작은 단차, 균열 등을 터치법보다 세밀하게 감지할 수 있습니다. 다만 지팡이 팁의 마모가 빠르고, 거친 바닥에서는 사용이 어려울 수 있습니다.',
    difficulty: 2,
    tags: { disability: '시각장애' },
  },
  {
    id: 'vis-q16',
    subject: 'visual-impairment',
    chapter: 'orientation-mobility',
    type: 'multiple',
    question:
      '방향정위 훈련에서 "단서(clue)"와 "랜드마크(landmark)"의 차이에 대한 설명으로 옳은 것은?',
    options: [
      '단서는 고정적이고 랜드마크는 유동적이다',
      '단서와 랜드마크는 동일한 개념이다',
      '랜드마크는 고정된 위치의 사물이고, 단서는 환경 내의 감각 정보(소리, 냄새 등)로 위치 파악에 도움을 준다',
      '랜드마크는 촉각적 정보만을, 단서는 청각적 정보만을 포함한다',
    ],
    answer: 2,
    explanation:
      '랜드마크(landmark)는 환경 내에서 항상 같은 위치에 고정되어 있는 사물(엘리베이터, 계단, 음수대 등)로 자신의 위치를 확인하는 기준점입니다. 단서(clue)는 환경 내의 다양한 감각 정보(음식 냄새, 바닥 재질 변화, 바람 방향 등)로 방향과 위치를 파악하는 데 도움이 됩니다. 단서는 랜드마크보다 유동적일 수 있습니다.',
    difficulty: 2,
    tags: { disability: '시각장애' },
  },
  {
    id: 'vis-q17',
    subject: 'visual-impairment',
    chapter: 'orientation-mobility',
    type: 'ox',
    question:
      '방향정위에서 촉각 단서로는 바닥 재질의 변화(카펫→타일), 바람의 방향, 햇빛의 온기 등을 활용할 수 있으며, 후각 단서로는 급식실 냄새, 화장실 세제 냄새 등을 활용할 수 있다.',
    answer: 'O',
    explanation:
      '방향정위에서는 시각 외의 다양한 감각을 활용합니다. 촉각 단서로는 바닥 재질 변화, 바람의 방향과 세기, 햇빛의 온기 등이 있고, 후각 단서로는 급식실, 화장실, 실험실 등의 특유한 냄새를 활용할 수 있습니다. 이러한 다감각 단서를 체계적으로 활용하는 것이 독립보행의 핵심입니다.',
    difficulty: 1,
    tags: { disability: '시각장애' },
  },
  // === Chapter: braille (q18~q23) ===
  {
    id: 'vis-q18',
    subject: 'visual-impairment',
    chapter: 'braille',
    type: 'multiple',
    question:
      '점자의 6점 체계에서 점의 번호 배열로 올바른 것은?',
    options: [
      '왼쪽 위부터 시계방향으로 1-2-3-4-5-6',
      '왼쪽 열 위에서 아래로 1-2-3, 오른쪽 열 위에서 아래로 4-5-6',
      '오른쪽 열 위에서 아래로 1-2-3, 왼쪽 열 위에서 아래로 4-5-6',
      '위쪽 행 왼쪽에서 오른쪽으로 1-2, 중간 행 3-4, 아래 행 5-6',
    ],
    answer: 1,
    explanation:
      '점자의 6점 체계는 세로 3행 × 가로 2열로 구성됩니다. 왼쪽 열의 위에서 아래로 1점-2점-3점, 오른쪽 열의 위에서 아래로 4점-5점-6점 순으로 번호가 매겨집니다. 이 번호 체계는 루이 브라유(Louis Braille)가 1829년에 제정한 것으로, 전 세계적으로 동일하게 사용됩니다.',
    difficulty: 1,
    tags: { disability: '시각장애' },
  },
  {
    id: 'vis-q19',
    subject: 'visual-impairment',
    chapter: 'braille',
    type: 'fill_in',
    question:
      '한글 점자에서 초성 "ㄱ"은 ( )점, 초성 "ㄴ"은 ( )점으로 표기한다. 한글 점자는 초성, 중성, 종성의 조합으로 한 글자를 나타내며, 자음과 모음이 분리되어 표기된다.',
    answer: '4 / 1-4',
    explanation:
      '한글 점자(훈맹정음)에서 주요 초성: ㄱ(4점), ㄴ(1-4점), ㄷ(2-4점), ㄹ(5점), ㅁ(1-5점), ㅂ(4-5점), ㅅ(8점→6점 체계에서 별도 규칙), ㅇ(1-2-4-5점), ㅈ(4-6점), ㅊ(5-6점), ㅋ(1-2-4점), ㅌ(1-2-5점), ㅍ(1-4-5점), ㅎ(2-4-5점). 초성과 종성의 점자 표기가 다른 자음도 있으므로 주의가 필요합니다.',
    difficulty: 2,
    tags: { disability: '시각장애' },
  },
  {
    id: 'vis-q20',
    subject: 'visual-impairment',
    chapter: 'braille',
    type: 'multiple',
    question:
      '점자 읽기·쓰기 도구에 대한 설명으로 옳지 않은 것은?',
    options: [
      '점자판(slate)과 점필(stylus)을 사용하여 점자를 쓸 때는 오른쪽에서 왼쪽으로 쓴다',
      '점자 타자기(braille writer)는 6개의 키를 동시에 눌러 점자를 입력한다',
      '점자판으로 쓴 점자는 종이를 뒤집으면 왼쪽에서 오른쪽으로 읽을 수 있다',
      '점자 타자기로 쓸 때도 점자판과 마찬가지로 오른쪽에서 왼쪽으로 입력한다',
    ],
    answer: 3,
    explanation:
      '점자판(slate)과 점필(stylus)을 사용할 때는 종이 뒷면에서 점을 찍으므로 오른쪽에서 왼쪽으로 씁니다(뒤집으면 왼→오로 읽힘). 반면, 점자 타자기(perkins brailler 등)는 종이 앞면에서 직접 점을 돌출시키므로 왼쪽에서 오른쪽으로 일반적인 방향으로 입력합니다.',
    difficulty: 2,
    tags: { disability: '시각장애' },
  },
  {
    id: 'vis-q21',
    subject: 'visual-impairment',
    chapter: 'braille',
    type: 'fill_in',
    question:
      '한글 점자에서 약자(contracted braille)란 자주 사용되는 글자나 단어를 ( )으로 줄여 표기하는 방법이다. 약자 사용의 목적은 점자 읽기 속도를 높이고 ( )을/를 줄이기 위함이다.',
    answer: '간략한 점형(축약형) / 점자 표기 공간(부피)',
    explanation:
      '한글 점자 약자는 자주 사용되는 글자(가, 나, 다 등)나 단어(그래서, 그러나, 그리고 등)를 줄여서 표기합니다. 이는 점자의 특성상 묵자보다 부피가 크기 때문에 공간을 절약하고, 읽기 속도를 높이기 위한 것입니다. 점자 학습 초기에는 정자(full braille)를 먼저 배우고, 숙달된 후 약자를 학습합니다.',
    difficulty: 2,
    tags: { disability: '시각장애' },
  },
  {
    id: 'vis-q22',
    subject: 'visual-impairment',
    chapter: 'braille',
    type: 'ox',
    question:
      '한글 점자에서 수표(⠼, 3-4-5-6점)를 한 번 붙이면 그 뒤에 오는 모든 글자가 숫자로 인식되며, 숫자 뒤에 한글이나 문장부호가 오면 별도의 구분 없이 자동으로 한글로 전환된다.',
    answer: 'X',
    explanation:
      '수표(⠼)를 붙이면 그 뒤의 점자가 숫자로 인식되지만, 숫자 표기가 끝나고 한글로 전환할 때는 상황에 따라 글자표나 빈 칸 등의 구분이 필요합니다. 한글 점자 규정에서는 수표 뒤의 숫자와 한글을 명확히 구분하기 위한 규칙을 정하고 있으며, 자동 전환되는 것이 아닙니다.',
    difficulty: 3,
    tags: { disability: '시각장애' },
  },
  {
    id: 'vis-q23',
    subject: 'visual-impairment',
    chapter: 'braille',
    type: 'multiple',
    question:
      '영어 점자(UEB)에서 알파벳 "a"부터 "j"까지의 점자 표기에 대한 설명으로 옳은 것은?',
    options: [
      'a~j는 1-2-4-5점(상단 4개 점)만으로 표기된다',
      'a~j는 1-2-3점(왼쪽 열 3개 점)만으로 표기된다',
      'a~j는 숫자 1~10에 수표를 붙인 것과 동일한 점형이다',
      'a~j는 한글 초성 ㄱ~ㅈ과 동일한 점형을 사용한다',
    ],
    answer: 2,
    explanation:
      '영어 점자에서 알파벳 a~j는 1-2-4-5점(상단 4개 점)의 조합으로 표기됩니다. 이 점형에 수표(⠼)를 붙이면 숫자 1~0(a=1, b=2, ..., j=0)이 됩니다. 즉, 알파벳 a~j의 점형이 숫자 표기의 기본이 되며, 수표의 유무로 문자와 숫자를 구분합니다. k~t는 a~j에 3점을 추가한 것입니다.',
    difficulty: 3,
    tags: { disability: '시각장애' },
  },
  // === Chapter: visual-function (q24~q30) ===
  {
    id: 'vis-q24',
    subject: 'visual-impairment',
    chapter: 'visual-function',
    type: 'multiple',
    question:
      '스넬렌 시력표(Snellen chart)에 대한 설명으로 옳은 것은?',
    options: [
      '스넬렌 시력표는 근거리 시력만을 측정할 수 있다',
      '검사 거리는 일반적으로 6m(20피트)이며, 시표의 크기에 따라 시력을 측정한다',
      '스넬렌 시력은 분수의 분모가 검사 거리, 분자가 해당 시표를 정상인이 읽을 수 있는 거리이다',
      '스넬렌 시력 20/100은 소수시력 1.0에 해당한다',
    ],
    answer: 1,
    explanation:
      '스넬렌 시력표는 원거리 시력을 측정하는 대표적인 도구로, 검사 거리 6m(20피트)에서 시행합니다. 스넬렌 시력은 분수로 표기하며, 분자가 검사 거리(20), 분모가 정상인이 읽을 수 있는 거리입니다. 예: 20/200은 정상인이 200피트에서 볼 수 있는 것을 20피트에서만 볼 수 있다는 의미이며, 소수시력 0.1에 해당합니다.',
    difficulty: 1,
    tags: { disability: '시각장애' },
  },
  {
    id: 'vis-q25',
    subject: 'visual-impairment',
    chapter: 'visual-function',
    type: 'fill_in',
    question:
      '법적 맹(legal blindness)의 기준은 최대 교정시력이 ( ) 이하이거나, 시야각이 ( )도 이내인 경우이다.',
    answer: '0.04(또는 20/500) / 20',
    explanation:
      '한국의 장애인복지법 시행규칙에 따른 시각장애 기준에서 법적 맹은 좋은 눈의 최대 교정시력이 0.04 이하인 경우입니다. 미국 기준으로는 20/200 이하 또는 시야각 20도 이내입니다. 시야각이 좁은 경우(터널 시야) 중심시력이 양호하더라도 법적 맹에 해당할 수 있습니다.',
    difficulty: 2,
    tags: { disability: '시각장애' },
  },
  {
    id: 'vis-q26',
    subject: 'visual-impairment',
    chapter: 'visual-function',
    type: 'ox',
    question:
      '기능적 시력평가(FVA: Functional Vision Assessment)는 임상적 시력검사와 달리 학생이 실제 학습 환경에서 잔존 시력을 어떻게 활용하는지를 평가하는 것이다.',
    answer: 'O',
    explanation:
      '기능적 시력평가(FVA)는 임상적 시력검사(스넬렌 시력, 시야 측정 등)와는 달리 학생이 교실, 복도, 운동장 등 실제 환경에서 잔존 시력을 어떻게 활용하는지를 관찰·평가합니다. 조명 조건, 대비, 글자 크기, 색상 등 다양한 환경 변인에 따른 시각 활용 능력을 파악하여 교육적 지원 계획을 수립하는 데 활용됩니다.',
    difficulty: 2,
    tags: { disability: '시각장애' },
  },
  {
    id: 'vis-q27',
    subject: 'visual-impairment',
    chapter: 'visual-function',
    type: 'multiple',
    question:
      '저시력 학생을 위한 보조기기에 대한 설명으로 옳은 것은?',
    options: [
      'CCTV 확대 독서기는 원거리 시력 보조에만 사용된다',
      '광학적 보조기기에는 확대경, 망원경, CCTV가 모두 포함된다',
      '손잡이 확대경은 광학적 보조기기이고, CCTV 확대 독서기는 비광학적 보조기기이다',
      '독서확대기(CCTV)는 확대 배율을 조절할 수 있으며, 색상 반전(흑백 반전) 기능을 제공한다',
    ],
    answer: 3,
    explanation:
      'CCTV 확대 독서기(독서확대기)는 카메라로 촬영한 자료를 모니터에 확대하여 보여주는 전자광학적 보조기기입니다. 확대 배율 조절, 색상 반전(흑백, 노란색-검정 등), 밝기 조절 등의 기능을 제공합니다. 광학적 보조기기에는 렌즈를 사용하는 확대경, 망원경 등이 있고, CCTV는 전자광학적 보조기기로 분류합니다.',
    difficulty: 2,
    tags: { disability: '시각장애' },
  },
  {
    id: 'vis-q28',
    subject: 'visual-impairment',
    chapter: 'visual-function',
    type: 'fill_in',
    question:
      '저시력 학생에게 적용하는 확대법 중 ( )은/는 자료를 눈에 더 가까이 가져가거나 학생이 자료에 가까이 다가가는 방법이고, ( )은/는 실제 자료의 크기를 키우는 방법(예: 큰 글씨 교재)이다.',
    answer: '상대적 거리 확대법 / 상대적 크기 확대법',
    explanation:
      '확대법의 유형: ① 상대적 거리 확대법(relative distance magnification) - 자료와 눈 사이의 거리를 줄여 망막상을 크게 함, ② 상대적 크기 확대법(relative size magnification) - 자료 자체의 크기를 키움(확대 복사 등), ③ 각도 확대법(angular magnification) - 렌즈를 사용하여 망막상을 확대(확대경 등), ④ 전자적 확대법 - CCTV 등 전자기기 활용.',
    difficulty: 2,
    tags: { disability: '시각장애' },
  },
  {
    id: 'vis-q29',
    subject: 'visual-impairment',
    chapter: 'visual-function',
    type: 'multiple',
    question:
      '시각장애 학생의 교육 매체(읽기 매체) 결정 시 고려해야 할 사항으로 가장 적절하지 않은 것은?',
    options: [
      '임상적 시력검사 결과(시력, 시야 등)',
      '기능적 시력평가 결과(실제 환경에서의 시력 활용)',
      '학생의 지능지수(IQ) 점수',
      '진행성 안질환 여부 및 예후',
    ],
    answer: 2,
    explanation:
      '교육 매체(점자, 확대 문자, 일반 문자 등) 결정 시 고려 사항: ① 임상적 시력 검사(시력, 시야, 색각 등), ② 기능적 시력평가(FVA), ③ 학습 매체 평가(LMA), ④ 진행성 안질환 여부 및 예후, ⑤ 촉각 및 청각 능력, ⑥ 학생·보호자의 선호. 지능지수는 교육 매체 결정의 직접적 기준이 아닙니다.',
    difficulty: 2,
    tags: { disability: '시각장애' },
  },
  {
    id: 'vis-q30',
    subject: 'visual-impairment',
    chapter: 'visual-function',
    type: 'descriptive',
    caseContext: `다음은 ○○ 초등학교에 재학 중인 저시력 학생 C의 정보이다.

[학생 C의 안과 진단 정보]
- 진단명: 백색증(albinism)
- 최대 교정시력: 우안 0.1, 좌안 0.08
- 눈부심(photophobia)이 심함
- 안진(nystagmus)이 있음

[현재 교실 환경]
- 창가 자리에 배치되어 있음
- 일반 크기의 교과서를 사용 중
- 칠판 글씨를 읽기 어려워함`,
    question:
      '(1) 학생 C의 시각적 특성을 고려하여 교실 환경을 개선하는 방안을 2가지 제시하시오. (2) 학생 C에게 적합한 저시력 보조기기를 2가지 제시하고, 각각의 용도를 설명하시오. (3) 학생 C에게 적용할 수 있는 확대법의 유형을 2가지 쓰고 각각 설명하시오.',
    answer: `(1) 교실 환경 개선 방안
① 좌석 재배치: 창가 자리에서 벗어나 직사광선이 들어오지 않는 곳으로 이동시킨다. 백색증 학생은 눈부심이 심하므로 빛이 직접 들어오는 창가 자리는 부적합하다.
② 조명 조절: 교실 조명이 눈에 직접 들어오지 않도록 조절하고, 필요시 블라인드나 커튼으로 외부 빛을 차단한다. 학생 개인용 조명(독서등)을 제공하여 자료에 적절한 조도를 유지할 수 있게 한다.

(2) 저시력 보조기기
① CCTV 확대 독서기(전자광학적 보조기기): 근거리 읽기용으로, 교과서나 학습 자료를 카메라로 촬영하여 모니터에 확대하여 보여준다. 배율 조절과 색상 반전(흰 바탕 검은 글씨 → 검은 바탕 흰 글씨) 기능으로 눈부심을 줄일 수 있다.
② 단안 망원경(monocular telescope): 원거리 보기용으로, 칠판이나 스크린의 내용을 확대하여 볼 수 있다. 한쪽 눈에 대고 사용하며, 휴대가 간편하다.

(3) 확대법 유형
① 상대적 거리 확대법: 학생이 자료에 더 가까이 다가가거나 자료를 눈 가까이 가져와 망막상을 크게 하는 방법이다. 학생 C를 칠판 가까이 앉히거나 학습 자료를 가까이에서 보게 하는 것이 이에 해당한다.
② 상대적 크기 확대법: 자료 자체의 크기를 키우는 방법으로, 확대 복사한 교재나 큰 글씨 교과서를 제공하는 것이 이에 해당한다.`,
    explanation:
      '백색증 학생은 멜라닌 색소 부족으로 눈부심(photophobia), 안진(nystagmus), 저시력 등의 시각적 특성을 보입니다. 교육 지원 시 눈부심 관리가 가장 중요하며, 적절한 보조기기와 환경 조정을 통해 잔존 시력을 최대한 활용할 수 있도록 지원해야 합니다.',
    difficulty: 3,
    tags: { disability: '시각장애' },
  },
];
