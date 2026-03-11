import type { QuizQuestion } from '@/types/quiz';

export const curriculumQuizzes: QuizQuestion[] = [
  {
    id: 'cur-q1',
    subject: 'curriculum',
    chapter: 'basic-curriculum',
    type: 'multiple',
    question: '2022 개정 특수교육 교육과정에서 기본교육과정을 적용받는 학생은?',
    options: [
      '모든 특수교육대상자',
      '지적장애 또는 자폐성장애 학생으로서 공통교육과정 및 선택중심 교육과정을 적용하기 어려운 학생',
      '특수학교(급)에 재학 중인 모든 학생',
      '장애 정도가 심한(중증) 학생 전체',
    ],
    answer: 1,
    explanation:
      '기본교육과정은 지적장애 또는 자폐성장애를 지닌 학생 중 공통교육과정과 선택중심 교육과정을 적용하기 어려운 학생에게 적용하는 교육과정입니다. 장애 유형이나 정도만으로 자동 적용되는 것이 아니라 교육과정 접근 가능성을 기준으로 결정합니다.',
    difficulty: 2,
    tags: { disability: '지적장애' },
    source: 'KICE 기출 빈출 주제 (교육과정 편성/운영)',
  },
  {
    id: 'cur-q2',
    subject: 'curriculum',
    chapter: 'general-curriculum',
    type: 'ox',
    question:
      '교수적 수정(instructional adaptation)에서 교육과정 수정(curriculum modification)은 교육내용 자체의 목표나 수준을 바꾸는 것을 포함한다.',
    answer: 'O',
    explanation:
      '교수적 수정은 크게 교육과정 수정과 교수환경·방법 수정으로 나뉩니다. 교육과정 수정(curriculum modification)은 교육 목표, 내용, 수행 기준의 수준을 장애학생의 요구에 맞게 변경하는 것을 포함합니다. 이와 달리 교수 방법 수정은 목표는 유지하되 방법을 바꾸는 것입니다. ⚠️ 용어 검증 필요: 문헌에 따라 accommodation(조정)과 modification(수정)의 경계를 달리 정의하기도 합니다.',
    difficulty: 2,
    source: 'KICE 기출 빈출 주제 (교수적합화/교수적 수정)',
  },
  {
    id: 'cur-q3',
    subject: 'curriculum',
    chapter: 'iep',
    type: 'fill_in',
    question:
      '「장애인 등에 대한 특수교육법」에 따라 특수교육대상자에게 작성·실행해야 하는 개별화된 교육 지원 계획을 ( )이라 하며, 매 학년 시작일부터 ( )일 이내에 작성해야 한다.',
    answer: '개별화교육계획(IEP) / 30',
    explanation:
      '개별화교육계획(IEP: Individualized Education Program)은 특수교육법 제22조에 근거하며, 매 학년도 시작일부터 30일 이내에 작성되어야 합니다. 개별화교육지원팀이 구성되어 학생의 현재 학습 수행 수준, 장단기 목표, 교육 방법·환경, 관련 서비스 등을 포함하여 작성합니다.',
    difficulty: 2,
    tags: { disability: '지적장애' },
    source: 'KICE 기출 빈출 주제 (IEP/개별화교육)',
  },
  {
    id: 'cur-q4',
    subject: 'curriculum',
    chapter: 'general-curriculum',
    type: 'multiple',
    question:
      '통합학급에서 특수교육대상자의 교육과정 접근을 지원하기 위한 교수적 수정의 위계를 올바르게 나열한 것은?',
    options: [
      '교수환경 수정 → 교수 집단 수정 → 교수 방법 수정 → 교수 내용 수정',
      '교수 내용 수정 → 교수 방법 수정 → 교수환경 수정 → 교수 집단 수정',
      '교수 집단 수정 → 교수환경 수정 → 교수 내용 수정 → 교수 방법 수정',
      '교수 방법 수정 → 교수 집단 수정 → 교수 내용 수정 → 교수환경 수정',
    ],
    answer: 0,
    explanation:
      '교수적 수정(instructional adaptation)의 일반적 위계는 교수환경 수정 → 교수 집단 수정 → 교수 방법 수정 → 교수 내용 수정 순으로, 학생에 대한 영향이 적은 수정에서 점진적으로 더 큰 변화로 이동합니다. ⚠️ 용어 검증 필요: 학자에 따라 위계 구분 방식에 차이가 있습니다.',
    difficulty: 3,
    source: 'KICE 기출 빈출 주제 (교수적합화/교수적 수정)',
  },
  {
    id: 'cur-q5',
    subject: 'curriculum',
    chapter: 'iep',
    type: 'fill_in',
    question:
      'IEP에서 학생의 현재 교육 수행 수준을 기술할 때, 장애가 학생의 일반교육과정 참여 및 발전에 어떻게 영향을 미치는지 포함해야 한다. 이러한 IEP 구성요소를 ( )(이)라 한다.',
    answer: '현재 학습 수행 수준',
    explanation:
      '현재 학습 수행 수준(Present Levels of Academic Achievement and Functional Performance, PLAAFP)은 IEP의 출발점으로, 학생의 현재 강점과 요구, 장애가 교육과정 참여에 미치는 영향을 구체적으로 기술합니다. 이를 바탕으로 연간목표와 단기목표가 설정됩니다.',
    difficulty: 2,
    tags: { disability: '지적장애' },
    source: 'KICE 기출 빈출 주제 (IEP/개별화교육)',
  },
  {
    id: 'cur-q6',
    subject: 'curriculum',
    chapter: 'basic-curriculum',
    type: 'ox',
    question:
      '2022 개정 특수교육 교육과정에서 기본교육과정은 초등학교·중학교 과정(공통교육과정)에만 적용되고, 고등학교 과정에는 적용되지 않는다.',
    answer: 'X',
    explanation:
      '기본교육과정은 초등학교, 중학교뿐만 아니라 고등학교 과정에도 적용됩니다. 고등학교 기본교육과정은 고등학교 수준의 기본교육과정 교과(국어, 수학, 사회, 과학, 진로와 직업 등)로 구성됩니다.',
    difficulty: 2,
  },
  {
    id: 'cur-q7',
    subject: 'curriculum',
    chapter: 'general-curriculum',
    type: 'multiple',
    question:
      '다음 중 일반교육과정 내에서 특수교육대상자를 위한 교수적 지원 방법으로 적절하지 않은 것은?',
    options: [
      '교과 내용의 핵심 개념을 단순화하여 제시한다',
      '과제의 양을 줄이거나 수행 기준을 조정한다',
      '특수교육대상자를 별도 공간으로 분리하여 독립된 교육과정을 운영한다',
      '시각적 보조자료, 보조공학 기기를 활용한다',
    ],
    answer: 2,
    explanation:
      '통합교육 환경에서의 교수적 지원은 일반학급 내에서 학생의 참여와 성취를 극대화하는 방향으로 이루어져야 합니다. 단순히 분리하여 별도 교육과정을 운영하는 것은 통합교육의 원리에 반하며, 교수적 수정을 통해 통합학급 내에서 지원이 제공되어야 합니다.',
    difficulty: 1,
  },
  {
    id: 'cur-q8',
    subject: 'curriculum',
    chapter: 'iep',
    type: 'multiple',
    question: '개별화교육지원팀의 구성원으로 옳지 않은 것은?',
    options: [
      '보호자',
      '특수교육교원',
      '일반교육교원',
      '교육감(또는 교육장)',
    ],
    answer: 3,
    explanation:
      '「장애인 등에 대한 특수교육법」 제22조에 따른 개별화교육지원팀은 보호자, 특수교육교원, 일반교육교원, 진로 및 직업교육 담당 교원, 특수교육 관련 서비스 담당 인력 등으로 구성됩니다. 교육감이나 교육장은 행정 책임자이지 개별화교육지원팀의 법정 구성원이 아닙니다.',
    difficulty: 2,
    tags: { disability: '지적장애' },
    source: 'KICE 기출 빈출 주제 (IEP/개별화교육)',
  },
  {
    id: 'cur-q9',
    subject: 'curriculum',
    chapter: 'iep',
    type: 'descriptive',
    caseContext: `다음은 초등학교 4학년 통합학급에 재학 중인 민준(10세, 지적장애 2급)에 관한 정보이다.

[학생 정보]
- 현재 수행 수준: 수 개념은 20까지 인식 가능, 덧셈·뺄셈은 10 이하에서 가능
- 학급 수학 교육과정: 세 자리 수 덧셈·뺄셈 학습 중
- 강점: 시각적 자료에 집중 잘 함, 또래와의 관계 양호
- 의사소통: 2~3어절 문장으로 의사 표현 가능
- 보호자 희망: 수학 기초 연산 능력 향상`,
    question:
      '(1) 민준의 IEP에 포함될 수학 영역 연간목표를 구체적으로 한 가지 작성하시오. (2) 통합학급 수학 시간에 민준에게 적용할 수 있는 교수적 수정 방법을 교수 환경, 교수 내용, 교수 방법 각 1가지씩 제시하시오.',
    answer: `(1) 수학 영역 연간목표 (예시)
민준은 20 이하의 두 수에 대한 받아올림이 없는 두 자리 수 덧셈을 구체물(수 모형, 조각카드)을 사용하여 80% 이상의 정확도로 수행할 수 있다.

(2) 교수적 수정 방법
- 교수 환경 수정: 민준의 자리를 교사 가까이 배치하거나, 시각적 지원(수직선, 수 모형 조작물)을 책상 위에 항시 제공하여 접근성을 높인다.
- 교수 내용 수정: 학급 목표(세 자리 수 덧셈·뺄셈)를 민준의 수행 수준에 맞게 10 이하 덧셈·뺄셈으로 수준을 낮추고, 구체물 활용 단계부터 시작하는 과제를 제공한다.
- 교수 방법 수정: 구체물-반구체물-추상(CRA) 교수 순서를 적용하여 수 모형 조작 → 그림 카드 → 숫자 기호 순으로 점진적으로 지도하며, 단계별 촉구(least-to-most prompting)를 활용한다.`,
    explanation:
      'IEP의 목표는 SMART(구체적, 측정 가능, 달성 가능, 관련성, 시간 제한) 원칙에 따라 작성해야 합니다. 교수적 수정은 학생이 통합학급에서 의미 있게 참여할 수 있도록 지원하되, 가능한 한 학급의 교육활동과 연계되도록 계획합니다.',
    difficulty: 3,
    tags: { disability: '지적장애' },
    source: 'KICE 기출 빈출 주제 (IEP/교수적 수정 종합)',
  },
  {
    id: 'cur-q10',
    subject: 'curriculum',
    chapter: 'basic-curriculum',
    type: 'fill_in',
    question:
      '2022 개정 특수교육 교육과정의 기본교육과정 고등학교 단계에서 진로·직업 교육과 연계하여 학생의 졸업 후 성인생활을 준비하는 교과목은 ( )이다.',
    answer: '진로와 직업',
    explanation:
      '기본교육과정 「진로와 직업」은 고등학교 단계에서 학생이 직업세계를 이해하고, 직업 기초 능력과 직업 적응 기술을 습득하며, 졸업 후 취업 및 자립생활을 준비하는 교과입니다. 전환교육 계획(ITP)과 연계하여 운영됩니다. ⚠️ 용어 검증 필요: 교육과정 개정에 따라 교과 명칭과 내용이 변경될 수 있습니다.',
    difficulty: 1,
    tags: { disability: '지적장애' },
  },
  // ── basic-curriculum 챕터 추가 문항 ──
  {
    id: 'curr-q11',
    subject: 'curriculum',
    chapter: 'basic-curriculum',
    type: 'multiple',
    question:
      '2022 개정 특수교육 기본교육과정의 교과 구성에 포함되지 않는 것은?',
    options: [
      '국어, 수학, 사회, 과학',
      '체육, 음악, 미술',
      '진로와 직업, 일상생활 활동',
      '제2외국어, 한문',
    ],
    answer: 3,
    explanation:
      '기본교육과정은 국어, 수학, 사회, 과학, 체육, 음악, 미술, 실과(초등)/진로와 직업(중·고등), 일상생활 활동(초등) 등으로 구성됩니다. 제2외국어와 한문은 선택중심 교육과정(일반 고등학교)의 교과이며, 기본교육과정에는 포함되지 않습니다. 기본교육과정은 생활 기능 중심의 교육내용을 강조합니다.',
    difficulty: 1,
  },
  {
    id: 'curr-q12',
    subject: 'curriculum',
    chapter: 'basic-curriculum',
    type: 'fill_in',
    question:
      '2022 개정 교육과정에서 창의적 체험활동의 4개 영역은 자율활동, ( ), 동아리활동, ( )이다.',
    answer: '봉사활동 / 진로활동',
    explanation:
      '창의적 체험활동은 자율활동, 봉사활동, 동아리활동, 진로활동의 4개 영역으로 구성됩니다. 기본교육과정에서도 동일한 4개 영역을 운영하되, 학생의 장애 특성과 발달 수준에 맞게 활동 내용과 방법을 조정하여 운영합니다. 특히 진로활동은 「진로와 직업」 교과와 연계하여 전환교육의 일환으로 중요하게 다루어집니다.',
    difficulty: 1,
  },
  {
    id: 'curr-q13',
    subject: 'curriculum',
    chapter: 'basic-curriculum',
    type: 'ox',
    question:
      '기본교육과정에서 학년군은 초등학교의 경우 1~2학년군, 3~4학년군, 5~6학년군의 3개 학년군으로 편성되며, 이는 공통교육과정과 동일한 구조이다.',
    answer: 'O',
    explanation:
      '기본교육과정의 학년군 편성은 공통교육과정과 동일하게 초등학교 1~2학년군, 3~4학년군, 5~6학년군으로 구성됩니다. 학년군 체제를 통해 2년 단위로 교육과정을 유연하게 편성·운영할 수 있으며, 학생의 발달 수준과 학습 속도에 맞게 교육내용을 재구성할 수 있는 여지를 제공합니다.',
    difficulty: 1,
  },
  {
    id: 'curr-q14',
    subject: 'curriculum',
    chapter: 'basic-curriculum',
    type: 'multiple',
    question:
      '기본교육과정에서 초등학교 저학년(1~2학년군)에 편성되는 교과 중, 일상생활에서의 기본적인 습관과 기능을 지도하는 교과는?',
    options: [
      '실과',
      '진로와 직업',
      '일상생활 활동',
      '창의적 체험활동',
    ],
    answer: 2,
    explanation:
      '「일상생활 활동」은 기본교육과정 초등학교 단계에 편성되는 교과로, 식생활, 위생관리, 옷입기, 안전 등 일상에서 필요한 기본 생활 기능을 체계적으로 지도합니다. 이는 장애학생의 자립생활 기초를 형성하는 중요한 교과입니다. 실과는 중학년 이상, 진로와 직업은 중·고등학교 단계에 편성됩니다.',
    difficulty: 2,
  },
  {
    id: 'curr-q15',
    subject: 'curriculum',
    chapter: 'basic-curriculum',
    type: 'fill_in',
    question:
      '기본교육과정을 적용하는 특수학교에서 학교 교육과정 편성 시, 학생의 장애 특성과 요구에 따라 교과 내용을 대체하거나 변형할 수 있는 근거가 되는 교육과정 편성·운영의 원칙을 ( )(이)라 한다.',
    answer: '교육과정 재구성(교육과정 자율성)',
    explanation:
      '국가 수준 교육과정은 대강화(大綱化) 원칙에 따라 편성·운영의 자율성을 학교에 부여합니다. 기본교육과정을 적용하는 특수학교는 이 원칙에 따라 학생의 장애 유형, 정도, 발달 수준을 고려하여 교육과정을 재구성할 수 있습니다. 교과 내용의 대체, 변형, 보충, 교과 간 통합 등이 가능합니다.',
    difficulty: 2,
  },
  // ── general-curriculum 챕터 추가 문항 ──
  {
    id: 'curr-q16',
    subject: 'curriculum',
    chapter: 'general-curriculum',
    type: 'multiple',
    question:
      '교수적 수정의 4가지 유형(교수환경, 교수내용, 교수방법, 평가방법 수정) 중, 시험 시간을 연장하거나 별도의 고사실을 제공하는 것은 어디에 해당하는가?',
    options: [
      '교수환경 수정',
      '교수내용 수정',
      '교수방법 수정',
      '평가방법 수정',
    ],
    answer: 3,
    explanation:
      '시험 시간 연장, 별도 고사실 제공, 대체 평가 방법 사용(구술 시험, 포트폴리오 등)은 평가방법 수정에 해당합니다. 교수적 수정의 4가지 유형은 (1) 교수환경 수정: 물리적 환경, 좌석 배치 등, (2) 교수내용 수정: 학습 목표, 과제 수준 조정, (3) 교수방법 수정: 교수 전략, 매체, 집단 구성 변경, (4) 평가방법 수정: 평가 형태, 시간, 장소 조정입니다.',
    difficulty: 1,
  },
  {
    id: 'curr-q17',
    subject: 'curriculum',
    chapter: 'general-curriculum',
    type: 'fill_in',
    question:
      '교육과정 수정의 수준은 수정의 정도에 따라 ( ) → 수정(modification) → 대체(substitution) → ( )의 연속체로 구성된다.',
    answer: '조정(accommodation) / 대안(alternative)',
    explanation:
      '교육과정 수정의 수준은 일반적으로 (1) 조정(accommodation): 교육과정 목표는 유지하면서 접근 방법만 변경, (2) 수정(modification): 교육과정의 목표나 수준을 학생에 맞게 변경, (3) 대체(substitution): 일반교육과정의 일부를 기능적 교육과정으로 대체, (4) 대안(alternative): 완전히 다른 교육과정을 적용하는 연속체로 이해됩니다. 조정이 가장 경미한 수정이고, 대안이 가장 큰 변화입니다.',
    difficulty: 3,
  },
  {
    id: 'curr-q18',
    subject: 'curriculum',
    chapter: 'general-curriculum',
    type: 'ox',
    question:
      '보편적 접근(universal access)은 교수적 수정과 동일한 개념으로, 개별 학생의 요구에 맞추어 사후적으로 교육과정을 조정하는 것을 의미한다.',
    answer: 'X',
    explanation:
      '보편적 접근(universal access)은 교수적 수정과는 구별되는 개념입니다. 보편적 접근은 처음부터 모든 학습자가 교육과정에 접근할 수 있도록 설계하는 사전적(proactive) 접근인 반면, 교수적 수정은 개별 학생의 요구에 맞추어 사후적(reactive)으로 교육과정을 조정하는 접근입니다. 보편적 학습설계(UDL)가 보편적 접근의 대표적 프레임워크입니다.',
    difficulty: 2,
  },
  {
    id: 'curr-q19',
    subject: 'curriculum',
    chapter: 'general-curriculum',
    type: 'multiple',
    question:
      '통합학급에서 장애학생을 위한 교수적 수정 시, 교과 내용의 양을 줄이거나 핵심 개념만 선별하여 제시하는 것은 어떤 유형의 수정에 해당하는가?',
    options: [
      '교수환경 수정',
      '교수내용 수정',
      '교수방법 수정',
      '평가방법 수정',
    ],
    answer: 1,
    explanation:
      '교과 내용의 양을 줄이거나, 핵심 개념만 선별하여 제시하거나, 학습 목표의 수준을 조정하는 것은 교수내용 수정에 해당합니다. 교수내용 수정은 "무엇을 가르칠 것인가"에 대한 변경이며, 과제 난이도 조정, 학습량 축소, 목표 수준 하향 등이 포함됩니다. 가능한 한 일반교육과정의 핵심 개념은 유지하면서 수정하는 것이 바람직합니다.',
    difficulty: 1,
  },
  {
    id: 'curr-q20',
    subject: 'curriculum',
    chapter: 'general-curriculum',
    type: 'fill_in',
    question:
      '교수적 수정의 한 유형인 교수방법 수정에서, 소집단 구성, 또래교수, 협동학습 등 학습 집단의 구성을 변경하는 방법을 ( ) 수정이라 한다.',
    answer: '교수집단(교수 집단 편성)',
    explanation:
      '교수방법 수정은 크게 교수 전략 수정, 교수매체 수정, 교수집단 수정으로 나눌 수 있습니다. 교수집단 수정은 전체 학급 수업, 소집단 활동, 짝 활동, 개별 활동 등 학습 집단의 크기와 구성을 학생의 요구에 맞게 변경하는 것입니다. 장애학생이 참여할 수 있는 적절한 집단 구성은 통합교육의 질을 높이는 중요한 요소입니다.',
    difficulty: 2,
  },
  {
    id: 'curr-q21',
    subject: 'curriculum',
    chapter: 'general-curriculum',
    type: 'multiple',
    question:
      '다음 중 교수적 수정에서 조정(accommodation)과 수정(modification)의 차이에 대한 설명으로 옳은 것은?',
    options: [
      '조정과 수정은 동일한 의미이다',
      '조정은 교육과정 목표를 유지하면서 접근 방법을 변경하고, 수정은 목표 자체를 변경한다',
      '수정은 교육과정 목표를 유지하면서 접근 방법을 변경하고, 조정은 목표 자체를 변경한다',
      '조정은 물리적 환경만 변경하고, 수정은 교수방법만 변경한다',
    ],
    answer: 1,
    explanation:
      '조정(accommodation)은 교육과정의 목표와 내용은 동일하게 유지하면서 학생이 접근할 수 있도록 방법이나 환경을 변경하는 것입니다(예: 시험 시간 연장, 확대 인쇄). 수정(modification)은 교육과정의 목표나 내용 자체의 수준을 변경하는 것입니다(예: 학습 목표 하향 조정, 과제 난이도 축소). 이 구분은 IEP 작성과 평가에서 매우 중요합니다.',
    difficulty: 2,
  },
  // ── iep 챕터 추가 문항 ──
  {
    id: 'curr-q22',
    subject: 'curriculum',
    chapter: 'iep',
    type: 'multiple',
    question:
      'IEP의 목표 진술 시 사용하는 ABCD 구성요소로 옳게 짝지어진 것은?',
    options: [
      'A: Assessment(평가), B: Behavior(행동), C: Condition(조건), D: Degree(정도)',
      'A: Audience(대상), B: Behavior(행동), C: Condition(조건), D: Degree(정도)',
      'A: Audience(대상), B: Baseline(기초선), C: Criterion(준거), D: Duration(기간)',
      'A: Activity(활동), B: Behavior(행동), C: Context(맥락), D: Data(자료)',
    ],
    answer: 1,
    explanation:
      'ABCD 목표 진술법은 IEP의 연간목표와 단기목표를 구체적이고 측정 가능하게 작성하기 위한 방법입니다. A(Audience): 누가(대상 학생), B(Behavior): 무엇을 할 것인가(관찰·측정 가능한 행동), C(Condition): 어떤 조건에서(상황, 자료, 지원), D(Degree): 어느 정도로(성취 기준, 정확도, 빈도). 예: "민준(A)은 구체물을 사용하여(C) 20 이하 덧셈을(B) 80% 정확도로(D) 수행할 수 있다."',
    difficulty: 2,
    source: 'KICE 기출 빈출 주제 (IEP/개별화교육)',
  },
  {
    id: 'curr-q23',
    subject: 'curriculum',
    chapter: 'iep',
    type: 'fill_in',
    question:
      'IEP의 주요 구성요소 4가지를 순서대로 나열하면: ( ), 연간목표, ( ), 관련서비스이다.',
    answer: '현행수준(현재 학습 수행 수준) / 단기목표(단기교수목표)',
    explanation:
      'IEP의 주요 구성요소는 (1) 현행수준(PLAAFP): 학생의 현재 학업적·기능적 수행 수준, (2) 연간목표: 1년 내 달성할 수 있는 측정 가능한 목표, (3) 단기목표(단기교수목표/벤치마크): 연간목표를 달성하기 위한 세부 단계별 목표, (4) 관련서비스: 치료지원, 보조공학, 보조인력 등 교육 지원입니다. 현행수준 → 연간목표 → 단기목표로 이어지는 논리적 연결이 중요합니다.',
    difficulty: 1,
    source: 'KICE 기출 빈출 주제 (IEP/개별화교육)',
  },
  {
    id: 'curr-q24',
    subject: 'curriculum',
    chapter: 'iep',
    type: 'ox',
    question:
      'IEP(개별화교육계획)와 ITP(개별화전환교육계획)는 동일한 문서이며, 모든 학령기 장애학생에게 동일하게 적용된다.',
    answer: 'X',
    explanation:
      'IEP(Individualized Education Program)와 ITP(Individualized Transition Plan)는 다른 문서입니다. IEP는 모든 특수교육대상자에게 작성되는 교육 계획이고, ITP는 졸업 후 성인생활(고용, 독립생활, 지역사회 참여)로의 전환을 준비하기 위한 계획으로, 주로 중학교 후반~고등학교 단계에서 IEP에 포함되어 작성됩니다. 한국 특수교육법에서는 고등학교 과정에서 전환교육 계획을 IEP에 포함하도록 권장합니다.',
    difficulty: 2,
    source: 'KICE 기출 빈출 주제 (IEP/전환교육)',
  },
  {
    id: 'curr-q25',
    subject: 'curriculum',
    chapter: 'iep',
    type: 'multiple',
    question:
      '개별화교육지원팀의 법정 구성원에 해당하는 것을 모두 포함한 것은?',
    options: [
      '보호자, 특수교육교원, 일반교육교원',
      '보호자, 특수교육교원, 일반교육교원, 진로 및 직업교육 담당 교원',
      '보호자, 특수교육교원, 일반교육교원, 진로 및 직업교육 담당 교원, 특수교육 관련서비스 담당 인력',
      '보호자, 특수교육교원, 학교장, 교육감',
    ],
    answer: 2,
    explanation:
      '특수교육법 제22조 제1항에 따른 개별화교육지원팀의 법정 구성원은 보호자, 특수교육교원, 일반교육교원, 진로 및 직업교육 담당 교원, 특수교육 관련서비스 담당 인력입니다. 필요시 학생 본인, 관련 전문가 등이 추가로 참여할 수 있습니다. 학교장이나 교육감은 법정 구성원이 아닙니다.',
    difficulty: 2,
    source: 'KICE 기출 빈출 주제 (IEP/개별화교육)',
  },
  {
    id: 'curr-q26',
    subject: 'curriculum',
    chapter: 'iep',
    type: 'fill_in',
    question:
      'IEP 목표 진술에서 "민준은 구체물을 사용하여 20 이하의 덧셈 문제를 10문제 중 8문제 이상 정확하게 풀 수 있다"에서 ABCD 각 요소를 구분하면, A(대상)는 민준, B(행동)는 ( ), C(조건)는 ( ), D(정도)는 ( )이다.',
    answer: '20 이하의 덧셈 문제를 정확하게 풀기 / 구체물을 사용하여 / 10문제 중 8문제 이상',
    explanation:
      'ABCD 분석: A(Audience/대상) = 민준, B(Behavior/행동) = 20 이하의 덧셈 문제를 정확하게 풀기(관찰·측정 가능한 행동), C(Condition/조건) = 구체물을 사용하여(행동이 발생하는 조건·상황), D(Degree/정도) = 10문제 중 8문제 이상(성취 기준/준거). 목표 진술 시 B는 반드시 관찰 가능하고 측정 가능한 동사로 기술해야 합니다.',
    difficulty: 3,
    source: 'KICE 기출 빈출 주제 (IEP/개별화교육)',
  },
  {
    id: 'curr-q27',
    subject: 'curriculum',
    chapter: 'general-curriculum',
    type: 'multiple',
    question:
      '통합학급에서 교수환경 수정의 예로 가장 적절한 것은?',
    options: [
      '학습 목표를 하향 조정한다',
      '시험 시간을 연장한다',
      '장애학생의 좌석을 교사 가까이 배치하고 교실 내 이동 동선을 확보한다',
      '구체물-반구체물-추상(CRA) 교수법을 적용한다',
    ],
    answer: 2,
    explanation:
      '교수환경 수정은 물리적 환경(좌석 배치, 조명, 소음 조절, 이동 동선), 사회적 환경(학급 분위기, 또래 관계), 교수 자원 배치(보조공학 기기, 보조인력) 등을 변경하는 것입니다. 좌석 배치와 이동 동선 확보는 대표적인 교수환경 수정입니다. 학습 목표 하향은 교수내용 수정, 시험 시간 연장은 평가방법 수정, CRA 적용은 교수방법 수정에 해당합니다.',
    difficulty: 1,
  },
  {
    id: 'curr-q28',
    subject: 'curriculum',
    chapter: 'iep',
    type: 'ox',
    question:
      'IEP의 연간목표는 반드시 관찰 가능하고 측정 가능한 행동으로 진술해야 하며, "이해한다", "안다", "인식한다"와 같은 내적 상태를 나타내는 동사는 적절하지 않다.',
    answer: 'O',
    explanation:
      'IEP의 연간목표는 학생의 성취 여부를 객관적으로 판단할 수 있도록 관찰 가능하고 측정 가능한 행동 동사로 진술해야 합니다. "말할 수 있다", "쓸 수 있다", "변별할 수 있다" 등이 적절한 동사이며, "이해한다", "안다", "인식한다", "감상한다" 등 내적 상태를 나타내는 동사는 측정이 불가능하므로 적절하지 않습니다. 이는 목표의 측정 가능성(measurability) 원칙에 해당합니다.',
    difficulty: 1,
    source: 'KICE 기출 빈출 주제 (IEP/개별화교육)',
  },
  {
    id: 'curr-q29',
    subject: 'curriculum',
    chapter: 'basic-curriculum',
    type: 'multiple',
    question:
      '기본교육과정에서 중학교 단계의 선택교과에 해당하는 것은?',
    options: [
      '일상생활 활동',
      '진로와 직업',
      '보건, 정보',
      '영어, 중국어',
    ],
    answer: 2,
    explanation:
      '기본교육과정 중학교 단계에서는 보건, 정보 등이 선택교과로 편성될 수 있습니다. 일상생활 활동은 초등학교 단계, 진로와 직업은 중·고등학교의 필수 교과이며, 영어나 중국어는 기본교육과정 교과에 포함되지 않습니다. 선택교과는 학교와 학생의 여건에 따라 편성·운영합니다.',
    difficulty: 2,
  },
  {
    id: 'curr-q30',
    subject: 'curriculum',
    chapter: 'iep',
    type: 'multiple',
    question:
      'ITP(개별화전환교육계획)에 포함되어야 하는 전환교육 영역으로 가장 적절한 것은?',
    options: [
      '학업 성취도 향상, 교우 관계 개선',
      '고용, 독립생활/주거, 지역사회 참여',
      '읽기 유창성, 수학 연산, 쓰기',
      '행동 중재, 감각 훈련, 언어 치료',
    ],
    answer: 1,
    explanation:
      'ITP(Individualized Transition Plan)는 졸업 후 성인생활로의 전환을 준비하는 계획으로, 핵심 영역은 (1) 고용(employment): 직업 훈련, 취업 준비, (2) 독립생활/주거(independent living): 자기관리, 가정생활, 주거, (3) 지역사회 참여(community participation): 여가, 사회적 관계, 시민 활동 등입니다. 학업 성취나 행동 중재는 IEP의 영역이며, ITP는 학교 이후의 삶을 중심으로 계획합니다.',
    difficulty: 2,
    source: 'KICE 기출 빈출 주제 (전환교육/ITP)',
  },
];
