import type { QuizQuestion } from '@/types/quiz';

export const transitionQuizzes: QuizQuestion[] = [
  {
    id: 'trans-q1',
    subject: 'transition',
    chapter: 'planning',
    type: 'multiple',
    question:
      '「장애인 등에 대한 특수교육법」에서 전환교육의 법적 의무 적용 학년은?',
    options: [
      '초등학교 4학년 이상',
      '중학교 1학년 이상',
      '고등학교 1학년 이상',
      '중학교 3학년(만 14세) 이상부터 IEP에 전환계획 포함',
    ],
    answer: 3,
    explanation:
      '「장애인 등에 대한 특수교육법」 제23조 및 동법 시행령에 따라, 중학교 과정 이상(중3 또는 만 14세 이상)의 특수교육대상자에게는 개별화교육계획(IEP)에 개별화전환교육계획(ITP)을 포함하여야 합니다. ⚠️ 용어 검증 필요: 법령 개정에 따라 적용 학년 기준이 변경될 수 있으므로 최신 법령을 확인하세요.',
    difficulty: 2,
  },
  {
    id: 'trans-q2',
    subject: 'transition',
    chapter: 'planning',
    type: 'ox',
    question:
      '개별화전환교육계획(ITP)은 학생의 강점, 선호도, 흥미를 기반으로 작성되어야 하며, 졸업 후 교육, 직업, 독립생활, 지역사회 참여 영역의 성과 목표를 포함해야 한다.',
    answer: 'O',
    explanation:
      'ITP(Individualized Transition Plan)는 학생의 강점, 선호도, 흥미 및 요구를 기반으로 성인 삶의 성과(졸업 후 교육/훈련, 취업, 독립생활)를 목표로 작성됩니다. Wehman 등 전환교육 연구자들은 학생 중심 전환 계획(student-centered transition planning)의 중요성을 강조합니다.',
    difficulty: 1,
  },
  {
    id: 'trans-q3',
    subject: 'transition',
    chapter: 'self-determination',
    type: 'multiple',
    question:
      'Wehmeyer가 제안한 자기결정(self-determination)의 핵심 구성요소에 해당하지 않는 것은?',
    options: [
      '선택하기(choice-making)',
      '목표설정 및 달성(goal setting and attainment)',
      '자기옹호 및 리더십(self-advocacy and leadership)',
      '타인에 대한 의존(dependence on others)',
    ],
    answer: 3,
    explanation:
      'Wehmeyer의 자기결정 구성요소에는 선택하기, 의사결정, 문제해결, 목표설정 및 달성, 자기관리 및 자기조절, 자기옹호 및 리더십, 긍정적 자기효능감, 자기인식 등이 포함됩니다. "타인에 대한 의존"은 자기결정의 반대 개념으로, 자기결정을 저해하는 요인입니다.',
    difficulty: 2,
    tags: { disability: '지적장애' },
  },
  {
    id: 'trans-q4',
    subject: 'transition',
    chapter: 'cbi',
    type: 'fill_in',
    question:
      '지역사회 중심 교수(CBI: Community-Based Instruction)에서 실제 지역사회 환경에 나가기 전에 학교 내에서 지역사회 기술을 미리 연습하는 방법을 ( ) 교수라 한다.',
    answer: '지역사회 참조(community-referenced)',
    explanation:
      '지역사회 참조(community-referenced) 교수는 실제 지역사회 환경에서의 교수(CBI) 이전에 학교 내에서 시뮬레이션, 역할극, 모형 등을 활용하여 지역사회 기술을 연습하는 방법입니다. CBI의 보완적 방법으로, 실제 현장 경험이 어려운 경우나 사전 준비 단계로 활용됩니다. ⚠️ 용어 검증 필요: community-referenced와 community-based의 구분은 문헌마다 다를 수 있습니다.',
    difficulty: 3,
    tags: { disability: '지적장애' },
  },
  {
    id: 'trans-q5',
    subject: 'transition',
    chapter: 'planning',
    type: 'multiple',
    question:
      '전환교육의 성과 영역(outcome areas) 중 IDEA 2004(미국 장애인교육법)에서 명시한 세 가지 전환 성과 영역은?',
    options: [
      '취업, 독립생활, 지역사회 참여',
      '졸업 후 중등교육/훈련, 취업, 독립생활',
      '직업교육, 자립생활훈련, 사회적 기술',
      '고등교육 진학, 직업 훈련, 여가 활동',
    ],
    answer: 1,
    explanation:
      'IDEA 2004에서는 전환 서비스가 (1) 졸업 후 중등교육(postsecondary education) 또는 직업훈련, (2) 취업(employment), (3) 독립생활(independent living)의 세 가지 성과 영역에서 학생의 목표를 지향하도록 규정합니다. 국내 특수교육법도 유사한 전환교육 성과 영역을 제시합니다.',
    difficulty: 2,
  },
  {
    id: 'trans-q6',
    subject: 'transition',
    chapter: 'cbi',
    type: 'ox',
    question:
      '지역사회 중심 교수(CBI)는 학교 내 교실에서의 학습만으로는 습득하기 어려운 실제 지역사회 기술을 자연적인 환경에서 직접 교수하는 접근이다.',
    answer: 'O',
    explanation:
      'CBI(Community-Based Instruction)는 실제 지역사회 환경(마트, 은행, 대중교통 등)에서 생활 기술을 직접 교수하는 방법입니다. 교실 내 학습의 일반화 문제를 극복하고, 실제 상황에서의 수행 능력을 높이는 데 효과적입니다. 특히 지적장애, 자폐성장애 학생의 일반화 어려움을 고려할 때 중요합니다.',
    difficulty: 1,
    tags: { disability: '지적장애' },
  },
  {
    id: 'trans-q7',
    subject: 'transition',
    chapter: 'self-determination',
    type: 'fill_in',
    question:
      '자기결정 교수 모델(SDLMI: Self-Determined Learning Model of Instruction)에서 학생 스스로 (1) 목표를 설정하고, (2) 목표 달성을 위한 계획을 실행하며, (3) 목표 달성 여부를 ( )하는 3단계 과정을 거친다.',
    answer: '평가(자기평가·조정)',
    explanation:
      'SDLMI(Wehmeyer 등 개발)는 학생 주도 학습을 위한 교수 모델로, 학생이 ① 목표 설정(내가 원하는 것이 무엇인가?) → ② 계획 수립 및 실행(내가 무엇을 해야 하는가?) → ③ 결과 평가 및 조정(내가 배운 것은 무엇인가?)의 3단계를 통해 자기결정 기술을 개발합니다.',
    difficulty: 3,
    tags: { disability: '지적장애' },
  },
  {
    id: 'trans-q8',
    subject: 'transition',
    chapter: 'planning',
    type: 'multiple',
    question:
      '전환교육 계획 수립 시 학생 중심 전환계획 회의(student-centered transition planning meeting)에서 강조되는 사항이 아닌 것은?',
    options: [
      '학생이 회의에 직접 참여하고 자신의 선호와 목표를 표현한다',
      '가족과 지역사회 기관 관계자도 팀에 포함된다',
      '교사와 전문가가 학생의 목표를 대신 결정하여 제시한다',
      '학생의 강점과 관심사를 중심으로 계획을 수립한다',
    ],
    answer: 2,
    explanation:
      '학생 중심 전환계획은 학생이 수동적인 참여자가 아니라 계획의 주체로서 자신의 선호, 목표, 강점을 직접 표현하고 결정에 참여하는 것을 강조합니다. 교사나 전문가가 학생의 목표를 대신 결정하는 것은 자기결정 원리에 반합니다.',
    difficulty: 2,
  },
  {
    id: 'trans-q9',
    subject: 'transition',
    chapter: 'cbi',
    type: 'descriptive',
    caseContext: `다음은 특수학교 고등학교 2학년 학생 재현(17세, 지적장애 중등도)에 관한 정보이다.

[학생 정보]
- 졸업 후 목표: 편의점 아르바이트 취업 희망 (본인 및 가족 의사)
- 현재 기술 수준: 물건 진열, 청소 등 단순 반복 작업 가능, 계산 능력은 동전 단위 구분 가능 수준
- 의사소통: 짧은 문장으로 요구 표현 가능, 낯선 사람과의 소통에 어려움
- 학교 환경: 학교 인근 편의점과 협약 가능성 있음

[ITP 관련 현황]
- 현재 IEP에 "직업 기술 향상"이라는 포괄적 목표만 있고, 구체적인 전환계획은 없음`,
    question:
      '(1) 재현의 ITP에 포함될 구체적인 전환 성과 목표를 직업 영역에서 1가지 작성하시오. (2) 재현의 졸업 후 목표 달성을 위해 지역사회 중심 교수(CBI)를 계획할 때 고려해야 할 요소 3가지를 제시하시오.',
    answer: `(1) 직업 영역 전환 성과 목표 (예시)
재현은 졸업 후 1년 이내에 지역사회 편의점에서 물건 진열, 청소, 단순 재고 정리 업무를 일정 지원(주 1회 직업코치 방문) 하에 주 20시간 이상 수행할 수 있다.

(2) CBI 계획 시 고려 요소
① 실제 직무 환경 분석(job analysis): 편의점 업무를 과제분석(task analysis)하여 재현이 수행 가능한 구체적 직무 단계를 파악하고, 지원이 필요한 단계를 명확히 한다.
② 자연적 교수 환경 확보: 학교 인근 편의점과 협약을 맺어 실제 근무 환경에서의 현장실습(job shadowing, supported employment 등) 기회를 확보한다. 실제 환경에서의 교수는 기술의 일반화를 촉진한다.
③ 지원 체계 계획: 처음에는 직업코치(job coach)나 교사가 집중 지원하고, 점진적으로 지원을 줄여(fading) 자연적 지원(자연적 큐, 동료 지원 등)으로 대체하는 지원 감소 계획을 수립한다. 또한 교통수단(대중교통 이용 기술) 훈련도 병행한다.`,
    explanation:
      '전환교육은 학생의 졸업 후 삶의 질을 높이기 위해 학교-직업-지역사회를 연계하는 체계적인 계획이 필요합니다. CBI는 실제 환경에서의 직접 교수를 통해 일반화를 극대화하며, 지원을 점진적으로 감소시키는 것이 핵심입니다.',
    difficulty: 3,
    tags: { disability: '지적장애' },
  },
  {
    id: 'trans-q10',
    subject: 'transition',
    chapter: 'self-determination',
    type: 'fill_in',
    question:
      '장애학생이 자신의 권리와 요구를 스스로 주장하고, 필요한 지원을 요청하며, 의사결정에 참여하는 능력을 ( )이라 하며, 이는 자기결정의 핵심 구성요소 중 하나이다.',
    answer: '자기옹호(self-advocacy)',
    explanation:
      '자기옹호(self-advocacy)는 자신의 권리와 필요를 알고, 이를 다른 사람에게 효과적으로 전달하며, 의사결정 과정에 참여하는 능력입니다. 전환교육에서 자기옹호 기술은 성인 삶에서의 자립, 취업, 지역사회 참여를 위해 필수적이며, IEP/ITP 회의에 학생이 직접 참여하는 것이 자기옹호 연습의 좋은 기회입니다.',
    difficulty: 1,
    tags: { disability: '지적장애' },
  },
];
