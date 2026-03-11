import type { QuizQuestion } from '@/types/quiz';

export const introductionQuizzes: QuizQuestion[] = [
  {
    id: 'intro-q1',
    subject: 'introduction',
    chapter: 'understanding',
    type: 'multiple',
    question: '특수교육의 정의에서 "특수하게 고안된 교수(specially designed instruction)"가 의미하는 것은?',
    options: [
      '일반교육과 동일한 교육과정으로 지도하는 것',
      '학생의 고유한 요구에 맞게 내용, 방법, 전달 방식을 조정하는 것',
      '특수학교에서만 제공되는 교육',
      '장애학생만을 위한 별도의 교육과정',
    ],
    answer: 1,
    explanation: '특수하게 고안된 교수란 장애학생의 고유한 요구를 충족하기 위해 교수의 내용, 방법론, 전달 방식을 개별적으로 조정하는 것을 의미합니다.',
    difficulty: 1,
  },
  {
    id: 'intro-q2',
    subject: 'introduction',
    chapter: 'understanding',
    type: 'ox',
    question: '정상화(normalization)의 원리는 장애인을 "정상인"으로 만드는 것을 의미한다.',
    answer: 'X',
    explanation: '정상화의 원리는 장애인을 정상인으로 만드는 것이 아니라, 장애인도 비장애인과 동일한 생활 조건과 환경을 누릴 수 있도록 하는 것을 의미합니다.',
    difficulty: 1,
  },
  {
    id: 'intro-q3',
    subject: 'introduction',
    chapter: 'disability-types',
    type: 'multiple',
    question: '지적장애의 진단 기준으로 올바른 것은?',
    options: [
      'IQ 70 이하만 해당',
      '적응행동 결함만 해당',
      '지적 기능과 적응행동 모두에서 유의미한 제한, 18세 이전 발현',
      '학업 성취도가 또래보다 2년 이상 뒤처지는 경우',
    ],
    answer: 2,
    explanation: 'AAIDD(미국지적·발달장애협회)의 정의에 따르면, 지적장애는 지적 기능과 개념적·사회적·실제적 적응행동 모두에서 유의미한 제한이 있으며, 18세 이전에 발현되어야 합니다.',
    difficulty: 2,
  },
  {
    id: 'intro-q4',
    subject: 'introduction',
    chapter: 'understanding',
    type: 'fill_in',
    question: '장애학생이 가능한 한 비장애 또래와 함께 교육받을 수 있도록 하는 원리를 ( )이라 한다.',
    answer: '최소제한환경',
    explanation: '최소제한환경(LRE: Least Restrictive Environment)은 장애학생이 가능한 한 비장애 또래와 함께 교육받아야 한다는 원리입니다.',
    difficulty: 1,
  },
  {
    id: 'intro-q5',
    subject: 'introduction',
    chapter: 'history',
    type: 'multiple',
    question: '다음 중 특수교육의 발전 단계를 올바르게 나열한 것은?',
    options: [
      '통합 → 분리 → 유기/학대',
      '유기/학대 → 시설보호 → 분리교육 → 통합교육',
      '시설보호 → 유기/학대 → 통합교육',
      '분리교육 → 시설보호 → 유기/학대 → 통합교육',
    ],
    answer: 1,
    explanation: '특수교육은 유기/학대 → 시설보호 → 분리교육 → 통합교육의 순서로 발전해 왔습니다.',
    difficulty: 1,
  },
  {
    id: 'intro-q6',
    subject: 'introduction',
    chapter: 'disability-types',
    type: 'multiple',
    question:
      '다운증후군(Down syndrome)의 가장 흔한 원인은?',
    options: [
      '성염색체 이상(X 염색체 결실)',
      '21번 염색체의 삼염색체성(trisomy 21)',
      '15번 염색체 장완의 결실',
      '5번 염색체 단완의 결실',
    ],
    answer: 1,
    explanation:
      '다운증후군의 약 95%는 21번 염색체가 3개인 삼염색체성(trisomy 21)에 의해 발생합니다. 그 외 전좌형(약 4%)과 모자이크형(약 1%)이 있습니다. 다운증후군은 지적장애의 대표적인 염색체 이상 원인이며, KICE 시험에서 증후군 특성 비교 문항으로 자주 출제됩니다.',
    difficulty: 1,
    source: 'KICE 기출 빈출 주제',
  },
  {
    id: 'intro-q7',
    subject: 'introduction',
    chapter: 'disability-types',
    type: 'fill_in',
    question:
      '프래더-윌리 증후군(Prader-Willi syndrome)은 ( )번 염색체 장완의 결실로 발생하며, 영아기의 근육 저긴장(hypotonia)과 이후 과식 행동 및 비만이 주요 특성이다.',
    answer: '15',
    explanation:
      '프래더-윌리 증후군은 15번 염색체 장완(15q11-q13)에서 부계 유전자의 결실 또는 기능 상실로 발생합니다. 영아기에는 근육 저긴장과 수유 곤란이 나타나고, 유아기 이후에는 과식 행동(hyperphagia), 비만, 지적장애, 행동 문제(강박, 분노 발작)가 나타납니다. 같은 부위의 모계 유전자 결실은 엔젤만 증후군을 유발합니다.',
    difficulty: 2,
    source: 'KICE 2024 전공A 동형',
  },
  {
    id: 'intro-q8',
    subject: 'introduction',
    chapter: 'disability-types',
    type: 'ox',
    question:
      '엔젤만 증후군(Angelman syndrome)은 프래더-윌리 증후군과 동일한 15번 염색체 부위의 이상이지만, 모계 유전자의 결실로 발생하며, 심한 지적장애와 빈번한 웃음, 손 펄럭임(hand flapping)이 특징이다.',
    answer: 'O',
    explanation:
      '엔젤만 증후군은 15번 염색체 장완(15q11-q13)의 모계 유전자 결실 또는 UBE3A 유전자 이상으로 발생합니다. 심한 지적장애, 언어 발달 지연, 빈번한 웃음과 미소, 손 펄럭임, 보행 실조, 발작 등이 주요 특성입니다. 프래더-윌리 증후군과 같은 염색체 부위이지만 부모 기원(각인, imprinting)이 다릅니다.',
    difficulty: 2,
    source: 'KICE 2024 전공A 동형',
  },
  {
    id: 'intro-q9',
    subject: 'introduction',
    chapter: 'disability-types',
    type: 'multiple',
    question:
      '뇌성마비(cerebral palsy)의 유형 중 불수의적이고 불규칙적인 움직임이 특징이며, 사지의 긴장도가 변동하는 유형은?',
    options: [
      '경직형(spastic type)',
      '무정위운동형(dyskinetic/athetoid type)',
      '실조형(ataxic type)',
      '혼합형(mixed type)',
    ],
    answer: 1,
    explanation:
      '무정위운동형(불수의운동형, dyskinetic/athetoid type)은 불수의적이고 비목적적인 움직임이 특징이며, 근긴장도가 지속적으로 변동합니다. 경직형은 근긴장도 증가와 과잉 반사가 특징이고, 실조형은 균형과 협응 장애가 특징입니다. 뇌성마비 유형 분류는 KICE 시험에서 매년 출제되는 핵심 주제입니다.',
    difficulty: 2,
    source: 'KICE 2025 전공A 동형',
  },
  {
    id: 'intro-q10',
    subject: 'introduction',
    chapter: 'disability-types',
    type: 'fill_in',
    question:
      '자폐성장애 학생이 다른 사람의 말을 그대로 따라 말하는 현상을 ( )(이)라 하며, 즉시 따라 말하는 것과 시간이 지난 후 따라 말하는 것으로 구분된다.',
    answer: '반향어(echolalia)',
    explanation:
      '반향어(echolalia)는 자폐성장애의 대표적 의사소통 특성으로, 즉각 반향어(immediate echolalia)와 지연 반향어(delayed echolalia)로 구분됩니다. 즉각 반향어는 상대방의 말을 즉시 되풀이하는 것이고, 지연 반향어는 이전에 들은 말을 시간이 지난 후 반복하는 것입니다. 지연 반향어는 의사소통 의도를 포함하는 경우가 있어 기능적 분석이 필요합니다.',
    difficulty: 1,
    source: 'KICE 기출 빈출 주제',
  },
  {
    id: 'intro-q11',
    subject: 'introduction',
    chapter: 'disability-types',
    type: 'multiple',
    question:
      '청각장애 학생의 청력 평가에서 순음청력검사(pure tone audiometry) 결과를 6분법으로 평균청력역치(PTA)를 계산할 때 사용하는 주파수(Hz)의 조합은?',
    options: [
      '250, 500, 1000, 2000 Hz',
      '500, 1000, 2000, 4000 Hz (가중치 적용)',
      '500, 1000, 2000 Hz (가중치 적용: a+2b+2c+d / 6)',
      '250, 500, 1000, 2000, 4000, 8000 Hz',
    ],
    answer: 2,
    explanation:
      '6분법은 500Hz(a), 1000Hz(b), 2000Hz(c)의 세 주파수를 사용하며, 계산식은 (a + 2b + 2c + d) / 6입니다. 여기서 d는 4000Hz입니다. 4분법은 (a + b + c + d) / 4로 계산합니다. 청력도 해석과 PTA 계산법은 KICE 시험에서 매년 출제되는 핵심 주제입니다.',
    difficulty: 3,
    source: 'KICE 2023 전공A 동형',
  },
  {
    id: 'intro-q12',
    subject: 'introduction',
    chapter: 'disability-types',
    type: 'multiple',
    question:
      '시각장애 학생의 점자 학습에서 한글 점자의 기본 구조로 옳은 것은?',
    options: [
      '가로 2점, 세로 4점의 8점 체계',
      '가로 2점, 세로 3점의 6점 체계',
      '가로 3점, 세로 2점의 6점 체계',
      '가로 3점, 세로 3점의 9점 체계',
    ],
    answer: 1,
    explanation:
      '한글 점자는 루이 브라이유(Louis Braille)가 고안한 6점 체계를 기반으로 합니다. 가로 2점, 세로 3점으로 구성되며, 왼쪽 위부터 아래로 1-2-3점, 오른쪽 위부터 아래로 4-5-6점 번호가 부여됩니다. 점자 규정과 약자, 약어 체계는 KICE 시험에서 거의 매년 출제됩니다.',
    difficulty: 1,
    source: 'KICE 기출 빈출 주제',
  },
  {
    id: 'intro-q13',
    subject: 'introduction',
    chapter: 'disability-types',
    type: 'ox',
    question:
      'AAC(보완대체의사소통)에서 "보완(augmentative)"은 기존 의사소통 방법을 보충하는 것이고, "대체(alternative)"는 구어를 전혀 사용할 수 없는 경우 다른 방법으로 완전히 대신하는 것을 의미한다.',
    answer: 'O',
    explanation:
      'AAC(Augmentative and Alternative Communication)는 구어(말)를 통한 의사소통에 어려움이 있는 사람을 위한 의사소통 체계입니다. "보완"은 기존의 제한적인 구어를 보충하여 의사소통 효율을 높이는 것이고, "대체"는 구어 산출이 불가능한 경우 그림 상징, 문자판, 전자기기 등으로 대신하는 것입니다. AAC 유형(도구/비도구, 하이테크/로우테크)과 참여모델은 KICE 시험의 빈출 주제입니다.',
    difficulty: 2,
    source: 'KICE 2024 전공B 동형',
  },
  {
    id: 'intro-q14',
    subject: 'introduction',
    chapter: 'disability-types',
    type: 'fill_in',
    question:
      '시각장애 학생의 보행훈련에서 시각장애인이 안내인의 팔꿈치 바로 위를 잡고 반보 뒤에서 따라 걷는 기본적인 보행 방법을 ( )(이)라 한다.',
    answer: '안내보행(sighted guide/human guide)',
    explanation:
      '안내보행(sighted guide technique)은 시각장애 보행훈련의 가장 기본적인 방법으로, 시각장애인이 안내인의 팔꿈치 바로 위(상완)를 엄지와 나머지 손가락으로 감싸 잡고 반보 뒤에서 따라 걷습니다. 좁은 통로에서는 안내인이 팔을 등 뒤로 이동시키고 시각장애인이 일렬로 따라 걷습니다. 보행훈련 관련 용어(안내보행, 방향정위, 상부방어, 하부방어, 지팡이 기법)는 매년 출제됩니다.',
    difficulty: 2,
    source: 'KICE 2026 전공A 동형',
  },
  {
    id: 'intro-q15',
    subject: 'introduction',
    chapter: 'disability-types',
    type: 'multiple',
    question:
      '뇌성마비 학생의 대운동기능 분류 체계(GMFCS)에서 레벨 I에 해당하는 학생의 특성으로 옳은 것은?',
    options: [
      '전동 휠체어나 외부 이동 보조기 없이는 이동이 불가능하다',
      '실내외에서 보행이 가능하나 계단 오르기, 달리기, 점프에 제한이 있다',
      '제한 없이 독립적으로 보행하며, 속도와 균형, 협응에서 제한이 있다',
      '수동 휠체어를 스스로 조작하여 이동할 수 있다',
    ],
    answer: 2,
    explanation:
      'GMFCS(Gross Motor Function Classification System)는 뇌성마비 아동의 대운동기능을 5단계로 분류합니다. 레벨 I은 제한 없이 보행 가능하나 속도, 균형, 협응에 미세한 제한이 있는 수준입니다. 레벨 II는 보행 가능하나 제한 있음, 레벨 III는 보행 보조기기 사용, 레벨 IV는 자기 이동에 제한이 있어 이동수단 필요, 레벨 V는 수동 휠체어로도 이동이 어려운 수준입니다.',
    difficulty: 3,
    source: 'KICE 2025 전공B 동형',
  },
];
