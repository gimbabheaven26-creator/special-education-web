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

export const topNavigation = [
  'Readiness',
  'Practice',
  'Mock Exam',
  'Library',
  'Analytics',
  'AI Lab',
] as const;

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
    label: 'Adaptive',
    title: '적응형 세션',
    subtitle: '오늘 가장 점수를 올릴 가능성이 큰 문항만 자동 편성합니다.',
    duration: '42분',
    questionCount: '18문항',
    model: 'AMBOSS readiness + UWorld explanation loop',
    primaryAction: '처방 세션 시작',
    actionHref: '/today',
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
    label: 'Custom Qbank',
    title: '커스텀 문제은행',
    subtitle: '영역, 난도, 기출 빈도, 문항 형식을 조합해 직접 세션을 만듭니다.',
    duration: '25분',
    questionCount: '10문항',
    model: 'UWorld-style filterable qbank',
    primaryAction: '문제은행 구성',
    actionHref: '/quiz',
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
    label: 'Mock',
    title: '실전 모의고사',
    subtitle: '시간 압박, 영역 배분, 검토 루틴까지 실제 시험처럼 훈련합니다.',
    duration: '80분',
    questionCount: '전범위',
    model: 'Exam simulator + post-exam analytics',
    primaryAction: '모의고사 예약',
    actionHref: '/kice/exam',
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
    label: 'Review',
    title: '망각 곡선 복습',
    subtitle: '틀린 문제와 흔들리는 개념을 최적 간격으로 다시 꺼냅니다.',
    duration: '14분',
    questionCount: '9개',
    model: 'Spaced retrieval + Leitner queue',
    primaryAction: '복습 큐 열기',
    actionHref: '/flashcards/review',
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
    label: 'Answer Coach',
    title: '답안 근거를 한 문장으로 재작성',
    body: '사용자가 고른 선지가 왜 매력적인 오답인지 설명하고, 정답 근거 문장을 다시 쓰게 합니다.',
    trigger: '문항 제출 직후',
  },
  {
    label: 'Socratic Hint',
    title: '정답 대신 판단 기준 질문',
    body: '힌트는 바로 답을 주지 않고 “이 사례에서 후속결과는 무엇인가?”처럼 기준을 좁힙니다.',
    trigger: '힌트 요청 시',
  },
  {
    label: 'Coverage Planner',
    title: '공부량을 커버리지로 번역',
    body: '남은 기간, 취약 단원, 기출 빈도를 계산해 오늘 해야 할 최소 문항 수를 제안합니다.',
    trigger: '매일 첫 접속',
  },
];

export const roadmapPhases: RoadmapPhase[] = [
  {
    id: 'N0',
    title: 'Prototype Shell',
    status: 'live',
    outcome: '새 제품의 첫 화면, 정보구조, 학습 루프 검증',
  },
  {
    id: 'N1',
    title: 'Qbank Core',
    status: 'building',
    outcome: '블루프린트 기반 문제은행과 해설 스택',
  },
  {
    id: 'N2',
    title: 'Readiness Analytics',
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
    title: 'Mock Exam',
    status: 'planned',
    outcome: '실전 모의고사와 사후 리포트',
  },
  {
    id: 'N5',
    title: 'AI-Human Layer',
    status: 'planned',
    outcome: 'AI 초안, 전문가 검수, 품질 회귀 테스트',
  },
];
