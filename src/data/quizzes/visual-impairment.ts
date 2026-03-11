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
];
