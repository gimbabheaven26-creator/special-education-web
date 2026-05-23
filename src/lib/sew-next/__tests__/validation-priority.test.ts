import { describe, expect, it } from 'vitest';

import { buildValidationPrioritySnapshot } from '../validation-priority';

describe('buildValidationPrioritySnapshot', () => {
  it('promotes Supabase continuity when qbank sessions are understood and completed', () => {
    const snapshot = buildValidationPrioritySnapshot([
      { area: 'qbank', outcome: 'success', note: '내 약점에 맞게 골라 풀 수 있다' },
      { area: 'qbank', outcome: 'success', note: '시험 직전에 쓸 문제은행 같다' },
      { area: 'qbank', outcome: 'success', note: '필터 의미가 명확하다' },
    ]);

    expect(snapshot.topPriority.id).toBe('supabase-continuity');
    expect(snapshot.topPriority.actionHref).toBe('/next/practice?mode=custom');
    expect(snapshot.topPriority.reason).toContain('Qbank');
  });

  it('promotes mock exam expansion when users feel the exam is too light', () => {
    const snapshot = buildValidationPrioritySnapshot([
      { area: 'mock', outcome: 'risk', note: '문항 수가 적어서 모의고사 같지 않다' },
      { area: 'mock', outcome: 'risk', note: '시간 압박이 더 필요하다' },
    ]);

    expect(snapshot.topPriority.id).toBe('mock-exam-depth');
    expect(snapshot.topPriority.actionHref).toBe('/next/practice?mode=mock');
    expect(snapshot.topPriority.reason).toContain('모의고사');
  });

  it('uses readiness evidence as the default if no user signals exist yet', () => {
    const snapshot = buildValidationPrioritySnapshot([]);

    expect(snapshot.topPriority.id).toBe('readiness-evidence');
    expect(snapshot.topPriority.label).toBe('Readiness 근거 설명');
  });
});
