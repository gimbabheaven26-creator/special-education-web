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
    source: 'KICE 기출 빈출 주제 (전환교육/특수교육법)',
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
    source: 'KICE 기출 빈출 주제 (자기결정)',
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
    source: 'KICE 기출 빈출 주제 (지역사회중심교수)',
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
    source: 'KICE 기출 빈출 주제 (지역사회중심교수)',
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
    source: 'KICE 기출 빈출 주제 (자기결정)',
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
    source: 'KICE 기출 빈출 주제 (자기결정/자기옹호)',
  },
  // ── Chapter: planning (q11–q17) ──
  {
    id: 'trans-q11',
    subject: 'transition',
    chapter: 'planning',
    type: 'multiple',
    question:
      'Will(1984)의 bridges(가교) 모형에서 학교에서 직업 세계로의 전환을 위해 제시한 세 가지 수준의 서비스는?',
    options: [
      '기초교육, 직업교육, 고등교육',
      '특수한 서비스 없이 전환, 시간 제한적 서비스, 지속적 서비스',
      '가정생활, 지역사회 참여, 여가 활동',
      '자기결정, 자기옹호, 자기관리',
    ],
    answer: 1,
    explanation:
      'Will(1984)의 bridges 모형은 학교에서 고용으로의 전환을 세 가지 수준의 서비스로 설명합니다: ① 특수한 서비스 없이 전환(no special services): 일반적 서비스만으로 전환 가능 ② 시간 제한적 서비스(time-limited services): 직업재활, 직업훈련 등 일정 기간의 전환 서비스 ③ 지속적 서비스(ongoing services): 지원고용 등 장기적·지속적 지원. 이 모형은 고용에만 초점을 맞추어 범위가 제한적이라는 비판을 받았습니다.',
    difficulty: 2,
  },
  {
    id: 'trans-q12',
    subject: 'transition',
    chapter: 'planning',
    type: 'fill_in',
    question:
      'Halpern(1985)은 Will의 bridges 모형을 확장하여 전환의 성과를 고용뿐 아니라 ( ), ( ), ( )의 세 가지 축으로 제시하며 지역사회 적응(community adjustment)을 강조하였다.',
    answer: '고용(employment) / 주거환경(residential environment) / 사회적·대인관계 네트워크(social and interpersonal networks)',
    explanation:
      'Halpern(1985)은 Will의 모형이 고용에만 초점을 맞춘 것을 비판하고, 전환의 궁극적 성과를 "지역사회 적응(community adjustment)"으로 확장하였습니다. 지역사회 적응의 세 가지 핵심 축은 ① 고용 ② 주거환경(주거의 질) ③ 사회적·대인관계 네트워크입니다. 이 모형은 이후 전환교육이 삶의 질 전반을 고려하도록 하는 데 큰 영향을 미쳤습니다.',
    difficulty: 3,
  },
  {
    id: 'trans-q13',
    subject: 'transition',
    chapter: 'planning',
    type: 'ox',
    question:
      'ITP(개별화전환교육계획)는 IEP(개별화교육프로그램)와 별도로 작성되며, IEP에 포함되지 않는 독립적인 문서이다.',
    answer: 'X',
    explanation:
      'ITP(Individualized Transition Plan)는 IEP의 일부로 포함되어 작성됩니다. 미국 IDEA에서는 16세(일부 주에서는 14세)부터, 한국 특수교육법에서는 중학교 과정 이상부터 IEP에 전환계획을 포함하도록 규정합니다. ITP는 독립 문서가 아니라 IEP 내에 졸업 후 성과 목표와 이를 위한 전환 서비스를 명시하는 것입니다.',
    difficulty: 1,
  },
  {
    id: 'trans-q14',
    subject: 'transition',
    chapter: 'planning',
    type: 'multiple',
    question:
      'IDEA 2004에서 전환 서비스(transition services)의 4가지 주요 영역으로 적절한 것은?',
    options: [
      '교수, 관련 서비스, 지역사회 경험, 고용 및 기타 성인 생활 목표 달성',
      '학업, 행동, 사회성, 의사소통',
      '진단, 배치, 교육, 평가',
      '자기결정, 자기옹호, 자기관리, 자기평가',
    ],
    answer: 0,
    explanation:
      'IDEA 2004에서는 전환 서비스를 다음 영역에서 계획하도록 합니다: ① 교수(instruction) ② 관련 서비스(related services) ③ 지역사회 경험(community experiences) ④ 고용 및 기타 성인 생활 목표 달성(development of employment and other post-school adult living objectives). 필요시 일상생활기술 습득(daily living skills)과 기능적 직업평가(functional vocational evaluation)도 포함합니다.',
    difficulty: 2,
  },
  {
    id: 'trans-q15',
    subject: 'transition',
    chapter: 'planning',
    type: 'fill_in',
    question:
      '전환평가(transition assessment)의 유형은 크게 세 가지로 구분된다: 표준화 검사 등을 활용하는 ( ) 평가, 관찰·면담·포트폴리오 등의 ( ) 평가, 그리고 실제 지역사회·직업 환경에서의 수행을 평가하는 ( ) 평가이다.',
    answer: '공식적(formal) / 비공식적(informal) / 상황(situational)',
    explanation:
      '전환평가의 세 유형: ① 공식적 평가(formal assessment): 표준화 검사, 적응행동 검사, 흥미 검사, 적성 검사 등 ② 비공식적 평가(informal assessment): 면접, 관찰, 체크리스트, 포트폴리오, 설문, 개인 미래계획(person-centered planning) 등 ③ 상황 평가(situational assessment): 실제 또는 모의 직업·지역사회 환경에서의 수행을 평가. 전환평가는 학생의 강점, 선호, 흥미, 요구를 파악하여 전환계획의 기초가 됩니다.',
    difficulty: 2,
  },
  {
    id: 'trans-q16',
    subject: 'transition',
    chapter: 'planning',
    type: 'multiple',
    question:
      'ITP와 IEP의 차이점에 대한 설명으로 가장 적절한 것은?',
    options: [
      'IEP는 현재 학업 수행 수준에 초점, ITP는 졸업 후 성인 삶의 성과(고용, 교육, 독립생활)에 초점을 둔다',
      'IEP는 부모가 작성하고, ITP는 교사가 단독으로 작성한다',
      'ITP는 초등학교부터 의무적으로 작성해야 한다',
      'IEP와 ITP는 완전히 동일한 문서이다',
    ],
    answer: 0,
    explanation:
      'IEP는 학생의 현재 수행 수준과 연간 학업·기능적 목표에 초점을 두는 반면, ITP는 IEP 내에 포함되어 졸업 후 성인 삶의 결과(취업, 중등 이후 교육, 독립생활)를 목표로 한 전환 서비스와 활동을 구체적으로 계획합니다. ITP는 학생의 미래 비전을 중심으로 역방향(backward)으로 현재 교육 목표를 설정하는 접근입니다.',
    difficulty: 1,
  },
  {
    id: 'trans-q17',
    subject: 'transition',
    chapter: 'planning',
    type: 'ox',
    question:
      '전환교육 계획 수립 시, 전환평가의 결과는 학생의 강점과 선호보다는 장애 특성과 결함에 초점을 맞추어 해석해야 한다.',
    answer: 'X',
    explanation:
      '현대 전환교육은 학생의 결함이 아닌 강점(strengths), 선호(preferences), 흥미(interests), 요구(needs)에 기반한 계획 수립을 강조합니다. IDEA에서도 전환 서비스는 학생의 강점, 선호, 흥미를 고려하여(taking into account the child\'s strengths, preferences, and interests) 계획하도록 명시합니다. 강점 기반 접근이 학생의 동기와 자기결정을 높입니다.',
    difficulty: 1,
  },
  // ── Chapter: self-determination (q18–q23) ──
  {
    id: 'trans-q18',
    subject: 'transition',
    chapter: 'self-determination',
    type: 'fill_in',
    question:
      'Wehmeyer(1996)가 제시한 자기결정 행동의 4가지 본질적 특성은 ( ), ( ), ( ), ( )이다.',
    answer: '자율성(autonomy) / 자기조절(self-regulation) / 심리적 역량강화(psychological empowerment) / 자기실현(self-realization)',
    explanation:
      'Wehmeyer의 자기결정 기능 모형에서 자기결정 행동의 4가지 본질적 특성: ① 자율성(autonomy): 자신의 선호에 따라 독립적으로 행동 ② 자기조절(self-regulation): 환경을 검토하고 자신의 행동을 조절 ③ 심리적 역량강화(psychological empowerment): 자신이 결과에 영향을 미칠 수 있다는 통제감 ④ 자기실현(self-realization): 자신의 강점과 한계를 이해하고 이를 바탕으로 행동. 이 네 가지는 자기결정의 정도(degree)를 결정하는 요소입니다.',
    difficulty: 2,
    tags: { disability: '지적장애' },
  },
  {
    id: 'trans-q19',
    subject: 'transition',
    chapter: 'self-determination',
    type: 'multiple',
    question:
      'SDLMI(자기결정 교수 모델)의 3단계에서 각 단계의 핵심 질문이 올바르게 연결된 것은?',
    options: [
      '1단계: 나는 무엇을 배웠는가? → 2단계: 내 목표는 무엇인가? → 3단계: 내 계획은 무엇인가?',
      '1단계: 내 목표는 무엇인가? → 2단계: 내 계획은 무엇인가? → 3단계: 나는 무엇을 배웠는가?',
      '1단계: 내 계획은 무엇인가? → 2단계: 나는 무엇을 배웠는가? → 3단계: 내 목표는 무엇인가?',
      '1단계: 교사의 목표는 무엇인가? → 2단계: 부모의 기대는 무엇인가? → 3단계: 학교의 요구는 무엇인가?',
    ],
    answer: 1,
    explanation:
      'SDLMI(Self-Determined Learning Model of Instruction)의 3단계: 1단계 "내 목표는 무엇인가?(What is my goal?)" – 학생이 학습 목표 설정, 2단계 "내 계획은 무엇인가?(What is my plan?)" – 목표 달성을 위한 행동 계획 수립 및 실행, 3단계 "나는 무엇을 배웠는가?(What have I learned?)" – 목표 달성 여부 자기평가 및 조정. 각 단계에서 학생이 주도적으로 문제를 해결합니다.',
    difficulty: 2,
    tags: { disability: '지적장애' },
  },
  {
    id: 'trans-q20',
    subject: 'transition',
    chapter: 'self-determination',
    type: 'ox',
    question:
      'ChoiceMaker 프로그램은 학생이 IEP 회의에 직접 참여하여 자신의 목표를 설정하고, 계획을 수립하며, 행동을 실행하도록 교수하는 자기결정 교육과정이다.',
    answer: 'O',
    explanation:
      'ChoiceMaker(Martin & Marshall, 1995)는 자기결정 전환교육 교육과정으로, 세 가지 영역으로 구성됩니다: ① 자기 주도 IEP(Self-Directed IEP): 학생이 자신의 IEP 회의를 주도 ② 목표 선택(Choosing Goals): 학생이 전환 목표를 스스로 선택 ③ 행동 실행(Taking Action): 목표 달성을 위한 계획 수립·실행·평가. 이 프로그램은 학생의 자기결정 기술과 IEP 참여를 동시에 높이는 데 효과적입니다.',
    difficulty: 2,
    tags: { disability: '지적장애' },
  },
  {
    id: 'trans-q21',
    subject: 'transition',
    chapter: 'self-determination',
    type: 'multiple',
    question:
      'Wehmeyer의 자기결정 기능 모형에서 "심리적 역량강화(psychological empowerment)"에 해당하는 행동 특성은?',
    options: [
      '자신의 강점과 한계를 정확히 인식하는 것',
      '자신이 노력하면 원하는 결과를 얻을 수 있다는 통제감과 효능감을 갖는 것',
      '외부의 지시 없이 자신의 선호에 따라 독립적으로 행동하는 것',
      '자신의 행동을 모니터링하고 평가하여 조절하는 것',
    ],
    answer: 1,
    explanation:
      'Wehmeyer의 4가지 본질적 특성 구분: 자율성(autonomy) = 독립적·자기주도적 행동, 자기조절(self-regulation) = 행동 모니터링·평가·조절, 심리적 역량강화(psychological empowerment) = 자신이 결과에 영향을 미칠 수 있다는 통제감(internal locus of control), 자기효능감(self-efficacy), 결과 기대, 자기실현(self-realization) = 자신의 강점·한계에 대한 정확한 자기인식.',
    difficulty: 3,
    tags: { disability: '지적장애' },
  },
  {
    id: 'trans-q22',
    subject: 'transition',
    chapter: 'self-determination',
    type: 'fill_in',
    question:
      '자기결정 교수에서 학생이 자신의 IEP/ITP 회의에 직접 참여하여 자신의 강점, 요구, 목표를 발표하고 회의를 주도하도록 교수하는 접근을 ( )이라 한다.',
    answer: '학생 주도 IEP(student-directed/student-led IEP)',
    explanation:
      '학생 주도 IEP(student-directed IEP)는 학생이 자신의 IEP 회의에서 수동적 참석자가 아니라 적극적 참여자/주도자가 되도록 교수하는 접근입니다. 학생은 자신의 강점, 요구, 목표, 원하는 지원 등을 직접 발표하고 논의에 참여합니다. ChoiceMaker, Self-Directed IEP(Martin 등), NEXT S.T.E.P. 등의 프로그램이 이를 지원합니다.',
    difficulty: 2,
    tags: { disability: '지적장애' },
  },
  {
    id: 'trans-q23',
    subject: 'transition',
    chapter: 'self-determination',
    type: 'ox',
    question:
      '자기결정은 장애가 심한 학생에게는 교수할 수 없으며, 경도 장애 학생에게만 적용 가능한 개념이다.',
    answer: 'X',
    explanation:
      '자기결정은 장애의 정도와 관계없이 모든 학생에게 교수할 수 있고 교수해야 하는 개념입니다. Wehmeyer 등의 연구에 따르면, 중도 지적장애나 중복장애 학생도 선택하기, 의사표현, 자기관리 등의 자기결정 구성요소를 학습할 수 있습니다. 장애 정도에 따라 지원 수준과 교수 전략을 조정하면 됩니다(예: AAC 활용, 그림 선택 등).',
    difficulty: 1,
    tags: { disability: '지적장애' },
  },
  // ── Chapter: cbi (q24–q30) ──
  {
    id: 'trans-q24',
    subject: 'transition',
    chapter: 'cbi',
    type: 'multiple',
    question:
      '지역사회 중심 교수(CBI)의 4가지 주요 영역으로 적절한 것은?',
    options: [
      '읽기, 쓰기, 수학, 과학',
      '가정생활, 지역사회, 여가/레크리에이션, 직업',
      '의사소통, 사회성, 운동, 인지',
      '자기결정, 자기옹호, 자기관리, 자기평가',
    ],
    answer: 1,
    explanation:
      'CBI(Community-Based Instruction)의 4가지 주요 영역: ① 가정생활(domestic): 요리, 청소, 세탁, 가정 안전 등 ② 지역사회(community): 대중교통 이용, 은행, 마트 등 지역사회 시설 이용 ③ 여가/레크리에이션(leisure/recreation): 여가 활동 참여, 취미 등 ④ 직업(vocational): 직업 기술, 직장 내 적절한 행동 등. 이 영역들은 성인 삶의 질에 직접적으로 관련됩니다.',
    difficulty: 1,
    tags: { disability: '지적장애' },
  },
  {
    id: 'trans-q25',
    subject: 'transition',
    chapter: 'cbi',
    type: 'fill_in',
    question:
      'CBI 교수 계획 시, 대상 학생이 생활하는 환경(가정, 학교, 지역사회)에서 요구되는 기술을 체계적으로 분석하여 교수 내용을 결정하는 방법을 ( )이라 한다.',
    answer: '생태학적 목록(ecological inventory)',
    explanation:
      '생태학적 목록(ecological inventory)은 Brown 등(1979)이 제안한 교육과정 개발 방법으로, 다음 단계를 거칩니다: ① 교육과정 영역 설정(가정, 지역사회, 여가, 직업) → ② 현재·미래 환경 파악 → ③ 하위 환경 분석 → ④ 필요 활동 확인 → ⑤ 활동별 필요 기술 분석. 이를 통해 학생의 실제 생활 환경에서 기능적으로 필요한 기술을 교수 내용으로 선정합니다.',
    difficulty: 3,
    tags: { disability: '지적장애' },
  },
  {
    id: 'trans-q26',
    subject: 'transition',
    chapter: 'cbi',
    type: 'multiple',
    question:
      '지원고용(supported employment) 모델 중, 장애인 한 명이 비장애인 직장에 배치되어 직업코치(job coach)의 지원을 받으며 근무하는 모델은?',
    options: [
      '이동작업대(mobile work crew) 모델',
      '소집단(enclave) 모델',
      '개별배치(individual placement) 모델',
      '소기업(entrepreneurial) 모델',
    ],
    answer: 2,
    explanation:
      '지원고용(supported employment)의 4가지 모델: ① 개별배치(individual placement): 장애인 1명이 일반 직장에 배치, 직업코치가 현장에서 훈련·지원 → 점진적 지원 감소(fading) ② 소집단(enclave): 소수의 장애인(3-8명)이 일반 사업장 내에서 집단으로 근무 ③ 이동작업대(mobile work crew): 소집단이 지역사회 여러 장소를 이동하며 서비스(청소, 조경 등) 제공 ④ 소기업(entrepreneurial/small business): 장애인이 소규모 사업체를 운영.',
    difficulty: 2,
    tags: { disability: '지적장애' },
  },
  {
    id: 'trans-q27',
    subject: 'transition',
    chapter: 'cbi',
    type: 'ox',
    question:
      '일반화(generalization) 촉진 전략에서 "충분한 예시 사용(use sufficient exemplars)"은 하나의 교수 사례만으로도 다양한 상황에 일반화가 자동으로 이루어진다는 의미이다.',
    answer: 'X',
    explanation:
      '일반화 촉진 전략에서 "충분한 예시 사용(use sufficient exemplars)"은 다양한 사례, 자극, 상황, 반응 등을 교수에 포함시켜 학생이 여러 조건에서 일반화할 수 있도록 하는 것입니다. Stokes와 Baer(1977)의 일반화 촉진 전략에서는 하나의 사례가 아닌 여러 사례(multiple exemplars)를 사용하여 자극 일반화와 반응 일반화를 촉진하도록 권장합니다.',
    difficulty: 2,
  },
  {
    id: 'trans-q28',
    subject: 'transition',
    chapter: 'cbi',
    type: 'fill_in',
    question:
      '지원고용에서 직업코치(job coach)가 초기에 집중적으로 지원을 제공한 후, 대상자의 수행이 안정되면 지원을 점진적으로 줄여가는 절차를 ( )이라 한다.',
    answer: '지원 감소(fading) 또는 자연적 지원으로의 전환',
    explanation:
      '지원고용의 핵심 원리 중 하나는 배치 후 훈련(place-then-train) 접근에서 직업코치의 집중 지원을 점진적으로 감소(fading)시키고, 직장 내 자연적 지원(natural supports: 동료, 상사의 도움, 일상적 환경 단서)으로 전환하는 것입니다. 이를 통해 장애인의 독립적 직업 수행과 직장 내 자연스러운 통합을 도모합니다.',
    difficulty: 2,
    tags: { disability: '지적장애' },
  },
  {
    id: 'trans-q29',
    subject: 'transition',
    chapter: 'cbi',
    type: 'multiple',
    question:
      '과제분석(task analysis)에 대한 설명으로 옳지 않은 것은?',
    options: [
      '복잡한 기술을 작은 하위 단계들로 분해하는 방법이다',
      '각 단계는 관찰 가능하고 측정 가능하게 기술해야 한다',
      '모든 학생에게 동일한 단계 수와 내용으로 적용해야 한다',
      '행동연쇄(chaining) 교수의 기초가 된다',
    ],
    answer: 2,
    explanation:
      '과제분석(task analysis)은 복잡한 기술을 순차적인 하위 단계로 분해하는 방법으로, 행동연쇄(전진연쇄, 후진연쇄, 전체 과제 제시) 교수의 기초가 됩니다. 각 단계는 관찰·측정 가능하게 기술해야 합니다. 그러나 과제분석의 단계 수와 세부 내용은 학생의 능력 수준에 따라 조정해야 하며, 모든 학생에게 동일하게 적용하는 것이 아닙니다.',
    difficulty: 2,
    tags: { disability: '지적장애' },
  },
  {
    id: 'trans-q30',
    subject: 'transition',
    chapter: 'cbi',
    type: 'multiple',
    question:
      '일반화 촉진 전략 중 Stokes와 Baer(1977)가 제시한 전략에 해당하지 않는 것은?',
    options: [
      '자연적 유지 수반성 도입(introduce to natural maintaining contingencies)',
      '공통자극 프로그래밍(program common stimuli)',
      '느슨한 교수(teach loosely)',
      '교수 환경을 단일화하여 통제를 극대화한다(maximize control in one setting)',
    ],
    answer: 3,
    explanation:
      'Stokes와 Baer(1977)의 일반화 촉진 전략: ① 훈련 후 기대(train and hope) – 가장 소극적 ② 자연적 유지 수반성 도입 ③ 충분한 예시 훈련(train sufficient exemplars) ④ 느슨한 교수(teach loosely) – 교수 조건에 다양성 부여 ⑤ 공통자극 프로그래밍 ⑥ 매개 일반화(mediate generalization) ⑦ 식별 불가능한 수반성 훈련. 환경을 단일화하는 것은 일반화를 저해하므로 해당하지 않습니다.',
    difficulty: 3,
  },
];
