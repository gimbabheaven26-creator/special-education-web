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
];
