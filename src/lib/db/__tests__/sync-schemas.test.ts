import { describe, it, expect } from 'vitest';
import {
  studyStoreSchema,
  quizStoreSchema,
  leitnerStoreSchema,
  bookmarkStoreSchema,
  onboardingStoreSchema,
  focusStoreSchema,
  storeSchemas,
} from '../sync-schemas';

describe('sync-schemas', () => {
  describe('studyStoreSchema', () => {
    it('accepts valid study data', () => {
      const data = {
        currentStreak: 3,
        longestStreak: 7,
        lastActiveDate: '2026-06-01',
        dailyProgress: { date: '2026-06-01', chaptersCompleted: 1, quizzesCompleted: 5, quizzesCorrect: 4, flashcardsReviewed: 10 },
        dailyGoal: { chapters: 2, quizzes: 10 },
        recentActivities: [{ subjectSlug: 'math', subjectTitle: '수학', chapterSlug: 'ch1', chapterTitle: '1장', timestamp: 1000 }],
        totalXP: 500,
        totalQuizzes: 50,
        totalCorrect: 40,
        dailyHistory: [{ date: '2026-06-01', questionsAttempted: 10, questionsCorrect: 8, xpEarned: 100 }],
        scenarioProgress: {},
        spacedScenarioSchedules: {},
      };
      const result = studyStoreSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('rejects data with wrong types', () => {
      const data = { currentStreak: 'not a number', longestStreak: 0 };
      const result = studyStoreSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('passes through unknown fields', () => {
      const data = {
        currentStreak: 0, longestStreak: 0, lastActiveDate: null,
        dailyProgress: { date: '', chaptersCompleted: 0, quizzesCompleted: 0, quizzesCorrect: 0, flashcardsReviewed: 0 },
        dailyGoal: { chapters: 0, quizzes: 0 },
        recentActivities: [], totalXP: 0, totalQuizzes: 0, totalCorrect: 0,
        dailyHistory: [], scenarioProgress: {}, spacedScenarioSchedules: {},
        futureField: 'should pass through',
      };
      const result = studyStoreSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect((result.data as Record<string, unknown>).futureField).toBe('should pass through');
      }
    });
  });

  describe('quizStoreSchema', () => {
    it('accepts valid quiz data', () => {
      const data = {
        wrongNotes: [{
          questionId: 'q1', subject: 'math', userAnswer: 'X',
          attempts: 1, lastAttempt: 1000, mastered: false,
        }],
        quizHistory: [{
          questionId: 'q1', userAnswer: 'O', isCorrect: true,
          timestamp: 1000, subject: 'math', chapter: 'ch1',
        }],
        diagnosticSessions: [],
        feedbacks: [],
        errorReports: [],
      };
      const result = quizStoreSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('accepts wrongNote with numeric userAnswer', () => {
      const data = {
        wrongNotes: [{
          questionId: 'q1', subject: 'math', userAnswer: 3,
          attempts: 1, lastAttempt: 1000, mastered: false,
        }],
        quizHistory: [], diagnosticSessions: [], feedbacks: [], errorReports: [],
      };
      const result = quizStoreSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('rejects wrongNote missing required fields', () => {
      const data = {
        wrongNotes: [{ questionId: 'q1' }],
        quizHistory: [], diagnosticSessions: [], feedbacks: [], errorReports: [],
      };
      const result = quizStoreSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('leitnerStoreSchema', () => {
    it('accepts valid leitner data', () => {
      const data = {
        cards: [{
          id: 'c1', subjectSlug: 'math', question: 'Q?', answer: 'A',
          box: 1, lastReviewed: '2026-06-01', nextReview: '2026-06-02', createdAt: '2026-06-01',
        }],
        reviewLogs: [{
          cardId: 'c1', grade: 'knew', fromBox: 1, toBox: 2, timestamp: 1000,
        }],
      };
      const result = leitnerStoreSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('rejects card with box out of range', () => {
      const data = {
        cards: [{
          id: 'c1', subjectSlug: 'math', question: 'Q?', answer: 'A',
          box: 6, lastReviewed: '2026-06-01', nextReview: '2026-06-02', createdAt: '2026-06-01',
        }],
        reviewLogs: [],
      };
      const result = leitnerStoreSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('bookmarkStoreSchema', () => {
    it('accepts valid bookmark data', () => {
      const data = {
        bookmarks: [{ id: 'b1', path: '/concepts/math', title: '수학', subject: 'math', createdAt: 1000 }],
      };
      const result = bookmarkStoreSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('accepts empty bookmarks', () => {
      const result = bookmarkStoreSchema.safeParse({ bookmarks: [] });
      expect(result.success).toBe(true);
    });
  });

  describe('onboardingStoreSchema', () => {
    it('accepts valid onboarding data', () => {
      const data = {
        isOnboarded: true,
        examDate: '2026-11-15',
        studyLevel: 'intermediate',
        weakSubjects: ['math'],
        targetSubjects: ['math', 'science'],
        dailyQuestionsTarget: 20,
        studyPlan: null,
      };
      const result = onboardingStoreSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('accepts null studyLevel for new users', () => {
      const data = {
        isOnboarded: false, examDate: null, studyLevel: null,
        weakSubjects: [], targetSubjects: [], dailyQuestionsTarget: 10, studyPlan: null,
      };
      const result = onboardingStoreSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('focusStoreSchema', () => {
    it('accepts valid focus data with mission', () => {
      const data = {
        focusSubject: 'math',
        focusSetAt: 1000,
        focusExpiresAt: 22600000,
        focusMode: 'user',
        todayMission: {
          date: '2026-06-01',
          focusSubject: 'math',
          blocks: [{
            id: 'b1', type: 'quiz', label: '퀴즈', description: '수학 퀴즈',
            count: 5, estimatedMinutes: 10, href: '/quiz/math', completed: false,
          }],
        },
      };
      const result = focusStoreSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('accepts off mode with null mission', () => {
      const data = {
        focusSubject: null, focusSetAt: null, focusExpiresAt: null,
        focusMode: 'off', todayMission: null,
      };
      const result = focusStoreSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('rejects invalid focusMode', () => {
      const data = {
        focusSubject: null, focusSetAt: null, focusExpiresAt: null,
        focusMode: 'invalid', todayMission: null,
      };
      const result = focusStoreSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('storeSchemas map', () => {
    it('has all 6 store keys', () => {
      expect(Object.keys(storeSchemas)).toEqual(
        ['study', 'quiz', 'leitner', 'bookmark', 'onboarding', 'focus'],
      );
    });
  });
});
