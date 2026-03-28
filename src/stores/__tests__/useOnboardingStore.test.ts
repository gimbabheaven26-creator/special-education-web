import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useOnboardingStore, type StudyPlan } from '../useOnboardingStore';

vi.mock('@/lib/date-utils', () => ({
  getKSTDate: () => '2026-03-29',
}));

const mockPlan: StudyPlan = {
  createdAt: '2026-03-29',
  examDate: '2026-11-14',
  level: 'intermediate',
  weakSubjects: ['curriculum', 'laws'],
  targetSubjects: ['behavior-support', 'assessment'],
  weeklyMilestones: [
    { weekNumber: 1, subjects: ['curriculum'], quizTarget: 10, chapterTarget: 2, label: '1주차' },
  ],
  dailyQuizTarget: 5,
  dailyChapterTarget: 1,
  dailyQuestionsTarget: 30,
};

describe('useOnboardingStore', () => {
  beforeEach(() => {
    useOnboardingStore.setState({
      isOnboarded: false,
      examDate: null,
      studyLevel: null,
      weakSubjects: [],
      targetSubjects: [],
      dailyQuestionsTarget: 20,
      studyPlan: null,
    });
  });

  describe('초기 상태', () => {
    it('온보딩 미완료 상태로 시작한다', () => {
      const state = useOnboardingStore.getState();
      expect(state.isOnboarded).toBe(false);
      expect(state.examDate).toBeNull();
      expect(state.studyLevel).toBeNull();
      expect(state.weakSubjects).toEqual([]);
      expect(state.targetSubjects).toEqual([]);
      expect(state.dailyQuestionsTarget).toBe(20);
      expect(state.studyPlan).toBeNull();
    });
  });

  describe('setter 액션', () => {
    it('setExamDate: 시험일을 설정한다', () => {
      useOnboardingStore.getState().setExamDate('2026-11-14');
      expect(useOnboardingStore.getState().examDate).toBe('2026-11-14');
    });

    it('setStudyLevel: 학습 수준을 설정한다', () => {
      useOnboardingStore.getState().setStudyLevel('advanced');
      expect(useOnboardingStore.getState().studyLevel).toBe('advanced');
    });

    it('setWeakSubjects: 취약 과목을 설정한다 (새 배열 생성)', () => {
      const subjects = ['curriculum', 'laws'];
      useOnboardingStore.getState().setWeakSubjects(subjects);
      const stored = useOnboardingStore.getState().weakSubjects;
      expect(stored).toEqual(['curriculum', 'laws']);
      expect(stored).not.toBe(subjects); // immutable copy
    });

    it('setTargetSubjects: 목표 과목을 설정한다', () => {
      useOnboardingStore.getState().setTargetSubjects(['behavior-support']);
      expect(useOnboardingStore.getState().targetSubjects).toEqual(['behavior-support']);
    });

    it('setDailyQuestionsTarget: 일일 목표 문항 수를 설정한다', () => {
      useOnboardingStore.getState().setDailyQuestionsTarget(50);
      expect(useOnboardingStore.getState().dailyQuestionsTarget).toBe(50);
    });
  });

  describe('completeOnboarding', () => {
    it('온보딩을 완료하면 모든 필드가 plan에서 채워진다', () => {
      useOnboardingStore.getState().completeOnboarding(mockPlan);
      const state = useOnboardingStore.getState();

      expect(state.isOnboarded).toBe(true);
      expect(state.examDate).toBe('2026-11-14');
      expect(state.studyLevel).toBe('intermediate');
      expect(state.weakSubjects).toEqual(['curriculum', 'laws']);
      expect(state.targetSubjects).toEqual(['behavior-support', 'assessment']);
      expect(state.dailyQuestionsTarget).toBe(30);
      expect(state.studyPlan).toEqual(mockPlan);
    });

    it('weakSubjects/targetSubjects는 원본 plan과 분리된 새 배열이다', () => {
      useOnboardingStore.getState().completeOnboarding(mockPlan);
      const state = useOnboardingStore.getState();
      expect(state.weakSubjects).not.toBe(mockPlan.weakSubjects);
      expect(state.targetSubjects).not.toBe(mockPlan.targetSubjects);
    });
  });

  describe('resetOnboarding', () => {
    it('온보딩 상태를 초기값으로 되돌린다', () => {
      useOnboardingStore.getState().completeOnboarding(mockPlan);
      useOnboardingStore.getState().resetOnboarding();
      const state = useOnboardingStore.getState();

      expect(state.isOnboarded).toBe(false);
      expect(state.examDate).toBeNull();
      expect(state.studyLevel).toBeNull();
      expect(state.weakSubjects).toEqual([]);
      expect(state.targetSubjects).toEqual([]);
      expect(state.dailyQuestionsTarget).toBe(20);
      expect(state.studyPlan).toBeNull();
    });
  });

  describe('getDday', () => {
    it('시험일이 없으면 null을 반환한다', () => {
      const result = useOnboardingStore.getState().getDday();
      expect(result).toBeNull();
    });

    it('시험일이 설정되면 D-day를 계산한다', () => {
      // getKSTDate mock이 '2026-03-29'를 반환
      useOnboardingStore.getState().setExamDate('2026-11-14');
      const dday = useOnboardingStore.getState().getDday();
      // 2026-03-29 → 2026-11-14 = 230일
      expect(dday).toBe(230);
    });

    it('시험일이 오늘이면 0을 반환한다', () => {
      useOnboardingStore.getState().setExamDate('2026-03-29');
      const dday = useOnboardingStore.getState().getDday();
      expect(dday).toBe(0);
    });

    it('시험일이 지났으면 음수를 반환한다', () => {
      useOnboardingStore.getState().setExamDate('2026-03-28');
      const dday = useOnboardingStore.getState().getDday();
      expect(dday).toBeLessThan(0);
    });
  });
});
