import { describe, it, expect, vi, beforeEach } from 'vitest';

// getKSTDate를 모킹하여 테스트 결과를 결정적으로 만든다
vi.mock('@/lib/date-utils', () => ({
  getKSTDate: vi.fn(() => '2026-03-29'),
}));

import {
  createSchedule,
  advanceSchedule,
  isDueToday,
  isGroupComplete,
  getNextScenarioId,
  daysUntilReview,
} from '@/lib/spaced-scenario';
import type { SpacedScenarioSchedule, ScenarioGroup } from '@/types/scenario';

const TODAY = '2026-03-29';

function makeGroup(overrides: Partial<ScenarioGroup> = {}): ScenarioGroup {
  return {
    groupId: 'g1',
    principle: '긍정적 행동지원',
    description: '테스트 그룹',
    scenarioIds: ['s1', 's2', 's3'],
    ...overrides,
  };
}

function makeSchedule(overrides: Partial<SpacedScenarioSchedule> = {}): SpacedScenarioSchedule {
  return {
    groupId: 'g1',
    currentIndex: 0,
    nextReviewDate: TODAY,
    intervalDays: 1,
    completedScenarioIds: [],
    ...overrides,
  };
}

describe('spaced-scenario', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── createSchedule ───────────────────────────────────────────
  describe('createSchedule', () => {
    it('기본 스케줄 생성 — 오늘이 첫 리뷰일, 인터벌 1일', () => {
      const schedule = createSchedule('g1');
      expect(schedule).toEqual({
        groupId: 'g1',
        currentIndex: 0,
        nextReviewDate: TODAY,
        intervalDays: 1,
        completedScenarioIds: [],
      });
    });

    it('다른 groupId로 생성', () => {
      const schedule = createSchedule('abc-123');
      expect(schedule.groupId).toBe('abc-123');
    });

    it('빈 문자열 groupId도 허용', () => {
      const schedule = createSchedule('');
      expect(schedule.groupId).toBe('');
      expect(schedule.currentIndex).toBe(0);
    });
  });

  // ─── advanceSchedule ─────────────────────────────────────────
  describe('advanceSchedule', () => {
    it('합격(score >= 0.6) — 다음 시나리오 + 인터벌 증가(1→3)', () => {
      const schedule = makeSchedule({ intervalDays: 1 });
      const group = makeGroup();
      const result = advanceSchedule(schedule, group, 's1', 0.8);

      expect(result.currentIndex).toBe(1);
      expect(result.intervalDays).toBe(3);
      expect(result.completedScenarioIds).toContain('s1');
    });

    it('합격 — 인터벌 3→7 증가', () => {
      const schedule = makeSchedule({ currentIndex: 1, intervalDays: 3, completedScenarioIds: ['s1'] });
      const group = makeGroup();
      const result = advanceSchedule(schedule, group, 's2', 0.6);

      expect(result.intervalDays).toBe(7);
      expect(result.completedScenarioIds).toEqual(['s1', 's2']);
    });

    it('합격 — 인터벌 14에서 최대 유지', () => {
      const schedule = makeSchedule({ currentIndex: 2, intervalDays: 14, completedScenarioIds: ['s1', 's2'] });
      const group = makeGroup();
      const result = advanceSchedule(schedule, group, 's3', 1.0);

      expect(result.intervalDays).toBe(14);
    });

    it('합격 — 마지막 시나리오에서 currentIndex 클램프', () => {
      const schedule = makeSchedule({ currentIndex: 2, intervalDays: 1, completedScenarioIds: ['s1', 's2'] });
      const group = makeGroup(); // scenarioIds.length === 3
      const result = advanceSchedule(schedule, group, 's3', 0.9);

      expect(result.currentIndex).toBe(2); // Math.min(3, 3-1) = 2
    });

    it('합격 — 이미 완료한 시나리오는 중복 추가 안 함', () => {
      const schedule = makeSchedule({ completedScenarioIds: ['s1'] });
      const group = makeGroup();
      const result = advanceSchedule(schedule, group, 's1', 0.7);

      expect(result.completedScenarioIds).toEqual(['s1']);
    });

    it('불합격(score < 0.6) — 인터벌 1일로 리셋, 같은 인덱스 유지', () => {
      const schedule = makeSchedule({ currentIndex: 1, intervalDays: 7 });
      const group = makeGroup();
      const result = advanceSchedule(schedule, group, 's2', 0.5);

      expect(result.currentIndex).toBe(1);
      expect(result.intervalDays).toBe(1);
    });

    it('불합격 — completedScenarioIds 변경 없음', () => {
      const schedule = makeSchedule({ completedScenarioIds: ['s1'] });
      const group = makeGroup();
      const result = advanceSchedule(schedule, group, 's2', 0.0);

      expect(result.completedScenarioIds).toEqual(['s1']);
    });

    it('정확히 0.6 경계값 — 합격 처리', () => {
      const schedule = makeSchedule();
      const group = makeGroup();
      const result = advanceSchedule(schedule, group, 's1', 0.6);

      expect(result.currentIndex).toBe(1); // 합격이므로 진행
    });

    it('0.59 — 불합격 처리', () => {
      const schedule = makeSchedule();
      const group = makeGroup();
      const result = advanceSchedule(schedule, group, 's1', 0.59);

      expect(result.currentIndex).toBe(0); // 불합격이므로 유지
      expect(result.intervalDays).toBe(1);
    });

    it('원본 schedule 불변 — immutability', () => {
      const original = makeSchedule();
      const group = makeGroup();
      advanceSchedule(original, group, 's1', 0.8);

      expect(original.completedScenarioIds).toEqual([]);
      expect(original.currentIndex).toBe(0);
    });
  });

  // ─── isDueToday ───────────────────────────────────────────────
  describe('isDueToday', () => {
    it('리뷰일이 오늘 — true', () => {
      const schedule = makeSchedule({ nextReviewDate: TODAY });
      expect(isDueToday(schedule)).toBe(true);
    });

    it('리뷰일이 과거 — true (밀린 리뷰)', () => {
      const schedule = makeSchedule({ nextReviewDate: '2026-03-20' });
      expect(isDueToday(schedule)).toBe(true);
    });

    it('리뷰일이 미래 — false', () => {
      const schedule = makeSchedule({ nextReviewDate: '2026-04-01' });
      expect(isDueToday(schedule)).toBe(false);
    });
  });

  // ─── isGroupComplete ─────────────────────────────────────────
  describe('isGroupComplete', () => {
    it('전체 완료 — true', () => {
      const schedule = makeSchedule({ completedScenarioIds: ['s1', 's2', 's3'] });
      const group = makeGroup();
      expect(isGroupComplete(schedule, group)).toBe(true);
    });

    it('일부 완료 — false', () => {
      const schedule = makeSchedule({ completedScenarioIds: ['s1'] });
      const group = makeGroup();
      expect(isGroupComplete(schedule, group)).toBe(false);
    });

    it('빈 완료 목록 — false', () => {
      const schedule = makeSchedule();
      const group = makeGroup();
      expect(isGroupComplete(schedule, group)).toBe(false);
    });

    it('완료 수가 시나리오 수 초과해도 true', () => {
      const schedule = makeSchedule({ completedScenarioIds: ['s1', 's2', 's3', 's4'] });
      const group = makeGroup(); // 3개
      expect(isGroupComplete(schedule, group)).toBe(true);
    });

    it('시나리오 0개 그룹 — 완료 목록 0개면 true', () => {
      const schedule = makeSchedule();
      const group = makeGroup({ scenarioIds: [] });
      expect(isGroupComplete(schedule, group)).toBe(true);
    });
  });

  // ─── getNextScenarioId ────────────────────────────────────────
  describe('getNextScenarioId', () => {
    it('첫 번째 시나리오 반환', () => {
      const schedule = makeSchedule({ currentIndex: 0 });
      const group = makeGroup();
      expect(getNextScenarioId(schedule, group)).toBe('s1');
    });

    it('중간 시나리오 반환', () => {
      const schedule = makeSchedule({ currentIndex: 1 });
      const group = makeGroup();
      expect(getNextScenarioId(schedule, group)).toBe('s2');
    });

    it('인덱스가 scenarioIds 범위 밖 — null', () => {
      const schedule = makeSchedule({ currentIndex: 3 });
      const group = makeGroup(); // length === 3
      expect(getNextScenarioId(schedule, group)).toBeNull();
    });

    it('빈 시나리오 그룹 — null', () => {
      const schedule = makeSchedule({ currentIndex: 0 });
      const group = makeGroup({ scenarioIds: [] });
      expect(getNextScenarioId(schedule, group)).toBeNull();
    });
  });

  // ─── daysUntilReview ──────────────────────────────────────────
  describe('daysUntilReview', () => {
    it('오늘이 리뷰일 — 0일', () => {
      const schedule = makeSchedule({ nextReviewDate: TODAY });
      expect(daysUntilReview(schedule)).toBe(0);
    });

    it('리뷰일이 3일 뒤 — 3', () => {
      const schedule = makeSchedule({ nextReviewDate: '2026-04-01' });
      expect(daysUntilReview(schedule)).toBe(3);
    });

    it('리뷰일이 과거 — 0 (음수는 0으로 클램프)', () => {
      const schedule = makeSchedule({ nextReviewDate: '2026-03-20' });
      expect(daysUntilReview(schedule)).toBe(0);
    });

    it('리뷰일이 1일 뒤 — 1', () => {
      const schedule = makeSchedule({ nextReviewDate: '2026-03-30' });
      expect(daysUntilReview(schedule)).toBe(1);
    });
  });
});
