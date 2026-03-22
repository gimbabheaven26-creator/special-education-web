import { describe, it, expect } from 'vitest';
import { getKSTDate, getToday, addDays, isYesterday } from '../date-utils';

describe('date-utils', () => {
  describe('getKSTDate', () => {
    it('기본 호출 시 YYYY-MM-DD 형식 반환', () => {
      const result = getKSTDate();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('특정 Date 객체 전달 시 KST 기준 날짜 반환', () => {
      // 2026-03-22 00:30 KST = 2026-03-21 15:30 UTC
      const date = new Date('2026-03-21T15:30:00Z');
      expect(getKSTDate(date)).toBe('2026-03-22');
    });

    it('UTC 자정 직전(KST 오전 8:59) — UTC와 KST 날짜가 다른 경계', () => {
      // 2026-03-21 23:59 UTC = 2026-03-22 08:59 KST
      const date = new Date('2026-03-21T23:59:00Z');
      expect(getKSTDate(date)).toBe('2026-03-22');
    });

    it('KST 자정 직후(UTC 15:00) — 날짜가 바뀌는 경계', () => {
      // 2026-03-22 00:01 KST = 2026-03-21 15:01 UTC
      const date = new Date('2026-03-21T15:01:00Z');
      expect(getKSTDate(date)).toBe('2026-03-22');
    });

    it('KST 자정 직전(UTC 14:59) — 아직 전날', () => {
      // 2026-03-21 23:59 KST = 2026-03-21 14:59 UTC
      const date = new Date('2026-03-21T14:59:00Z');
      expect(getKSTDate(date)).toBe('2026-03-21');
    });
  });

  describe('getToday', () => {
    it('getKSTDate()와 동일한 결과 반환', () => {
      expect(getToday()).toBe(getKSTDate());
    });
  });

  describe('addDays', () => {
    it('양수 일수 더하기', () => {
      expect(addDays('2026-03-22', 3)).toBe('2026-03-25');
    });

    it('월 경계를 넘는 더하기', () => {
      expect(addDays('2026-03-30', 5)).toBe('2026-04-04');
    });

    it('연 경계를 넘는 더하기', () => {
      expect(addDays('2026-12-30', 5)).toBe('2027-01-04');
    });

    it('0일 더하기 — 동일 날짜', () => {
      expect(addDays('2026-03-22', 0)).toBe('2026-03-22');
    });

    it('음수 일수 — 과거 날짜', () => {
      expect(addDays('2026-03-22', -3)).toBe('2026-03-19');
    });
  });

  describe('isYesterday', () => {
    it('어제 날짜 → true', () => {
      const today = getKSTDate();
      const yesterday = addDays(today, -1);
      expect(isYesterday(yesterday)).toBe(true);
    });

    it('오늘 날짜 → false', () => {
      const today = getKSTDate();
      expect(isYesterday(today)).toBe(false);
    });

    it('이틀 전 날짜 → false', () => {
      const today = getKSTDate();
      const twoDaysAgo = addDays(today, -2);
      expect(isYesterday(twoDaysAgo)).toBe(false);
    });
  });
});
