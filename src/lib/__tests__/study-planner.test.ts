import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock date-utils to control "today"
vi.mock('@/lib/date-utils', () => ({
  getKSTDate: vi.fn((date?: Date) => {
    if (date) {
      return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(date);
    }
    return '2026-03-28'; // fixed "today"
  }),
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
import { getKSTDate } from '@/lib/date-utils';

const mockedGetKSTDate = vi.mocked(getKSTDate);

describe('study-planner', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockedGetKSTDate.mockImplementation((date?: Date) => {
      if (date) {
        return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(date);
      }
      return '2026-03-28';
    });
  });

  // ─── getSubjectTitle ───

  describe('getSubjectTitle', () => {
    it('알려진 과목 slug → 한글 제목 반환', () => {
      expect(getSubjectTitle('introduction')).toBe('특수교육학 개론');
      expect(getSubjectTitle('behavior-support')).toBe('행동지원');
    });

    it('미지 slug → slug 그대로 반환', () => {
      expect(getSubjectTitle('unknown-slug')).toBe('unknown-slug');
    });
  });

  // ─── getSubjectWeight ───

  describe('getSubjectWeight', () => {
    it('알려진 과목 slug → weight 반환', () => {
      expect(getSubjectWeight('introduction')).toBe(15);
      expect(getSubjectWeight('communication-disorder')).toBe(3);
    });

    it('미지 slug → 0 반환', () => {
      expect(getSubjectWeight('nonexistent')).toBe(0);
    });
  });

  // ─── getAllSubjectSlugs ───

  describe('getAllSubjectSlugs', () => {
    it('11개 과목 slug 반환', () => {
      const slugs = getAllSubjectSlugs();
      expect(slugs.length).toBe(11);
      expect(slugs).toContain('introduction');
      expect(slugs).toContain('communication-disorder');
    });
  });

  // ─── generateStudyPlan ───

  describe('generateStudyPlan', () => {
    it('beginner 레벨로 학습 계획 생성', () => {
      // 시험일을 오늘+10주로 설정
      const plan = generateStudyPlan('2026-06-06', 'beginner', []);
      expect(plan.level).toBe('beginner');
      expect(plan.examDate).toBe('2026-06-06');
      expect(plan.createdAt).toBe('2026-03-28');
      expect(plan.dailyQuizTarget).toBe(10);
      expect(plan.dailyChapterTarget).toBe(1);
      expect(plan.weeklyMilestones.length).toBeGreaterThan(0);
    });

    it('취약 과목이 우선 배치된다', () => {
      const plan = generateStudyPlan('2026-06-06', 'beginner', ['laws']);
      // 첫 주차 마일스톤에 취약 과목이 포함되어야 함
      const firstMilestone = plan.weeklyMilestones[0];
      expect(firstMilestone.subjects).toContain('laws');
    });

    it('advanced 레벨의 dailyQuizTarget은 20', () => {
      const plan = generateStudyPlan('2026-06-06', 'advanced', []);
      expect(plan.dailyQuizTarget).toBe(20);
      expect(plan.dailyChapterTarget).toBe(3);
    });

    it('weakSubjects가 반환 플랜에 복사된다 (immutability)', () => {
      const weakArr = ['assessment', 'laws'];
      const plan = generateStudyPlan('2026-06-06', 'beginner', weakArr);
      expect(plan.weakSubjects).toEqual(weakArr);
      expect(plan.weakSubjects).not.toBe(weakArr); // 새 배열
    });

    it('시험일까지 1주일이면 milestones 최소 1개', () => {
      const plan = generateStudyPlan('2026-04-04', 'beginner', []);
      expect(plan.weeklyMilestones.length).toBeGreaterThanOrEqual(1);
    });

    it('totalWeeks 초과 시 남은 주차는 복습 사이클', () => {
      // 매우 먼 시험일 → 과목 배정 후 남은 주차가 복습으로 채워짐
      const plan = generateStudyPlan('2027-03-28', 'beginner', []);
      const lastMilestone = plan.weeklyMilestones[plan.weeklyMilestones.length - 1];
      expect(lastMilestone.label).toContain('복습');
      expect(lastMilestone.quizTarget).toBe(15);
    });
  });

  // ─── getCurrentWeekMilestone ───

  describe('getCurrentWeekMilestone', () => {
    it('첫째 주에는 weekNumber 1 마일스톤 반환', () => {
      const plan = generateStudyPlan('2026-06-06', 'beginner', []);
      // createdAt은 2026-03-28, today도 2026-03-28 → 1주차
      const milestone = getCurrentWeekMilestone(plan);
      expect(milestone).not.toBeNull();
      expect(milestone!.weekNumber).toBe(1);
    });

    it('plan 범위 밖이면 null', () => {
      // 시험일이 바로 다음 주인 계획에서, 3주 후를 "오늘"로 설정
      const plan = generateStudyPlan('2026-04-04', 'beginner', []);
      // 현재 오늘이 2026-03-28이고 plan은 1~2주차만 있으므로
      // 4주 후로 mock 변경
      mockedGetKSTDate.mockImplementation((date?: Date) => {
        if (date) {
          return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(date);
        }
        return '2026-05-28';
      });
      const milestone = getCurrentWeekMilestone(plan);
      expect(milestone).toBeNull();
    });
  });

  // ─── getEncouragementMessage ───

  describe('getEncouragementMessage', () => {
    it('start 타입 메시지 반환', () => {
      const msg = getEncouragementMessage('start', { dday: 100, subject: '행동지원' });
      expect(typeof msg).toBe('string');
      expect(msg.length).toBeGreaterThan(0);
    });

    it('params 치환 동작', () => {
      // Math.random을 고정하여 deterministic하게 만듦
      vi.spyOn(Math, 'random').mockReturnValue(0); // 첫 번째 메시지 선택
      const msg = getEncouragementMessage('start', { dday: 42, subject: '행동지원' });
      expect(msg).toContain('42');
    });

    it('complete 타입에서 xp 치환', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.4); // 두 번째 메시지 (index 1)
      const msg = getEncouragementMessage('complete', { xp: 150, weeklyPct: 80 });
      expect(typeof msg).toBe('string');
    });

    it('missed 타입 메시지 존재', () => {
      const msg = getEncouragementMessage('missed');
      expect(msg.length).toBeGreaterThan(0);
    });
  });

  // ─── getNextExamDate ───

  describe('getNextExamDate', () => {
    it('시험 전(3월) → 올해 11월 셋째 토요일 반환', () => {
      // today = 2026-03-28, 시험 전
      const examDate = getNextExamDate();
      // 2026년 11월 1일 = 일요일, 첫 토 = 7일, 셋째 토 = 21일
      expect(examDate).toBe('2026-11-21');
    });

    it('시험 후(12월) → 다음 해 시험일 반환', () => {
      mockedGetKSTDate.mockImplementation((date?: Date) => {
        if (date) {
          return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(date);
        }
        return '2026-12-01';
      });
      const examDate = getNextExamDate();
      // 2027년 11월 1일 = 월요일, 첫 토 = 6일, 셋째 토 = 20일
      expect(examDate).toBe('2027-11-20');
    });

    it('시험 당일 → 올해 날짜 반환 (today <= examDate)', () => {
      mockedGetKSTDate.mockImplementation((date?: Date) => {
        if (date) {
          return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(date);
        }
        return '2026-11-21';
      });
      const examDate = getNextExamDate();
      expect(examDate).toBe('2026-11-21');
    });
  });
});
