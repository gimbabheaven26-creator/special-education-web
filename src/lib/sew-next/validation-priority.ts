export type ValidationArea = 'readiness' | 'qbank' | 'practice' | 'mock' | 'record';
export type ValidationOutcome = 'success' | 'risk';

export interface UserValidationSignal {
  area: ValidationArea;
  outcome: ValidationOutcome;
  note: string;
}

export interface ValidationPriority {
  id: 'supabase-continuity' | 'mock-exam-depth' | 'readiness-evidence' | 'record-next-action';
  label: string;
  reason: string;
  actionHref: string;
}

export interface ValidationPrioritySnapshot {
  topPriority: ValidationPriority;
  priorities: ValidationPriority[];
}

const PRIORITIES: Record<ValidationPriority['id'], ValidationPriority> = {
  'supabase-continuity': {
    id: 'supabase-continuity',
    label: 'Supabase 연속 저장',
    reason: 'Qbank가 시험 직전 도구로 이해되면 기기 간 연속성과 백업 신뢰가 먼저 필요합니다.',
    actionHref: '/next/practice?mode=custom',
  },
  'mock-exam-depth': {
    id: 'mock-exam-depth',
    label: 'Mock Exam 실전 밀도',
    reason: '모의고사가 가볍게 느껴지면 문항 수, 제한 시간, 영역 리포트를 먼저 키워야 합니다.',
    actionHref: '/next/practice?mode=mock',
  },
  'readiness-evidence': {
    id: 'readiness-evidence',
    label: 'Readiness 근거 설명',
    reason: '검증 신호가 없을 때는 사용자가 준비도 점수의 근거를 납득하게 만드는 것이 기본 우선순위입니다.',
    actionHref: '#readiness',
  },
  'record-next-action': {
    id: 'record-next-action',
    label: 'Record 다음 처방',
    reason: '기록이 활동 로그로만 보이면 최근 세션에서 바로 이어 풀 다음 행동을 제시해야 합니다.',
    actionHref: '/next/results',
  },
};

function countSignals(
  signals: readonly UserValidationSignal[],
  area: ValidationArea,
  outcome: ValidationOutcome,
): number {
  return signals.filter((signal) => signal.area === area && signal.outcome === outcome).length;
}

export function buildValidationPrioritySnapshot(
  signals: readonly UserValidationSignal[],
): ValidationPrioritySnapshot {
  const qbankSuccessCount = countSignals(signals, 'qbank', 'success');
  const mockRiskCount = countSignals(signals, 'mock', 'risk');
  const readinessRiskCount = countSignals(signals, 'readiness', 'risk');
  const recordRiskCount = countSignals(signals, 'record', 'risk');

  const scored = [
    {
      priority: PRIORITIES['supabase-continuity'],
      score: qbankSuccessCount >= 3 ? 100 + qbankSuccessCount : qbankSuccessCount * 10,
    },
    {
      priority: PRIORITIES['mock-exam-depth'],
      score: mockRiskCount >= 2 ? 90 + mockRiskCount : mockRiskCount * 10,
    },
    {
      priority: PRIORITIES['readiness-evidence'],
      score: signals.length === 0 ? 80 : readinessRiskCount >= 2 ? 70 + readinessRiskCount : 20 + readinessRiskCount,
    },
    {
      priority: PRIORITIES['record-next-action'],
      score: recordRiskCount >= 1 ? 60 + recordRiskCount : 10,
    },
  ].sort((a, b) => b.score - a.score);

  return {
    topPriority: scored[0].priority,
    priorities: scored.map((item) => item.priority),
  };
}
