import { describe, it, expect } from 'vitest';
import {
  XP_PER_QUIZ,
  XP_PER_CORRECT,
  XP_PER_CHAPTER,
  XP_TOAST_CORRECT,
  XP_TOAST_WRONG,
  COMBO_THRESHOLDS,
  getComboBonus,
  XP_PER_LEVEL,
  LEVEL_NAMES,
  getLevel,
  getLevelProgress,
  getLevelName,
} from '@/lib/study/xp-constants';

describe('xp-constants', () => {
  // ─── 상수 존재 여부 및 타입 ──────────────────────────────────
  describe('XP 상수', () => {
    it('XP_PER_QUIZ = 10', () => {
      expect(XP_PER_QUIZ).toBe(10);
    });

    it('XP_PER_CORRECT = 5', () => {
      expect(XP_PER_CORRECT).toBe(5);
    });

    it('XP_PER_CHAPTER = 20', () => {
      expect(XP_PER_CHAPTER).toBe(20);
    });

    it('XP_TOAST_CORRECT = XP_PER_QUIZ + XP_PER_CORRECT', () => {
      expect(XP_TOAST_CORRECT).toBe(XP_PER_QUIZ + XP_PER_CORRECT);
      expect(XP_TOAST_CORRECT).toBe(15);
    });

    it('XP_TOAST_WRONG = XP_PER_QUIZ', () => {
      expect(XP_TOAST_WRONG).toBe(XP_PER_QUIZ);
    });

    it('XP_PER_LEVEL = 100', () => {
      expect(XP_PER_LEVEL).toBe(100);
    });
  });

  // ─── COMBO_THRESHOLDS ─────────────────────────────────────────
  describe('COMBO_THRESHOLDS', () => {
    it('4개 임계값이 정의되어 있다', () => {
      expect(COMBO_THRESHOLDS).toHaveLength(4);
    });

    it('streak 순서가 오름차순이다', () => {
      for (let i = 1; i < COMBO_THRESHOLDS.length; i++) {
        expect(COMBO_THRESHOLDS[i].streak).toBeGreaterThan(
          COMBO_THRESHOLDS[i - 1].streak,
        );
      }
    });

    it('각 항목에 bonus, label, color가 있다', () => {
      for (const t of COMBO_THRESHOLDS) {
        expect(typeof t.bonus).toBe('number');
        expect(typeof t.label).toBe('string');
        expect(typeof t.color).toBe('string');
      }
    });
  });

  // ─── getComboBonus ────────────────────────────────────────────
  describe('getComboBonus', () => {
    it('streak 0 → null', () => {
      expect(getComboBonus(0)).toBeNull();
    });

    it('streak 1 → null', () => {
      expect(getComboBonus(1)).toBeNull();
    });

    it('streak 2 → null', () => {
      expect(getComboBonus(2)).toBeNull();
    });

    it('streak 3 → 첫 번째 임계값 (bonus 5)', () => {
      const result = getComboBonus(3);
      expect(result).not.toBeNull();
      expect(result!.bonus).toBe(5);
      expect(result!.label).toBe('콤보!');
    });

    it('streak 5 → 두 번째 임계값 (bonus 10)', () => {
      const result = getComboBonus(5);
      expect(result!.bonus).toBe(10);
      expect(result!.label).toBe('대단해!');
    });

    it('streak 7 → 세 번째 임계값 (bonus 15)', () => {
      const result = getComboBonus(7);
      expect(result!.bonus).toBe(15);
    });

    it('streak 10 → 최대 임계값 (bonus 20, "전설!")', () => {
      const result = getComboBonus(10);
      expect(result!.bonus).toBe(20);
      expect(result!.label).toBe('전설!');
    });

    it('streak 100 → 최대 임계값 유지', () => {
      const result = getComboBonus(100);
      expect(result!.bonus).toBe(20);
    });

    it('streak 4 → 3 이상이므로 첫 번째 임계값', () => {
      const result = getComboBonus(4);
      expect(result!.bonus).toBe(5);
    });
  });

  // ─── LEVEL_NAMES ──────────────────────────────────────────────
  describe('LEVEL_NAMES', () => {
    it('7개 레벨명이 정의되어 있다', () => {
      expect(LEVEL_NAMES).toHaveLength(7);
    });

    it('minLevel이 오름차순이다', () => {
      for (let i = 1; i < LEVEL_NAMES.length; i++) {
        expect(LEVEL_NAMES[i].minLevel).toBeGreaterThanOrEqual(
          LEVEL_NAMES[i - 1].minLevel,
        );
      }
    });

    it('첫 레벨은 minLevel 0부터 시작', () => {
      expect(LEVEL_NAMES[0].minLevel).toBe(0);
    });
  });

  // ─── getLevel ─────────────────────────────────────────────────
  describe('getLevel', () => {
    it('XP 0 → 레벨 0', () => {
      expect(getLevel(0)).toBe(0);
    });

    it('XP 99 → 레벨 0', () => {
      expect(getLevel(99)).toBe(0);
    });

    it('XP 100 → 레벨 1', () => {
      expect(getLevel(100)).toBe(1);
    });

    it('XP 250 → 레벨 2', () => {
      expect(getLevel(250)).toBe(2);
    });

    it('XP 3000 → 레벨 30', () => {
      expect(getLevel(3000)).toBe(30);
    });
  });

  // ─── getLevelProgress ─────────────────────────────────────────
  describe('getLevelProgress', () => {
    it('XP 0 → current 0, next 100, percent 0', () => {
      expect(getLevelProgress(0)).toEqual({ current: 0, next: 100, percent: 0 });
    });

    it('XP 50 → current 50, percent 50', () => {
      const p = getLevelProgress(50);
      expect(p.current).toBe(50);
      expect(p.percent).toBe(50);
    });

    it('XP 100 → current 0, percent 0 (레벨업 직후)', () => {
      expect(getLevelProgress(100)).toEqual({ current: 0, next: 100, percent: 0 });
    });

    it('XP 175 → current 75, percent 75', () => {
      const p = getLevelProgress(175);
      expect(p.current).toBe(75);
      expect(p.percent).toBe(75);
    });

    it('XP 99 → current 99, percent 99', () => {
      const p = getLevelProgress(99);
      expect(p.current).toBe(99);
      expect(p.percent).toBe(99);
    });
  });

  // ─── getLevelName ─────────────────────────────────────────────
  describe('getLevelName', () => {
    it('레벨 0 → 예비 수험생', () => {
      expect(getLevelName(0).name).toBe('예비 수험생');
    });

    it('레벨 2 → 아직 예비 수험생 (3 미만)', () => {
      expect(getLevelName(2).name).toBe('예비 수험생');
    });

    it('레벨 3 → 수습 교사', () => {
      expect(getLevelName(3).name).toBe('수습 교사');
    });

    it('레벨 10 → 합격 유망주', () => {
      expect(getLevelName(10).name).toBe('합격 유망주');
    });

    it('레벨 30 → 특수교육 전문가', () => {
      expect(getLevelName(30).name).toBe('특수교육 전문가');
    });

    it('레벨 999 → 최고 레벨 유지', () => {
      expect(getLevelName(999).name).toBe('특수교육 전문가');
    });

    it('emoji가 항상 포함된다', () => {
      expect(getLevelName(0).emoji).toBeTruthy();
      expect(getLevelName(20).emoji).toBeTruthy();
    });
  });
});
