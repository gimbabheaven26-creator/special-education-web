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
  // ── understanding 챕터 추가 문항 ──
  {
    id: 'intro-q16',
    subject: 'introduction',
    chapter: 'understanding',
    type: 'multiple',
    question:
      '「장애인 등에 대한 특수교육법」에서 규정하는 특수교육 관련서비스에 해당하지 않는 것은?',
    options: [
      '상담지원, 가족지원, 치료지원',
      '보조인력지원, 보조공학기기지원, 학습보조기기지원',
      '통학지원, 정보접근지원',
      '방과후학교 운영, 학교급식 제공',
    ],
    answer: 3,
    explanation:
      '특수교육법 제28조에 따른 특수교육 관련서비스는 상담지원, 가족지원, 치료지원, 보조인력지원, 보조공학기기지원, 학습보조기기지원, 통학지원, 정보접근지원의 8가지입니다. 방과후학교 운영이나 학교급식은 일반교육의 지원 서비스이지 특수교육법에서 규정하는 관련서비스는 아닙니다.',
    difficulty: 2,
    source: 'KICE 기출 빈출 주제',
  },
  {
    id: 'intro-q17',
    subject: 'introduction',
    chapter: 'understanding',
    type: 'ox',
    question:
      '「장애인 등에 대한 특수교육법」에 따르면, 특수교육대상자에 대한 의무교육은 유치원부터 고등학교까지이며, 만 3세 미만의 장애영아 교육은 무상교육으로 규정된다.',
    answer: 'O',
    explanation:
      '특수교육법 제3조에 따르면, 특수교육대상자에 대한 의무교육은 유치원·초등학교·중학교·고등학교 과정이며(3세~17세), 만 3세 미만의 장애영아 교육은 무상교육입니다. 일반교육의 의무교육(초·중)과 달리 특수교육은 유치원과 고등학교까지 의무교육 범위가 확대된다는 점이 핵심입니다.',
    difficulty: 2,
    source: 'KICE 기출 빈출 주제',
  },
  {
    id: 'intro-q18',
    subject: 'introduction',
    chapter: 'understanding',
    type: 'fill_in',
    question:
      '「장애인 등에 대한 특수교육법」에 따라, 각급학교의 장은 특수교육대상자에 대한 개별화교육계획을 매 학년의 시작일로부터 ( )일 이내에 작성하여야 하며, 이를 위해 ( )을(를) 구성하여야 한다.',
    answer: '30 / 개별화교육지원팀',
    explanation:
      '특수교육법 제22조에 따라, 개별화교육계획(IEP)은 매 학년 시작일부터 30일 이내에 작성해야 합니다. 이를 위해 보호자, 특수교육교원, 일반교육교원, 진로 및 직업교육 담당 교원, 특수교육 관련 서비스 담당 인력 등으로 구성된 개별화교육지원팀을 구성해야 합니다.',
    difficulty: 1,
    source: 'KICE 기출 빈출 주제',
  },
  {
    id: 'intro-q19',
    subject: 'introduction',
    chapter: 'understanding',
    type: 'multiple',
    question:
      '특수교육에서 "무상교육"과 "의무교육"의 차이에 대한 설명으로 옳은 것은?',
    options: [
      '무상교육과 의무교육은 동일한 개념이다',
      '의무교육은 취학 의무를 부과하고, 무상교육은 비용을 면제하는 것으로, 의무교육은 반드시 무상이어야 한다',
      '무상교육은 교육비 면제만을 의미하며, 취학 의무는 부과되지 않는다',
      '의무교육은 국가의 의무이고, 무상교육은 보호자의 의무이다',
    ],
    answer: 2,
    explanation:
      '무상교육은 입학금, 수업료, 교과서대, 학교급식비 등 교육에 드는 비용을 국가 또는 지자체가 부담하는 것이며, 취학 의무가 부과되지 않습니다. 의무교육은 보호자에게 취학 의무를, 국가에게 교육 제공 의무를 부과하며, 반드시 무상으로 제공되어야 합니다. 장애영아(만 3세 미만) 교육은 무상교육이므로 보호자의 취학 의무가 없습니다.',
    difficulty: 2,
    source: 'KICE 기출 빈출 주제',
  },
  {
    id: 'intro-q20',
    subject: 'introduction',
    chapter: 'understanding',
    type: 'fill_in',
    question:
      '특수교육법에서 규정하는 특수교육 관련서비스 8가지를 모두 쓰시오: 상담지원, 가족지원, ( ), 보조인력지원, ( ), 학습보조기기지원, ( ), 정보접근지원',
    answer: '치료지원 / 보조공학기기지원 / 통학지원',
    explanation:
      '특수교육법 제28조에서 규정하는 특수교육 관련서비스 8가지는 (1) 상담지원, (2) 가족지원, (3) 치료지원, (4) 보조인력지원, (5) 보조공학기기지원, (6) 학습보조기기지원, (7) 통학지원, (8) 정보접근지원입니다. 이 중 치료지원은 물리치료, 작업치료 등 의료적 치료가 아닌 교육적 치료를 의미합니다.',
    difficulty: 3,
    source: 'KICE 기출 빈출 주제',
  },
  // ── disability-types 챕터 추가 문항 ──
  {
    id: 'intro-q21',
    subject: 'introduction',
    chapter: 'disability-types',
    type: 'multiple',
    question:
      'DSM-5에서 자폐스펙트럼장애(ASD)의 진단에 필요한 두 가지 핵심 영역은?',
    options: [
      '지적 기능의 제한과 적응행동의 결함',
      '사회적 의사소통 및 상호작용의 결함과 제한적·반복적 행동·관심·활동',
      '주의력 결핍과 과잉행동-충동성',
      '읽기 장애와 수학 장애',
    ],
    answer: 1,
    explanation:
      'DSM-5에서 자폐스펙트럼장애의 진단 기준은 두 가지 핵심 영역으로 구성됩니다: (A) 사회적 의사소통 및 사회적 상호작용의 지속적 결함(사회적-정서적 상호성, 비언어적 의사소통, 관계 발전·유지·이해의 결함 포함), (B) 제한적이고 반복적인 행동, 관심, 활동 패턴. DSM-IV의 3가지 영역(사회적 상호작용, 의사소통, 제한적 행동)에서 2가지로 통합된 것이 핵심 변화입니다.',
    difficulty: 2,
    source: 'KICE 기출 빈출 주제',
  },
  {
    id: 'intro-q22',
    subject: 'introduction',
    chapter: 'disability-types',
    type: 'fill_in',
    question:
      '학습장애 판별 모델 중, 지능과 학업 성취 간 유의미한 차이를 기준으로 학습장애를 판별하는 전통적 모델을 ( ) 모델이라 하고, 과학적으로 검증된 중재에 대한 학생의 반응을 기준으로 판별하는 모델을 ( )이라 한다.',
    answer: '능력-성취 불일치(IQ-성취 불일치) / 중재반응(RTI)',
    explanation:
      '능력-성취 불일치 모델(IQ-achievement discrepancy model)은 지능검사 점수와 학업 성취 점수 간 유의미한 차이가 있을 때 학습장애로 판별합니다. 그러나 "실패를 기다려야 한다(wait to fail)"는 비판으로 인해 중재반응모델(RTI: Response to Intervention)이 대안으로 제시되었습니다. RTI는 3단계(1단계: 보편적 중재, 2단계: 소집단 중재, 3단계: 집중 개별 중재)로 구성되며, 적절한 중재에도 반응하지 않는 학생을 학습장애로 판별합니다.',
    difficulty: 2,
    source: 'KICE 기출 빈출 주제',
  },
  {
    id: 'intro-q23',
    subject: 'introduction',
    chapter: 'disability-types',
    type: 'multiple',
    question:
      'AAIDD(미국지적·발달장애협회)에서 제시하는 적응행동의 3가지 영역으로 옳은 것은?',
    options: [
      '인지적 영역, 정서적 영역, 신체적 영역',
      '개념적 영역, 사회적 영역, 실제적 영역',
      '학업적 영역, 직업적 영역, 생활 영역',
      '언어 영역, 운동 영역, 자조 영역',
    ],
    answer: 1,
    explanation:
      'AAIDD(12판)에서 제시하는 적응행동의 3가지 영역은 (1) 개념적(conceptual) 영역: 언어, 읽기·쓰기, 수 개념, 자기결정 등, (2) 사회적(social) 영역: 대인관계 기술, 책임감, 자존감, 규칙 준수 등, (3) 실제적(practical) 영역: 일상생활 활동(ADL), 직업 기술, 건강 관리, 안전 등입니다. 지적장애 진단 시 지적 기능(IQ)뿐만 아니라 이 세 영역의 적응행동도 함께 평가해야 합니다.',
    difficulty: 1,
    source: 'KICE 기출 빈출 주제',
  },
  {
    id: 'intro-q24',
    subject: 'introduction',
    chapter: 'disability-types',
    type: 'ox',
    question:
      'Bower(1981)가 제시한 정서행동장애의 5가지 특성에는 학습 능력이 있음에도 학습하지 못하는 것, 또래·교사와의 대인관계 어려움, 부적절한 행동이나 감정, 만연한 불행감이나 우울, 신체적 증상이나 공포가 포함된다.',
    answer: 'O',
    explanation:
      'Bower(1981)의 정서행동장애 5가지 특성은 (1) 지적·감각적·건강 요인으로 설명되지 않는 학습 불능, (2) 또래·교사와 만족스러운 대인관계를 형성·유지하지 못함, (3) 정상적 상황에서 부적절한 유형의 행동이나 감정 표출, (4) 만연한 불행감이나 우울, (5) 개인적 또는 학교 문제와 관련된 신체 증상이나 공포를 보이는 경향입니다. 이 정의는 미국 IDEA의 정서장애 정의의 기초가 되었습니다.',
    difficulty: 2,
    source: 'KICE 기출 빈출 주제',
  },
  {
    id: 'intro-q25',
    subject: 'introduction',
    chapter: 'disability-types',
    type: 'fill_in',
    question:
      'DSM-5에서 자폐스펙트럼장애의 심각도를 3단계로 분류할 때, "매우 실질적인 지원이 필요(requiring very substantial support)"에 해당하는 수준은 ( )단계이다.',
    answer: '3',
    explanation:
      'DSM-5는 자폐스펙트럼장애의 심각도를 사회적 의사소통과 제한적·반복적 행동 각 영역에서 3단계로 분류합니다. 1단계: 지원 필요(requiring support), 2단계: 실질적 지원 필요(requiring substantial support), 3단계: 매우 실질적 지원 필요(requiring very substantial support). 3단계가 가장 심한 수준으로, 언어적·비언어적 사회적 의사소통 기술에 심각한 결함이 있고, 행동의 유연성이 매우 제한적입니다.',
    difficulty: 2,
    source: 'KICE 기출 빈출 주제',
  },
  // ── history 챕터 추가 문항 ──
  {
    id: 'intro-q26',
    subject: 'introduction',
    chapter: 'history',
    type: 'multiple',
    question:
      'Wolfensberger가 정상화 원리를 발전시켜 제안한 개념으로, 사회적으로 가치 절하된 사람들의 사회적 역할을 향상시키는 것을 목표로 하는 원리는?',
    options: [
      '최소제한환경(Least Restrictive Environment)',
      '사회적 역할 가치화(Social Role Valorization)',
      '완전통합(Full Inclusion)',
      '일반교육주도(Regular Education Initiative)',
    ],
    answer: 1,
    explanation:
      'Wolfensberger는 정상화(normalization) 원리를 더 발전시켜 "사회적 역할 가치화(Social Role Valorization, SRV)"를 제안했습니다. SRV는 사회적으로 가치 절하된 사람들이 사회적으로 가치 있는 역할을 수행할 수 있도록 지원함으로써 그들의 사회적 이미지와 개인적 역량을 향상시키는 것을 핵심으로 합니다. 이는 정상화 원리보다 더 적극적인 개념으로, 장애인의 사회 참여와 통합을 촉진합니다.',
    difficulty: 2,
    source: 'KICE 기출 빈출 주제',
  },
  {
    id: 'intro-q27',
    subject: 'introduction',
    chapter: 'history',
    type: 'fill_in',
    question:
      '미국 IDEA(장애인교육법)의 6대 원칙 중, 장애학생이 가능한 한 비장애 또래와 함께 교육받아야 한다는 원칙은 ( )이고, 장애가 있다는 이유로 공교육에서 배제될 수 없다는 원칙은 ( )이다.',
    answer: '최소제한환경(LRE) / 영배제(zero reject)',
    explanation:
      'IDEA의 6대 원칙은 (1) 영배제(zero reject): 모든 장애학생에게 무상의 적절한 공교육 보장, (2) 비차별적 평가(nondiscriminatory evaluation): 편견 없는 다면적 평가, (3) 무상의 적절한 공교육(FAPE): 무상으로 적절한 교육 제공, (4) 최소제한환경(LRE): 비장애 또래와의 교육, (5) 적법절차(due process): 법적 보호 절차, (6) 부모 참여(parent participation): 의사결정 참여 보장입니다.',
    difficulty: 3,
    source: 'KICE 기출 빈출 주제',
  },
  {
    id: 'intro-q28',
    subject: 'introduction',
    chapter: 'history',
    type: 'multiple',
    question:
      '1994년 UNESCO 살라망카 선언(Salamanca Statement)의 핵심 내용으로 가장 적절한 것은?',
    options: [
      '장애학생을 위한 특수학교를 확대 설립해야 한다',
      '모든 학생의 교육적 요구를 충족하는 통합교육학교(inclusive school) 체제를 발전시켜야 한다',
      '장애학생의 직업교육을 의무화해야 한다',
      '장애 유형별로 분리된 전문 교육기관을 설치해야 한다',
    ],
    answer: 1,
    explanation:
      '1994년 스페인 살라망카에서 열린 UNESCO 특수교육 세계회의에서 채택된 살라망카 선언은 "모든 아동을 위한 학교(Schools for All)"를 핵심 이념으로 제시했습니다. 장애학생뿐만 아니라 영재, 소수민족, 빈곤층 등 모든 학습자의 다양한 요구를 수용하는 통합교육학교 체제의 발전을 촉구했으며, 이는 국제적 통합교육 운동의 중요한 전환점이 되었습니다.',
    difficulty: 1,
    source: 'KICE 기출 빈출 주제',
  },
  {
    id: 'intro-q29',
    subject: 'introduction',
    chapter: 'history',
    type: 'ox',
    question:
      '한국의 「장애인 등에 대한 특수교육법」(2007)은 기존 「특수교육진흥법」(1977)을 전면 개정한 것으로, 장애 영아에 대한 무상교육, 의무교육의 고등학교 확대, 장애인 평생교육 지원 등을 새롭게 규정했다.',
    answer: 'O',
    explanation:
      '2007년 제정된 「장애인 등에 대한 특수교육법」은 1977년 제정된 「특수교육진흥법」을 전면 개정한 법률입니다. 주요 변화로 (1) 장애 영아(만 3세 미만) 무상교육 도입, (2) 의무교육 범위를 유치원~고등학교로 확대, (3) 장애인 평생교육 지원 규정, (4) 특수교육지원센터 설치·운영 의무화, (5) 통합교육 관련 규정 강화 등이 포함되었습니다.',
    difficulty: 1,
    source: 'KICE 기출 빈출 주제',
  },
  {
    id: 'intro-q30',
    subject: 'introduction',
    chapter: 'history',
    type: 'multiple',
    question:
      'IDEA의 6대 원칙 중 "무상의 적절한 공교육(FAPE)"에 대한 설명으로 옳지 않은 것은?',
    options: [
      '장애학생에게 공적 비용으로 교육을 제공해야 한다',
      '각 장애학생에게 적절한 교육 프로그램이 IEP를 통해 제공되어야 한다',
      '"적절한"의 의미는 가능한 최상의(best) 교육을 제공하는 것이다',
      '관련 서비스와 보충적 보조를 포함한다',
    ],
    answer: 2,
    explanation:
      'FAPE(Free Appropriate Public Education)에서 "적절한(appropriate)"은 "최상의(best)"가 아니라, 학생이 교육적 이익을 얻을 수 있는 수준의 교육을 의미합니다. 이는 Board of Education v. Rowley(1982) 판례에서 확립된 원칙으로, 대법원은 FAPE가 아동에게 교육적 이익을 제공하는 "합리적으로 계산된" 프로그램이면 충분하며, 최대한의 잠재력 개발까지는 요구하지 않는다고 판시했습니다.',
    difficulty: 3,
    source: 'KICE 기출 빈출 주제',
  },
];
