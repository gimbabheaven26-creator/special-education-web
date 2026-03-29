import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from '@testing-library/react';

// ─── Mocks ─────────────────────────────────────────────────────────────────

const { mockTodayRef } = vi.hoisted(() => {
  const mockTodayRef = { value: '2026-03-29' };
  return { mockTodayRef };
});

vi.mock('@/lib/date-utils', () => ({
  getKSTDate: (date?: Date) => {
    if (date) {
      return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(date);
    }
    return mockTodayRef.value;
  },
  getToday: () => mockTodayRef.value,
}));

// ─── Store import (after mocks) ────────────────────────────────────────────

import { useStudyStore } from '../useStudyStore';
import { XP_PER_QUIZ, XP_PER_CORRECT, XP_PER_CHAPTER } from '@/lib/study/xp-constants';

// ─── Helpers ───────────────────────────────────────────────────────────────

function getState() {
  return useStudyStore.getState();
}

function resetStore() {
  useStudyStore.setState({
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    dailyProgress: { date: mockTodayRef.value, chaptersCompleted: 0, quizzesCompleted: 0, quizzesCorrect: 0 },
    dailyGoal: { chapters: 2, quizzes: 10 },
    recentActivities: [],
    totalXP: 0,
    totalQuizzes: 0,
    totalCorrect: 0,
    dailyHistory: [],
    scenarioProgress: {},
    spacedScenarioSchedules: {},
    completedChapters: {},
  });
}

function setToday(date: string) {
  mockTodayRef.value = date;
}

// ─── Setup / Teardown ──────────────────────────────────────────────────────

beforeEach(() => {
  setToday('2026-03-29');
  resetStore();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ═══════════════════════════════════════════════════════════════════════════
// 1. 초기 상태
// ═══════════════════════════════════════════════════════════════════════════

describe('초기 상태', () => {
  it('기본 스트릭 값', () => {
    const s = getState();
    expect(s.currentStreak).toBe(0);
    expect(s.longestStreak).toBe(0);
    expect(s.lastActiveDate).toBeNull();
  });

  it('기본 일일 진행도', () => {
    const s = getState();
    expect(s.dailyProgress).toEqual({
      date: '2026-03-29',
      chaptersCompleted: 0,
      quizzesCompleted: 0,
      quizzesCorrect: 0,
    });
  });

  it('기본 일일 목표', () => {
    expect(getState().dailyGoal).toEqual({ chapters: 2, quizzes: 10 });
  });

  it('기본 통계', () => {
    const s = getState();
    expect(s.totalXP).toBe(0);
    expect(s.totalQuizzes).toBe(0);
    expect(s.totalCorrect).toBe(0);
  });

  it('빈 배열/객체 초기화', () => {
    const s = getState();
    expect(s.recentActivities).toEqual([]);
    expect(s.dailyHistory).toEqual([]);
    expect(s.scenarioProgress).toEqual({});
    expect(s.spacedScenarioSchedules).toEqual({});
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. recordActivity
// ═══════════════════════════════════════════════════════════════════════════

describe('recordActivity', () => {
  const activity1 = {
    subjectSlug: 'diagnosis',
    subjectTitle: '진단평가',
    chapterSlug: 'ch1',
    chapterTitle: '지능 검사',
  };

  const activity2 = {
    subjectSlug: 'behavior',
    subjectTitle: '행동지원',
    chapterSlug: 'ch1',
    chapterTitle: '긍정적 행동지원',
  };

  it('활동 기록 추가', () => {
    act(() => getState().recordActivity(activity1));

    const s = getState();
    expect(s.recentActivities).toHaveLength(1);
    expect(s.recentActivities[0].subjectSlug).toBe('diagnosis');
    expect(s.recentActivities[0].timestamp).toBeGreaterThan(0);
  });

  it('같은 과목+챕터 중복 제거 — 최신만 유지', () => {
    act(() => getState().recordActivity(activity1));
    act(() => getState().recordActivity(activity1));

    expect(getState().recentActivities).toHaveLength(1);
  });

  it('최대 5개까지 유지', () => {
    for (let i = 0; i < 7; i++) {
      act(() =>
        getState().recordActivity({
          subjectSlug: `sub-${i}`,
          subjectTitle: `과목${i}`,
          chapterSlug: `ch-${i}`,
          chapterTitle: `챕터${i}`,
        })
      );
    }

    expect(getState().recentActivities).toHaveLength(5);
    // 가장 최근 것이 첫 번째
    expect(getState().recentActivities[0].subjectSlug).toBe('sub-6');
  });

  it('서로 다른 과목은 개별 보존', () => {
    act(() => getState().recordActivity(activity1));
    act(() => getState().recordActivity(activity2));

    expect(getState().recentActivities).toHaveLength(2);
    expect(getState().recentActivities[0].subjectSlug).toBe('behavior');
    expect(getState().recentActivities[1].subjectSlug).toBe('diagnosis');
  });

  it('스트릭 업데이트 — 첫 활동', () => {
    act(() => getState().recordActivity(activity1));

    const s = getState();
    expect(s.currentStreak).toBe(1);
    expect(s.longestStreak).toBe(1);
    expect(s.lastActiveDate).toBe('2026-03-29');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. recordQuizResult
// ═══════════════════════════════════════════════════════════════════════════

describe('recordQuizResult', () => {
  it('정답 — XP = XP_PER_QUIZ + XP_PER_CORRECT', () => {
    act(() => getState().recordQuizResult(true));

    const s = getState();
    expect(s.totalXP).toBe(XP_PER_QUIZ + XP_PER_CORRECT);
    expect(s.totalQuizzes).toBe(1);
    expect(s.totalCorrect).toBe(1);
  });

  it('오답 — XP = XP_PER_QUIZ만', () => {
    act(() => getState().recordQuizResult(false));

    const s = getState();
    expect(s.totalXP).toBe(XP_PER_QUIZ);
    expect(s.totalQuizzes).toBe(1);
    expect(s.totalCorrect).toBe(0);
  });

  it('일일 진행도 갱신', () => {
    act(() => getState().recordQuizResult(true));
    act(() => getState().recordQuizResult(false));

    const dp = getState().dailyProgress;
    expect(dp.quizzesCompleted).toBe(2);
    expect(dp.quizzesCorrect).toBe(1);
  });

  it('dailyHistory 항목 생성', () => {
    act(() => getState().recordQuizResult(true));

    const history = getState().dailyHistory;
    expect(history).toHaveLength(1);
    expect(history[0]).toEqual({
      date: '2026-03-29',
      questionsAttempted: 1,
      questionsCorrect: 1,
      xpEarned: XP_PER_QUIZ + XP_PER_CORRECT,
    });
  });

  it('같은 날 여러 번 — dailyHistory 항목 병합', () => {
    act(() => getState().recordQuizResult(true));
    act(() => getState().recordQuizResult(false));
    act(() => getState().recordQuizResult(true));

    const history = getState().dailyHistory;
    expect(history).toHaveLength(1);
    expect(history[0].questionsAttempted).toBe(3);
    expect(history[0].questionsCorrect).toBe(2);
    expect(history[0].xpEarned).toBe(
      (XP_PER_QUIZ + XP_PER_CORRECT) * 2 + XP_PER_QUIZ
    );
  });

  it('다른 날 — dailyHistory 항목 별도 생성', () => {
    act(() => getState().recordQuizResult(true));

    setToday('2026-03-30');
    act(() => getState().recordQuizResult(false));

    const history = getState().dailyHistory;
    expect(history).toHaveLength(2);
    expect(history[0].date).toBe('2026-03-29');
    expect(history[1].date).toBe('2026-03-30');
  });

  it('dailyHistory 최대 365일 — 오래된 항목 제거', () => {
    // Seed 365 entries
    const entries = Array.from({ length: 365 }, (_, i) => ({
      date: `2025-${String(Math.floor(i / 28) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
      questionsAttempted: 1,
      questionsCorrect: 1,
      xpEarned: 10,
    }));

    useStudyStore.setState({ dailyHistory: entries }, false);

    // Adding one more should evict oldest
    act(() => getState().recordQuizResult(true));

    const history = getState().dailyHistory;
    expect(history).toHaveLength(365);
    // First entry should no longer be the original first
    expect(history[0].date).not.toBe(entries[0].date);
  });

  it('날짜가 바뀌면 dailyProgress 리셋', () => {
    act(() => getState().recordQuizResult(true));

    expect(getState().dailyProgress.quizzesCompleted).toBe(1);

    setToday('2026-03-30');
    act(() => getState().recordQuizResult(true));

    const dp = getState().dailyProgress;
    expect(dp.date).toBe('2026-03-30');
    expect(dp.quizzesCompleted).toBe(1); // 리셋 후 1
    expect(dp.quizzesCorrect).toBe(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. recordChapterComplete
// ═══════════════════════════════════════════════════════════════════════════

describe('recordChapterComplete', () => {
  it('XP 증가 = XP_PER_CHAPTER', () => {
    act(() => getState().recordChapterComplete());

    expect(getState().totalXP).toBe(XP_PER_CHAPTER);
  });

  it('일일 chaptersCompleted 증가', () => {
    act(() => getState().recordChapterComplete());
    act(() => getState().recordChapterComplete());

    expect(getState().dailyProgress.chaptersCompleted).toBe(2);
  });

  it('스트릭 업데이트', () => {
    act(() => getState().recordChapterComplete());

    expect(getState().currentStreak).toBe(1);
    expect(getState().lastActiveDate).toBe('2026-03-29');
  });

  it('날짜가 바뀌면 dailyProgress 리셋', () => {
    act(() => getState().recordChapterComplete());
    expect(getState().dailyProgress.chaptersCompleted).toBe(1);

    setToday('2026-03-30');
    act(() => getState().recordChapterComplete());

    expect(getState().dailyProgress.date).toBe('2026-03-30');
    expect(getState().dailyProgress.chaptersCompleted).toBe(1); // 리셋 후 1
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4.5 markChapterCompleted / isChapterCompleted
// ═══════════════════════════════════════════════════════════════════════════

describe('markChapterCompleted / isChapterCompleted', () => {
  it('챕터 완료 기록', () => {
    act(() => getState().markChapterCompleted('통합교육', 'ch-1'));

    expect(getState().completedChapters['통합교육']).toEqual(['ch-1']);
    expect(getState().isChapterCompleted('통합교육', 'ch-1')).toBe(true);
  });

  it('같은 과목 여러 챕터 기록', () => {
    act(() => getState().markChapterCompleted('통합교육', 'ch-1'));
    act(() => getState().markChapterCompleted('통합교육', 'ch-2'));

    expect(getState().completedChapters['통합교육']).toEqual(['ch-1', 'ch-2']);
  });

  it('중복 챕터 무시', () => {
    act(() => getState().markChapterCompleted('통합교육', 'ch-1'));
    act(() => getState().markChapterCompleted('통합교육', 'ch-1'));

    expect(getState().completedChapters['통합교육']).toEqual(['ch-1']);
  });

  it('다른 과목은 독립', () => {
    act(() => getState().markChapterCompleted('통합교육', 'ch-1'));
    act(() => getState().markChapterCompleted('행동지원', 'ch-a'));

    expect(getState().completedChapters['통합교육']).toEqual(['ch-1']);
    expect(getState().completedChapters['행동지원']).toEqual(['ch-a']);
  });

  it('미완료 챕터는 false', () => {
    expect(getState().isChapterCompleted('통합교육', 'ch-1')).toBe(false);
  });

  it('미등록 과목은 false', () => {
    expect(getState().isChapterCompleted('존재안함', 'ch-1')).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. recordStudyTime
// ═══════════════════════════════════════════════════════════════════════════

describe('recordStudyTime', () => {
  it('dailyHistory에 학습 시간 기록', () => {
    act(() => getState().recordStudyTime(30));

    const history = getState().dailyHistory;
    expect(history).toHaveLength(1);
    expect(history[0]).toEqual({
      date: '2026-03-29',
      questionsAttempted: 0,
      questionsCorrect: 0,
      xpEarned: 0,
      studyTimeMinutes: 30,
    });
  });

  it('같은 날 누적', () => {
    act(() => getState().recordStudyTime(15));
    act(() => getState().recordStudyTime(20));

    const history = getState().dailyHistory;
    expect(history).toHaveLength(1);
    expect(history[0].studyTimeMinutes).toBe(35);
  });

  it('기존 dailyHistory 항목이 있으면 studyTimeMinutes만 추가', () => {
    // 퀴즈 결과 기록으로 dailyHistory 항목 생성
    act(() => getState().recordQuizResult(true));
    act(() => getState().recordStudyTime(10));

    const history = getState().dailyHistory;
    expect(history).toHaveLength(1);
    expect(history[0].questionsAttempted).toBe(1);
    expect(history[0].studyTimeMinutes).toBe(10);
  });

  it('0 이하 분은 무시', () => {
    act(() => getState().recordStudyTime(0));
    act(() => getState().recordStudyTime(-5));

    expect(getState().dailyHistory).toHaveLength(0);
  });

  it('다른 날에는 별도 항목 생성', () => {
    act(() => getState().recordStudyTime(10));

    setToday('2026-03-30');
    act(() => getState().recordStudyTime(20));

    const history = getState().dailyHistory;
    expect(history).toHaveLength(2);
    expect(history[0].studyTimeMinutes).toBe(10);
    expect(history[1].studyTimeMinutes).toBe(20);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. setDailyGoal
// ═══════════════════════════════════════════════════════════════════════════

describe('setDailyGoal', () => {
  it('목표 설정', () => {
    act(() => getState().setDailyGoal(3, 15));

    expect(getState().dailyGoal).toEqual({ chapters: 3, quizzes: 15 });
  });

  it('최소값 1로 클램프', () => {
    act(() => getState().setDailyGoal(0, -5));

    expect(getState().dailyGoal).toEqual({ chapters: 1, quizzes: 1 });
  });

  it('소수점 반올림', () => {
    act(() => getState().setDailyGoal(2.7, 4.3));

    expect(getState().dailyGoal).toEqual({ chapters: 3, quizzes: 4 });
  });

  it('소수점 반올림 후 최소값 적용', () => {
    act(() => getState().setDailyGoal(0.3, 0.4));

    // Math.round(0.3) = 0 → Math.max(1, 0) = 1
    expect(getState().dailyGoal).toEqual({ chapters: 1, quizzes: 1 });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 7. getDailyHistory
// ═══════════════════════════════════════════════════════════════════════════

describe('getDailyHistory', () => {
  beforeEach(() => {
    useStudyStore.setState({
      dailyHistory: [
        { date: '2026-03-27', questionsAttempted: 5, questionsCorrect: 3, xpEarned: 65 },
        { date: '2026-03-28', questionsAttempted: 10, questionsCorrect: 8, xpEarned: 140 },
        { date: '2026-03-29', questionsAttempted: 3, questionsCorrect: 2, xpEarned: 35 },
      ],
    }, false);
  });

  it('최근 N일 반환', () => {
    const result = getState().getDailyHistory(2);
    expect(result).toHaveLength(2);
    expect(result[0].date).toBe('2026-03-28');
    expect(result[1].date).toBe('2026-03-29');
  });

  it('전체보다 큰 수 요청 시 전체 반환', () => {
    const result = getState().getDailyHistory(100);
    expect(result).toHaveLength(3);
  });

  it('0 요청 시 빈 배열', () => {
    const result = getState().getDailyHistory(0);
    expect(result).toEqual([]);
  });

  it('음수 요청 시 빈 배열', () => {
    const result = getState().getDailyHistory(-1);
    expect(result).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 8. 스트릭 (updateStreak 로직)
// ═══════════════════════════════════════════════════════════════════════════

describe('스트릭 관리', () => {
  it('같은 날 여러 활동 — 스트릭 변동 없음', () => {
    act(() => getState().recordQuizResult(true));
    act(() => getState().recordQuizResult(true));
    act(() => getState().recordChapterComplete());

    expect(getState().currentStreak).toBe(1);
  });

  it('연속일 활동 — 스트릭 증가', () => {
    setToday('2026-03-28');
    act(() => getState().recordQuizResult(true));
    expect(getState().currentStreak).toBe(1);

    setToday('2026-03-29');
    act(() => getState().recordQuizResult(true));
    expect(getState().currentStreak).toBe(2);
    expect(getState().longestStreak).toBe(2);
  });

  it('하루 건너뜀 — 스트릭 리셋', () => {
    setToday('2026-03-27');
    act(() => getState().recordQuizResult(true));
    expect(getState().currentStreak).toBe(1);

    // 28일 건너뜀
    setToday('2026-03-29');
    act(() => getState().recordQuizResult(true));
    expect(getState().currentStreak).toBe(1); // 리셋
  });

  it('longestStreak 보존', () => {
    // 3일 연속
    setToday('2026-03-27');
    act(() => getState().recordQuizResult(true));

    setToday('2026-03-28');
    act(() => getState().recordQuizResult(true));

    setToday('2026-03-29');
    act(() => getState().recordQuizResult(true));

    expect(getState().longestStreak).toBe(3);

    // 하루 건너뜀 → 리셋
    setToday('2026-03-31');
    act(() => getState().recordQuizResult(true));

    expect(getState().currentStreak).toBe(1);
    expect(getState().longestStreak).toBe(3); // 보존
  });

  it('lastActiveDate가 null일 때 — 스트릭 1로 시작', () => {
    expect(getState().lastActiveDate).toBeNull();

    act(() => getState().recordQuizResult(true));

    expect(getState().currentStreak).toBe(1);
    expect(getState().lastActiveDate).toBe('2026-03-29');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 9. saveScenarioProgress
// ═══════════════════════════════════════════════════════════════════════════

describe('saveScenarioProgress', () => {
  const baseProgress = {
    scenarioId: 'scenario-1',
    visitedNodeIds: ['node-1', 'node-2'],
    optimalCount: 2,
    totalChoices: 3,
    xpEarned: 15,
    completedAt: Date.now(),
    startedAt: Date.now() - 60000,
  } as const;

  it('새 시나리오 진행 저장', () => {
    act(() => getState().saveScenarioProgress(baseProgress));

    const sp = getState().scenarioProgress;
    expect(sp['scenario-1']).toEqual(baseProgress);
  });

  it('더 높은 점수 → 업데이트', () => {
    act(() => getState().saveScenarioProgress(baseProgress));

    const better = { ...baseProgress, optimalCount: 3 };
    act(() => getState().saveScenarioProgress(better));

    expect(getState().scenarioProgress['scenario-1'].optimalCount).toBe(3);
  });

  it('더 낮은 점수 → 업데이트 안 됨', () => {
    act(() => getState().saveScenarioProgress(baseProgress));

    const worse = { ...baseProgress, optimalCount: 1 };
    act(() => getState().saveScenarioProgress(worse));

    // 기존 2/3 > 1/3 이므로 업데이트 안 됨
    expect(getState().scenarioProgress['scenario-1'].optimalCount).toBe(2);
  });

  it('기존이 completedAt == null이면 무조건 업데이트', () => {
    const incomplete = { ...baseProgress, completedAt: null };
    act(() => getState().saveScenarioProgress(incomplete));

    expect(getState().scenarioProgress['scenario-1'].completedAt).toBeNull();

    // 점수가 낮아도 completedAt이 null이면 업데이트
    const lowerButComplete = { ...baseProgress, optimalCount: 1, completedAt: Date.now() };
    act(() => getState().saveScenarioProgress(lowerButComplete));

    expect(getState().scenarioProgress['scenario-1'].completedAt).not.toBeNull();
  });

  it('서로 다른 시나리오는 독립', () => {
    act(() => getState().saveScenarioProgress(baseProgress));
    act(() =>
      getState().saveScenarioProgress({ ...baseProgress, scenarioId: 'scenario-2' })
    );

    const sp = getState().scenarioProgress;
    expect(Object.keys(sp)).toHaveLength(2);
    expect(sp['scenario-1']).toBeDefined();
    expect(sp['scenario-2']).toBeDefined();
  });

  it('totalChoices 0일 때 — 업데이트 안 됨 (0 나누기 방지)', () => {
    act(() => getState().saveScenarioProgress(baseProgress));

    const zeroChoices = { ...baseProgress, optimalCount: 0, totalChoices: 0 };
    act(() => getState().saveScenarioProgress(zeroChoices));

    // 0/0 = NaN > 2/3 은 false → 업데이트 안 됨
    expect(getState().scenarioProgress['scenario-1'].optimalCount).toBe(2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 10. saveSpacedSchedule
// ═══════════════════════════════════════════════════════════════════════════

describe('saveSpacedSchedule', () => {
  const schedule = {
    groupId: 'group-1',
    currentIndex: 0,
    nextReviewDate: '2026-04-01',
    intervalDays: 3,
    completedScenarioIds: ['s1'],
  } as const;

  it('새 스케줄 저장', () => {
    act(() => getState().saveSpacedSchedule(schedule));

    expect(getState().spacedScenarioSchedules['group-1']).toEqual(schedule);
  });

  it('기존 스케줄 덮어쓰기', () => {
    act(() => getState().saveSpacedSchedule(schedule));

    const updated = { ...schedule, currentIndex: 1, intervalDays: 7 };
    act(() => getState().saveSpacedSchedule(updated));

    const saved = getState().spacedScenarioSchedules['group-1'];
    expect(saved.currentIndex).toBe(1);
    expect(saved.intervalDays).toBe(7);
  });

  it('서로 다른 그룹은 독립', () => {
    act(() => getState().saveSpacedSchedule(schedule));
    act(() =>
      getState().saveSpacedSchedule({ ...schedule, groupId: 'group-2' })
    );

    expect(Object.keys(getState().spacedScenarioSchedules)).toHaveLength(2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 11. persist 미들웨어
// ═══════════════════════════════════════════════════════════════════════════

describe('persist 설정', () => {
  it('persist name = "special-edu-study"', () => {
    // Zustand persist는 스토어에 persist 메타데이터를 노출한다
    const persistApi = (useStudyStore as unknown as { persist: { getOptions: () => { name: string } } }).persist;
    expect(persistApi.getOptions().name).toBe('special-edu-study');
  });

  it('persist version = 6', () => {
    const persistApi = (useStudyStore as unknown as { persist: { getOptions: () => { version: number } } }).persist;
    expect(persistApi.getOptions().version).toBe(6);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 12. migrate 함수
// ═══════════════════════════════════════════════════════════════════════════

describe('migrate', () => {
  it('version < 2 — dailyHistory 필드 추가', () => {
    const persistApi = (useStudyStore as unknown as { persist: { getOptions: () => { migrate: (s: unknown, v: number) => unknown } } }).persist;
    const migrate = persistApi.getOptions().migrate;

    const oldState = { currentStreak: 5 };
    const migrated = migrate(oldState, 1) as Record<string, unknown>;

    expect(migrated.dailyHistory).toEqual([]);
    expect(migrated.currentStreak).toBe(5);
  });

  it('version < 2 — 기존 dailyHistory 보존', () => {
    const persistApi = (useStudyStore as unknown as { persist: { getOptions: () => { migrate: (s: unknown, v: number) => unknown } } }).persist;
    const migrate = persistApi.getOptions().migrate;

    const existing = [{ date: '2026-01-01', questionsAttempted: 1, questionsCorrect: 1, xpEarned: 15 }];
    const oldState = { dailyHistory: existing };
    const migrated = migrate(oldState, 1) as Record<string, unknown>;

    expect(migrated.dailyHistory).toEqual(existing);
  });

  it('version < 3 — scenarioProgress 필드 추가', () => {
    const persistApi = (useStudyStore as unknown as { persist: { getOptions: () => { migrate: (s: unknown, v: number) => unknown } } }).persist;
    const migrate = persistApi.getOptions().migrate;

    const migrated = migrate({}, 2) as Record<string, unknown>;
    expect(migrated.scenarioProgress).toEqual({});
  });

  it('version < 4 — spacedScenarioSchedules 필드 추가', () => {
    const persistApi = (useStudyStore as unknown as { persist: { getOptions: () => { migrate: (s: unknown, v: number) => unknown } } }).persist;
    const migrate = persistApi.getOptions().migrate;

    const migrated = migrate({}, 3) as Record<string, unknown>;
    expect(migrated.spacedScenarioSchedules).toEqual({});
  });

  it('version < 6 — completedChapters 필드 추가', () => {
    const persistApi = (useStudyStore as unknown as { persist: { getOptions: () => { migrate: (s: unknown, v: number) => unknown } } }).persist;
    const migrate = persistApi.getOptions().migrate;

    const migrated = migrate({}, 5) as Record<string, unknown>;
    expect(migrated.completedChapters).toEqual({});
  });

  it('version 1 → 6 — 모든 마���그레이션 순차 적용', () => {
    const persistApi = (useStudyStore as unknown as { persist: { getOptions: () => { migrate: (s: unknown, v: number) => unknown } } }).persist;
    const migrate = persistApi.getOptions().migrate;

    const migrated = migrate({ totalXP: 100 }, 1) as Record<string, unknown>;

    expect(migrated.totalXP).toBe(100);
    expect(migrated.dailyHistory).toEqual([]);
    expect(migrated.scenarioProgress).toEqual({});
    expect(migrated.spacedScenarioSchedules).toEqual({});
    expect(migrated.completedChapters).toEqual({});
  });

  it('현재 버��이면 마이그레이션 없음', () => {
    const persistApi = (useStudyStore as unknown as { persist: { getOptions: () => { migrate: (s: unknown, v: number) => unknown } } }).persist;
    const migrate = persistApi.getOptions().migrate;

    const state = { totalXP: 200 };
    const migrated = migrate(state, 6) as Record<string, unknown>;

    // 추가 필드 없음 (이미 최신)
    expect(migrated).toEqual({ totalXP: 200 });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 13. 복합 시나리오
// ═══════════════════════════════════════════════════════════════════════════

describe('복합 시나리오', () => {
  it('퀴즈 + 챕터 완료 XP 합산', () => {
    act(() => getState().recordQuizResult(true));  // 15 XP
    act(() => getState().recordQuizResult(false)); // 10 XP
    act(() => getState().recordChapterComplete());  // 20 XP

    expect(getState().totalXP).toBe(XP_PER_QUIZ + XP_PER_CORRECT + XP_PER_QUIZ + XP_PER_CHAPTER);
    expect(getState().totalXP).toBe(45);
  });

  it('여러 날에 걸친 학습 통합 시나리오', () => {
    // Day 1
    setToday('2026-03-27');
    resetStore();
    act(() => getState().recordQuizResult(true));
    act(() => getState().recordChapterComplete());
    act(() => getState().recordStudyTime(30));

    // Day 2
    setToday('2026-03-28');
    act(() => getState().recordQuizResult(false));
    act(() => getState().recordStudyTime(45));

    // Day 3
    setToday('2026-03-29');
    act(() => getState().recordQuizResult(true));

    const s = getState();
    expect(s.currentStreak).toBe(3);
    expect(s.longestStreak).toBe(3);
    expect(s.totalQuizzes).toBe(3);
    expect(s.totalCorrect).toBe(2);
    expect(s.totalXP).toBe(
      (XP_PER_QUIZ + XP_PER_CORRECT) + XP_PER_CHAPTER +  // Day 1
      XP_PER_QUIZ +                                         // Day 2
      (XP_PER_QUIZ + XP_PER_CORRECT)                       // Day 3
    );
    expect(s.dailyHistory).toHaveLength(3);
    expect(s.dailyHistory[0].studyTimeMinutes).toBe(30);
    expect(s.dailyHistory[1].studyTimeMinutes).toBe(45);
  });

  it('불변성 — 원본 state 객체가 변경되지 않음', () => {
    const before = getState();
    const beforeActivities = before.recentActivities;
    const beforeHistory = before.dailyHistory;

    act(() =>
      getState().recordActivity({
        subjectSlug: 'test',
        subjectTitle: 'Test',
        chapterSlug: 'ch',
        chapterTitle: 'Ch',
      })
    );

    // 새 참조여야 함
    expect(getState().recentActivities).not.toBe(beforeActivities);
    expect(getState().dailyHistory).toBe(beforeHistory); // recordActivity는 dailyHistory 안 바꿈
  });
});
