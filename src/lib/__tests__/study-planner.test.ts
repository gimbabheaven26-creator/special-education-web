import { describe, test, expect, vi, beforeEach } from 'vitest';

// Mock date-utils to control "today"
let mockToday = '2026-03-28';
vi.mock('@/lib/date-utils', () => ({
  getKSTDate: (date?: Date) => {
    if (date) {
      return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(date);
    }
    return mockToday;
  },
}));

import {
  generateStudyPlan,
  getCurrentWeekMilestone,
  getEncouragementMessage,
  getSubjectTitle,
  getSubjectWeight,
  getAllSubjectSlugs,
  getNextExamDate,
} from '../study-planner';

beforeEach(() => {
  mockToday = '2026-03-28';
});

// ─── generateStudyPlan ───

describe('generateStudyPlan', () => {
  test('beginner 레벨에서 유효한 StudyPlan 반환', () => {
    const plan = generateStudyPlan('2026-06-28', 'beginner', []);
    expect(plan.level).toBe('beginner');
    expect(plan.examDate).toBe('2026-06-28');
    expect(plan.createdAt).toBe('2026-03-28');
    expect(plan.dailyQuizTarget).toBe(10);
    expect(plan.dailyChapterTarget).toBe(1);
    expect(plan.dailyQuestionsTarget).toBe(20);
    expect(plan.weeklyMilestones.length).toBeGreaterThan(0);
  });

  test('intermediate 레벨 dailyQuizTarget = 15', () => {
    const plan = generateStudyPlan('2026-06-28', 'intermediate', []);
    expect(plan.dailyQuizTarget).toBe(15);
    expect(plan.dailyChapterTarget).toBe(2);
  });

  test('advanced 레벨 dailyQuizTarget = 20', () => {
    const plan = generateStudyPlan('2026-06-28', 'advanced', []);
    expect(plan.dailyQuizTarget).toBe(20);
    expect(plan.dailyChapterTarget).toBe(3);
  });

  test('weakSubjects가 plan에 복사됨 (불변성)', () => {
    const weak = ['laws', 'transition'];
    const plan = generateStudyPlan('2026-06-28', 'beginner', weak);
    expect(plan.weakSubjects).toEqual(weak);
    expect(plan.weakSubjects).not.toBe(weak); // 새 배열
  });

  test('weakSubjects가 우선 배치됨 (milestones 초반)', () => {
    const plan = generateStudyPlan('2026-12-28', 'beginner', ['laws']);
    const firstSubjects = plan.weeklyMilestones
      .slice(0, 3)
      .flatMap((m) => m.subjects);
    expect(firstSubjects).toContain('laws');
  });

  test('시험일이 가까우면 주 수가 적음', () => {
    const plan = generateStudyPlan('2026-04-04', 'beginner', []);
    expect(plan.weeklyMilestones.length).toBeLessThanOrEqual(2);
  });

  test('시험일이 멀면 주 수가 많음', () => {
    const plan = generateStudyPlan('2027-03-28', 'beginner', []);
    expect(plan.weeklyMilestones.length).toBeGreaterThan(20);
  });

  test('milestones 주차 번호가 1부터 연속', () => {
    const plan = generateStudyPlan('2026-09-28', 'intermediate', ['assessment']);
    const weekNums = plan.weeklyMilestones.map((m) => m.weekNumber);
    for (let i = 0; i < weekNums.length; i++) {
      expect(weekNums[i]).toBe(i + 1);
    }
  });

  test('남은 주가 과목 수 초과 시 복습 주차 생성', () => {
    const plan = generateStudyPlan('2027-03-28', 'beginner', []);
    const reviewWeeks = plan.weeklyMilestones.filter((m) =>
      m.label.includes('복습')
    );
    expect(reviewWeeks.length).toBeGreaterThan(0);
  });

  test('복습 주차의 quizTarget = 15', () => {
    const plan = generateStudyPlan('2027-03-28', 'beginner', []);
    const reviewWeek = plan.weeklyMilestones.find((m) =>
      m.label.includes('복습')
    );
    expect(reviewWeek?.quizTarget).toBe(15);
    expect(reviewWeek?.chapterTarget).toBe(2);
  });
});

// ─── getCurrentWeekMilestone ───

describe('getCurrentWeekMilestone', () => {
  test('생성 직후 1주차 반환', () => {
    const plan = generateStudyPlan('2026-09-28', 'beginner', []);
    const milestone = getCurrentWeekMilestone(plan);
    expect(milestone?.weekNumber).toBe(1);
  });

  test('7일 후 2주차 반환', () => {
    const plan = generateStudyPlan('2026-09-28', 'beginner', []);
    mockToday = '2026-04-04';
    const milestone = getCurrentWeekMilestone(plan);
    expect(milestone?.weekNumber).toBe(2);
  });

  test('milestones 범위 초과 시 null 반환', () => {
    const plan = generateStudyPlan('2026-04-04', 'beginner', []);
    mockToday = '2027-01-01';
    const milestone = getCurrentWeekMilestone(plan);
    expect(milestone).toBeNull();
  });
});

// ─── getEncouragementMessage ───

describe('getEncouragementMessage', () => {
  test('start 메시지 반환 (문자열)', () => {
    const msg = getEncouragementMessage('start');
    expect(typeof msg).toBe('string');
    expect(msg.length).toBeGreaterThan(0);
  });

  test('progress 메시지 반환', () => {
    const msg = getEncouragementMessage('progress');
    expect(typeof msg).toBe('string');
  });

  test('complete 메시지 반환', () => {
    const msg = getEncouragementMessage('complete');
    expect(typeof msg).toBe('string');
  });

  test('missed 메시지 반환', () => {
    const msg = getEncouragementMessage('missed');
    expect(typeof msg).toBe('string');
  });

  test('params 치환: {dday}', () => {
    // 최대 100번 시도해서 {dday} 포함 메시지 찾기
    let found = false;
    for (let i = 0; i < 100; i++) {
      const msg = getEncouragementMessage('start', { dday: 100 });
      if (msg.includes('100')) {
        found = true;
        break;
      }
    }
    // start 메시지에 {dday} 치환이 있으므로 확률적으로 찾아야 함
    expect(found).toBe(true);
  });
});

// ─── getSubjectTitle / getSubjectWeight / getAllSubjectSlugs ───

describe('getSubjectTitle', () => {
  test('존재하는 slug → 한글 제목', () => {
    expect(getSubjectTitle('introduction')).toBe('특수교육학 개론');
    expect(getSubjectTitle('behavior-support')).toBe('행동지원');
  });

  test('없는 slug → slug 그대로 반환', () => {
    expect(getSubjectTitle('nonexistent')).toBe('nonexistent');
  });
});

describe('getSubjectWeight', () => {
  test('존재하는 slug → 양수 weight', () => {
    expect(getSubjectWeight('introduction')).toBe(15);
    expect(getSubjectWeight('communication-disorder')).toBe(3);
  });

  test('없는 slug → 0', () => {
    expect(getSubjectWeight('nonexistent')).toBe(0);
  });
});

describe('getAllSubjectSlugs', () => {
  test('11개 과목 slug 반환', () => {
    const slugs = getAllSubjectSlugs();
    expect(slugs.length).toBe(11);
    expect(slugs).toContain('introduction');
    expect(slugs).toContain('communication-disorder');
  });
});

// ─── getNextExamDate ───

describe('getNextExamDate', () => {
  test('3월에는 올해 11월 셋째 토요일 반환', () => {
    mockToday = '2026-03-28';
    const examDate = getNextExamDate();
    expect(examDate).toMatch(/^2026-11-\d{2}$/);
    // 2026년 11월 셋째 토요일 확인
    const date = new Date(examDate + 'T00:00:00+09:00');
    expect(date.getDay()).toBe(6); // 토요일
    expect(date.getDate()).toBeGreaterThanOrEqual(15);
    expect(date.getDate()).toBeLessThanOrEqual(21);
  });

  test('12월에는 다음 해 11월 반환', () => {
    mockToday = '2026-12-01';
    const examDate = getNextExamDate();
    expect(examDate).toMatch(/^2027-11-\d{2}$/);
    const date = new Date(examDate + 'T00:00:00+09:00');
    expect(date.getDay()).toBe(6);
  });

  test('시험일 당일에는 올해 반환', () => {
    // 2026년 11월 셋째 토요일 = 11/21
    mockToday = '2026-11-21';
    const examDate = getNextExamDate();
    expect(examDate).toMatch(/^2026-11-/);
  });
});
