export type ReadinessStatus = 'strong' | 'watch' | 'risk';

export type PracticeModeId = 'adaptive' | 'custom' | 'mock' | 'review';

export type RoadmapStatus = 'live' | 'building' | 'planned';

export type MetricTone = 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky';

export interface ReadinessMetric {
  label: string;
  value: number;
  unit: '%' | '개' | '분';
  delta: string;
  status: ReadinessStatus;
  note: string;
  tone: MetricTone;
}

export interface WeakDomain {
  domain: string;
  blueprint: string;
  readiness: number;
  risk: ReadinessStatus;
  evidence: string;
  prescription: string;
}

export interface DailyPrescription {
  title: string;
  focus: string;
  duration: number;
  questions: number;
  reviewItems: number;
  rationale: string;
}

export interface PracticeMode {
  id: PracticeModeId;
  label: string;
  title: string;
  subtitle: string;
  duration: string;
  questionCount: string;
  model: string;
  primaryAction: string;
  actionHref: string;
  steps: string[];
  aiTouch: string;
  evidence: string;
}

export interface ExplanationBlock {
  label: string;
  title: string;
  body: string;
}

export interface ReviewItem {
  label: string;
  title: string;
  due: string;
  strength: number;
}

export interface AiIntervention {
  label: string;
  title: string;
  body: string;
  trigger: string;
}

export interface RoadmapPhase {
  id: string;
  title: string;
  status: RoadmapStatus;
  outcome: string;
}

export interface PracticeChoice {
  id: string;
  label: string;
  correct: boolean;
  rationale: string;
}

export interface PracticeQuestion {
  id: string;
  stem: string;
  domain: string;
  blueprint: string;
  difficulty: string;
  format?: string;
  examSignal: string;
  choices: PracticeChoice[];
  explanation: {
    verdict: string;
    coreRule: string;
    trap: string;
    connect: string;
    nextReview: string;
  };
  aiCoach: {
    title: string;
    prompt: string;
    rewrite: string;
  };
}

export interface PracticeSession {
  mode: PracticeModeId;
  title: string;
  subtitle: string;
  targetGain: string;
  focus: string;
  queue: string[];
  question: PracticeQuestion;
  followUpQuestions?: PracticeQuestion[];
  timeLimitSeconds?: number;
  examBlueprint?: Array<{
    domain: string;
    count: number;
  }>;
}

export interface TopNavigationItem {
  label: string;
  href: string;
  active?: boolean;
}

export const topNavigation = [
  { label: '준비도', href: '#readiness', active: true },
  { label: '문제풀이', href: '#practice' },
  { label: '모의고사', href: '/next/practice?mode=mock' },
  { label: '개념창고', href: '/concepts' },
  { label: '기록', href: '/record' },
  { label: 'AI 실험실', href: '/admin/ai-generate' },
] satisfies TopNavigationItem[];

export const readinessMetrics: ReadinessMetric[] = [
  {
    label: '합격 준비도',
    value: 68,
    unit: '%',
    delta: '+7',
    status: 'watch',
    note: '최근 14일 실전형 문항 기준',
    tone: 'indigo',
  },
  {
    label: '블루프린트 커버리지',
    value: 74,
    unit: '%',
    delta: '+12',
    status: 'strong',
    note: '기출 영역별 최소 2회 노출',
    tone: 'emerald',
  },
  {
    label: '고위험 단원',
    value: 11,
    unit: '개',
    delta: '-3',
    status: 'risk',
    note: '반복 오답과 미응시 영역 합산',
    tone: 'rose',
  },
  {
    label: '오늘 필요 학습량',
    value: 42,
    unit: '분',
    delta: '최소',
    status: 'watch',
    note: '망각 곡선과 약점 가중치 반영',
    tone: 'amber',
  },
];

export const dailyPrescription: DailyPrescription = {
  title: '오늘의 처방',
  focus: '긍정적 행동지원과 기능평가',
  duration: 42,
  questions: 18,
  reviewItems: 9,
  rationale:
    '최근 3회 세션에서 ABC 기록과 중재 충실도 문항의 오답 설명 재현률이 낮았습니다.',
};

export const weakDomains: WeakDomain[] = [
  {
    domain: '정서행동장애',
    blueprint: '긍정적 행동지원, 기능평가, 중재 충실도',
    readiness: 46,
    risk: 'risk',
    evidence: '사례형 8문항 중 5문항에서 선행사건과 기능 추론을 혼동',
    prescription: 'Study Mode 12문항 + 연결 개념 3개 + 24시간 후 재인출',
  },
  {
    domain: '특수교육공학',
    blueprint: '보조공학 서비스 절차, 접근성, UDL',
    readiness: 58,
    risk: 'watch',
    evidence: '용어는 맞히지만 실제 지원 절차 순서 문항에서 정답률 하락',
    prescription: '절차 배열 6문항 + 기출 해설 비교 2개',
  },
  {
    domain: '지적장애',
    blueprint: '적응행동 사정, 지원강도, 전환교육',
    readiness: 61,
    risk: 'watch',
    evidence: '정의형 문항은 안정적이나 평가도구 선택 근거가 약함',
    prescription: '판단 근거 작성 5문항 + 오답 카드 4개',
  },
  {
    domain: '의사소통장애',
    blueprint: 'AAC 적용, 의사소통 기능, 중재 전략',
    readiness: 72,
    risk: 'strong',
    evidence: '최근 실전형 정답률은 안정적, 장기 유지 확인 필요',
    prescription: '3일 뒤 간격 반복 5문항',
  },
];

export const practiceModes: PracticeMode[] = [
  {
    id: 'adaptive',
    label: '처방 세션',
    title: '적응형 세션',
    subtitle: '오늘 가장 점수를 올릴 가능성이 큰 문항만 자동 편성합니다.',
    duration: '42분',
    questionCount: '18문항',
    model: 'AMBOSS readiness + UWorld explanation loop',
    primaryAction: '처방 세션 시작',
    actionHref: '/next/practice?mode=adaptive',
    steps: [
      '고위험 단원 12문항',
      '기출 연결 문항 4문항',
      '오답 재인출 2문항',
    ],
    aiTouch: 'AI가 오답 이유를 사용자의 언어로 압축한 뒤 다음 복습 시점을 예약합니다.',
    evidence: '예상 준비도 +3.2p',
  },
  {
    id: 'custom',
    label: '문제은행',
    title: '커스텀 문제은행',
    subtitle: '영역, 난도, 기출 빈도, 문항 형식을 조합해 직접 세션을 만듭니다.',
    duration: '25분',
    questionCount: '10문항',
    model: 'UWorld-style filterable qbank',
    primaryAction: '문제은행 구성',
    actionHref: '/next/qbank',
    steps: [
      '각론 영역 1개 선택',
      '사례형과 용어형 비율 조정',
      '해설 깊이와 시간 제한 선택',
    ],
    aiTouch: 'AI가 선택한 필터의 커버리지 빈틈을 경고합니다.',
    evidence: '기출 커버리지 74% 유지',
  },
  {
    id: 'mock',
    label: '모의고사',
    title: '실전 모의고사',
    subtitle: '시간 압박, 영역 배분, 검토 루틴까지 실제 시험처럼 훈련합니다.',
    duration: '80분',
    questionCount: '전범위',
    model: 'Exam simulator + post-exam analytics',
    primaryAction: '모의고사 예약',
    actionHref: '/next/practice?mode=mock',
    steps: [
      '시험 전 체크인',
      '영역별 제한 시간',
      '종료 후 근거 기반 리포트',
    ],
    aiTouch: 'AI가 실수 유형을 지식 부족, 시간 관리, 선지 함정으로 분류합니다.',
    evidence: '최근 모의 준비도 63%',
  },
  {
    id: 'review',
    label: '오답 복습',
    title: '망각 곡선 복습',
    subtitle: '틀린 문제와 흔들리는 개념을 최적 간격으로 다시 꺼냅니다.',
    duration: '14분',
    questionCount: '9개',
    model: 'Spaced retrieval + Leitner queue',
    primaryAction: '복습 큐 열기',
    actionHref: '/next/practice?mode=review',
    steps: [
      '오늘 만료 카드 5개',
      '취약 용어 3개',
      '최근 오답 1문항',
    ],
    aiTouch: 'AI가 사용자의 회상 답안을 채점하고 더 짧은 힌트로 재질문합니다.',
    evidence: '7일 유지율 +9p',
  },
];

export const explanationBlocks: ExplanationBlock[] = [
  {
    label: '오답 진단',
    title: '왜 틀렸나',
    body: '문항은 행동의 기능을 묻고 있는데, 답안은 문제행동의 형태에 머물렀습니다.',
  },
  {
    label: '시험장 판단',
    title: '정답을 가르는 기준',
    body: '선행사건, 행동, 후속결과가 연결될 때 기능평가로 판단하고, 단순 관찰 기록과 구분합니다.',
  },
  {
    label: '연결 개념',
    title: '함께 묶어야 할 용어',
    body: 'ABC 기록, 기능평가, 긍정적 행동지원, 중재 충실도를 한 묶음으로 복습합니다.',
  },
  {
    label: '다음 반복',
    title: '다시 나올 시점',
    body: '오늘 1회, 24시간 뒤 1회, 4일 뒤 사례형 1회로 재인출을 예약합니다.',
  },
];

export const reviewQueue: ReviewItem[] = [
  {
    label: '용어',
    title: '기능평가와 선호도 평가 구분',
    due: '지금',
    strength: 38,
  },
  {
    label: '사례',
    title: 'AAC 도입 절차 판단',
    due: '오늘 밤',
    strength: 52,
  },
  {
    label: '법령',
    title: '개별화교육지원팀 구성',
    due: '내일',
    strength: 67,
  },
];

export const aiInterventions: AiIntervention[] = [
  {
    label: '답안 코치',
    title: '답안 근거를 한 문장으로 재작성',
    body: '사용자가 고른 선지가 왜 매력적인 오답인지 설명하고, 정답 근거 문장을 다시 쓰게 합니다.',
    trigger: '문항 제출 직후',
  },
  {
    label: '판단 힌트',
    title: '정답 대신 판단 기준 질문',
    body: '힌트는 바로 답을 주지 않고 “이 사례에서 후속결과는 무엇인가?”처럼 기준을 좁힙니다.',
    trigger: '힌트 요청 시',
  },
  {
    label: '커버리지 설계',
    title: '공부량을 커버리지로 번역',
    body: '남은 기간, 취약 단원, 기출 빈도를 계산해 오늘 해야 할 최소 문항 수를 제안합니다.',
    trigger: '매일 첫 접속',
  },
];

export const roadmapPhases: RoadmapPhase[] = [
  {
    id: 'N0',
    title: '제품 골격',
    status: 'live',
    outcome: '새 제품의 첫 화면, 정보구조, 학습 루프 검증',
  },
  {
    id: 'N1',
    title: '문제은행 핵심',
    status: 'building',
    outcome: '블루프린트 기반 문제은행과 해설 스택',
  },
  {
    id: 'N2',
    title: '준비도 분석',
    status: 'planned',
    outcome: '합격 준비도, 약점 위험도, 성장 추세',
  },
  {
    id: 'N3',
    title: 'Spaced Review',
    status: 'planned',
    outcome: '망각 곡선, 오답 재인출, 장기 유지율',
  },
  {
    id: 'N4',
    title: '실전 모의고사',
    status: 'planned',
    outcome: '실전 모의고사와 사후 리포트',
  },
  {
    id: 'N5',
    title: 'AI 코칭 검수',
    status: 'planned',
    outcome: 'AI 초안, 전문가 검수, 품질 회귀 테스트',
  },
];

export const practiceSessions: Record<PracticeModeId, PracticeSession> = {
  adaptive: {
    mode: 'adaptive',
    title: 'Adaptive Readiness Session',
    subtitle: '오늘 준비도에 가장 큰 영향을 주는 정서행동장애 사례형 문항부터 풉니다.',
    targetGain: '+3.2p',
    focus: '긍정적 행동지원과 기능평가',
    queue: ['고위험 단원 12문항', '기출 연결 문항 4문항', '오답 재인출 2문항'],
    question: {
      id: 'next-adaptive-fba-01',
      stem: '기능평가의 핵심 목적은 무엇인가?',
      domain: '정서행동장애',
      blueprint: '긍정적 행동지원, 기능평가, 중재 충실도',
      difficulty: '중',
      examSignal: '최근 사례형 기출에서 행동 형태와 행동 기능을 구분하는 판단이 반복 출제됩니다.',
      choices: [
        {
          id: 'form',
          label: '문제행동의 형태를 가장 자세히 기록하는 것',
          correct: false,
          rationale: '형태 기록은 필요하지만 기능평가의 최종 목적은 아닙니다.',
        },
        {
          id: 'function',
          label: '행동의 기능을 파악해 중재 가설을 세우는 것',
          correct: true,
          rationale: '기능평가는 행동이 유지되는 이유를 찾아 중재 설계로 연결합니다.',
        },
        {
          id: 'reward',
          label: '학생에게 효과적인 보상 목록을 먼저 정하는 것',
          correct: false,
          rationale: '선호도 평가는 보상 후보를 찾는 절차이고 기능평가와 구분됩니다.',
        },
        {
          id: 'diagnosis',
          label: '장애 진단명을 기준으로 행동 원인을 확정하는 것',
          correct: false,
          rationale: '기능은 맥락 속 선행사건과 후속결과로 판단해야 합니다.',
        },
      ],
      explanation: {
        verdict: '정답입니다',
        coreRule: '기능평가는 문제행동의 형태가 아니라 행동을 유지시키는 기능을 찾는 절차입니다.',
        trap: '형태 기록, 선호도 평가, 진단명 판단은 모두 일부 정보일 수 있지만 중재 가설을 대체하지 못합니다.',
        connect: 'ABC 기록, 기능평가, 긍정적 행동지원, 중재 충실도를 하나의 해설 스택으로 묶어 복습하세요.',
        nextReview: '24시간 후 재인출',
      },
      aiCoach: {
        title: 'AI Answer Coach',
        prompt: '이 문항에서 “행동 형태”와 “행동 기능”을 어떻게 구분했는지 한 문장으로 설명해 보세요.',
        rewrite: '행동의 겉모습이 아니라 선행사건과 후속결과가 만드는 유지 이유를 찾는 것이 기능평가다.',
      },
    },
    followUpQuestions: [
      {
        id: 'next-adaptive-abc-02',
        stem: 'ABC 기록에서 후속결과를 판단하는 기준은 무엇인가?',
        domain: '정서행동장애',
        blueprint: 'ABC 기록, 기능평가, 긍정적 행동지원',
        difficulty: '중',
        examSignal: '기능평가 문항은 행동 직후 환경 반응을 찾아 기능 가설로 연결하게 합니다.',
        choices: [
          {
            id: 'after-response',
            label: '행동 직후 따라오는 반응이나 환경 변화',
            correct: true,
            rationale: '후속결과는 행동 뒤에 나타나 행동을 유지하거나 약화시키는 반응입니다.',
          },
          {
            id: 'before-event',
            label: '행동이 일어나기 전에 있었던 선행사건',
            correct: false,
            rationale: '행동 전 사건은 선행사건이며 후속결과와 구분해야 합니다.',
          },
          {
            id: 'behavior-form',
            label: '문제행동의 구체적인 형태와 빈도',
            correct: false,
            rationale: '행동 형태는 B에 해당하며 후속결과가 아닙니다.',
          },
          {
            id: 'diagnosis-label',
            label: '학생의 장애 진단명과 의학적 특성',
            correct: false,
            rationale: '진단 정보만으로 후속결과를 판단할 수 없습니다.',
          },
        ],
        explanation: {
          verdict: '정답입니다',
          coreRule: '후속결과는 행동 직후 발생해 그 행동의 반복 가능성에 영향을 주는 반응입니다.',
          trap: '선행사건, 행동 형태, 진단 정보는 각각 다른 분석 단서입니다.',
          connect: 'ABC 기록에서 A-B-C를 분리한 뒤 기능평가 가설로 이어가세요.',
          nextReview: '48시간 후 재인출',
        },
        aiCoach: {
          title: 'AI Answer Coach',
          prompt: '후속결과가 기능 가설로 이어지는 이유를 한 문장으로 압축해 보세요.',
          rewrite: '행동 직후 반응이 행동을 유지시키는지 확인해야 기능 가설을 세울 수 있다.',
        },
      },
    ],
  },
  custom: {
    mode: 'custom',
    title: 'Custom Qbank Session',
    subtitle: '사용자가 선택한 필터를 기반으로 기출 커버리지 빈틈을 확인합니다.',
    targetGain: '+1.4p',
    focus: '보조공학 서비스 절차',
    queue: ['절차 배열 4문항', '용어 구분 3문항', '사례 적용 3문항'],
    question: {
      id: 'next-custom-at-01',
      stem: '보조공학 서비스 결정에서 가장 먼저 확인해야 할 것은 무엇인가?',
      domain: '특수교육공학',
      blueprint: '보조공학 서비스 절차, 접근성, UDL',
      difficulty: '중',
      examSignal: '절차형 문항은 순서 판단 오류가 점수 손실로 이어집니다.',
      choices: [
        {
          id: 'catalog',
          label: '최신 기기 목록을 먼저 비교한다',
          correct: false,
          rationale: '기기 비교는 요구와 환경 분석 뒤에 이루어져야 합니다.',
        },
        {
          id: 'need',
          label: '학생의 교육적 요구와 환경 장벽을 확인한다',
          correct: true,
          rationale: '지원 필요와 맥락을 먼저 파악해야 적절한 도구를 결정할 수 있습니다.',
        },
      ],
      explanation: {
        verdict: '정답입니다',
        coreRule: '보조공학은 기기 선택보다 요구 평가와 접근성 장벽 파악이 먼저입니다.',
        trap: '기기 중심 접근은 시험에서 자주 나오는 매력적인 오답입니다.',
        connect: 'UDL, 접근성, 보조공학 서비스 절차를 함께 연결하세요.',
        nextReview: '48시간 후 재인출',
      },
      aiCoach: {
        title: 'AI Answer Coach',
        prompt: '왜 “기기 목록”이 먼저가 아닌지 절차 기준으로 말해 보세요.',
        rewrite: '도구는 요구와 환경 장벽이 확인된 뒤 선택된다.',
      },
    },
  },
  mock: {
    mode: 'mock',
    title: 'Mock Exam Drill',
    subtitle: '실전 모의고사 전에 흔들리는 판단 기준을 빠르게 점검합니다.',
    targetGain: '+2.0p',
    focus: '사례형 시간 관리',
    queue: ['제한시간 3분', '근거 표시', '함정 선지 리뷰'],
    timeLimitSeconds: 180,
    examBlueprint: [
      { domain: '관련 법령', count: 1 },
      { domain: '정서행동장애', count: 1 },
    ],
    question: {
      id: 'next-mock-iep-01',
      stem: 'IEP 회의에서 우선 검토해야 할 자료는 무엇인가?',
      domain: '관련 법령',
      blueprint: '개별화교육계획, 평가자료, 지원 결정',
      difficulty: '상',
      examSignal: '법령형 사례는 순서와 근거 자료를 함께 묻습니다.',
      choices: [
        {
          id: 'current-level',
          label: '현재 수행 수준과 평가 결과',
          correct: true,
          rationale: '교육목표와 지원은 현재 수준 자료에서 출발합니다.',
        },
        {
          id: 'facility',
          label: '학교 시설 현황',
          correct: false,
          rationale: '필요 자료일 수 있지만 IEP 목표 설정의 출발점은 아닙니다.',
        },
      ],
      explanation: {
        verdict: '정답입니다',
        coreRule: 'IEP는 현재 수행 수준과 평가 결과를 근거로 목표와 지원을 설계합니다.',
        trap: '환경 정보는 보조 자료이며 우선 근거와 구분해야 합니다.',
        connect: '평가 결과, 현재 수행 수준, 연간 목표, 지원 서비스를 순서로 묶으세요.',
        nextReview: '모의고사 종료 후 재검토',
      },
      aiCoach: {
        title: 'AI Answer Coach',
        prompt: 'IEP 목표가 왜 현재 수행 수준에서 출발하는지 근거를 말해 보세요.',
        rewrite: '현재 수행 수준이 목표와 지원의 기준점이 된다.',
      },
    },
    followUpQuestions: [
      {
        id: 'next-mock-abc-02',
        stem: '모의고사에서 ABC 기록의 후속결과를 빠르게 찾는 기준은 무엇인가?',
        domain: '정서행동장애',
        blueprint: 'ABC 기록, 기능평가, 시간 압박 상황 판단',
        difficulty: '중',
        examSignal: '시간 제한 상황에서는 A-B-C를 먼저 분리해야 함정 선지를 줄일 수 있습니다.',
        choices: [
          {
            id: 'after-response',
            label: '행동 직후 따라오는 반응이나 환경 변화',
            correct: true,
            rationale: '후속결과는 행동 뒤에 발생해 행동 유지 가능성에 영향을 줍니다.',
          },
          {
            id: 'before-event',
            label: '행동 전에 이미 존재한 선행사건',
            correct: false,
            rationale: '행동 전 단서는 선행사건이며 후속결과가 아닙니다.',
          },
          {
            id: 'behavior-form',
            label: '문제행동의 형태와 강도',
            correct: false,
            rationale: '행동 형태는 B에 해당하므로 후속결과와 분리해야 합니다.',
          },
        ],
        explanation: {
          verdict: '정답입니다',
          coreRule: '후속결과는 행동 직후 나타나 그 행동의 반복 가능성에 영향을 주는 반응입니다.',
          trap: '시간 압박에서는 선행사건과 행동 형태를 후속결과로 착각하기 쉽습니다.',
          connect: 'IEP 근거 판단과 ABC 기록을 모두 “근거 먼저 확인” 루틴으로 묶으세요.',
          nextReview: '모의고사 종료 후 재검토',
        },
        aiCoach: {
          title: 'AI Answer Coach',
          prompt: '후속결과를 찾는 순서를 10초 안에 말하듯 정리해 보세요.',
          rewrite: '행동 직후 반응을 찾고, 그 반응이 행동을 유지시키는지 확인한다.',
        },
      },
    ],
  },
  review: {
    mode: 'review',
    title: 'Spaced Review Session',
    subtitle: '오늘 만료된 오답을 짧게 재인출합니다.',
    targetGain: '+9p 유지율',
    focus: '기능평가와 선호도 평가 구분',
    queue: ['만료 카드 5개', '취약 용어 3개', '최근 오답 1문항'],
    question: {
      id: 'next-review-fba-01',
      stem: '기능평가와 선호도 평가를 구분하는 기준은 무엇인가?',
      domain: '정서행동장애',
      blueprint: '기능평가, 선호도 평가, 중재 설계',
      difficulty: '하',
      examSignal: '용어 구분은 사례형 선지 제거의 기반입니다.',
      choices: [
        {
          id: 'purpose',
          label: '평가의 목적과 산출물이 다르다',
          correct: true,
          rationale: '기능평가는 행동 기능, 선호도 평가는 강화 후보를 찾습니다.',
        },
        {
          id: 'same',
          label: '둘은 같은 절차이며 명칭만 다르다',
          correct: false,
          rationale: '목적과 사용 장면이 다릅니다.',
        },
      ],
      explanation: {
        verdict: '정답입니다',
        coreRule: '기능평가는 행동의 이유, 선호도 평가는 강화 후보를 찾습니다.',
        trap: '둘 다 중재와 관련되지만 산출물이 다릅니다.',
        connect: '기능평가 뒤 중재 전략, 선호도 평가 뒤 강화제 선택으로 연결하세요.',
        nextReview: '4일 후 재인출',
      },
      aiCoach: {
        title: 'AI Answer Coach',
        prompt: '두 평가의 산출물을 각각 한 단어로 정리해 보세요.',
        rewrite: '기능평가의 산출물은 기능, 선호도 평가의 산출물은 강화 후보이다.',
      },
    },
  },
};
