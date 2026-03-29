import { describe, it, expect } from 'vitest';

/** ExamCountdown 내부 순수 함수 추출 테스트 */
function calcCountdown(examDate: string, todayStr: string) {
  const exam = new Date(examDate + 'T00:00:00+09:00');
  const now = new Date(todayStr + 'T00:00:00+09:00');
  const diffMs = exam.getTime() - now.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const label = days < 0 ? '시험 종료' : days === 0 ? 'D-Day!' : `D-${days}`;
  const weeksLeft = days > 0 ? Math.ceil(days / 7) : null;
  const dateLabel = exam.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  return { label, weeksLeft, dateLabel };
}

describe('calcCountdown', () => {
  it('시험 당일은 D-Day!를 반환한다', () => {
    const { label } = calcCountdown('2026-11-21', '2026-11-21');
    expect(label).toBe('D-Day!');
  });

  it('시험 1일 전은 D-1을 반환한다', () => {
    const { label } = calcCountdown('2026-11-21', '2026-11-20');
    expect(label).toBe('D-1');
  });

  it('시험 7일 전은 D-7, 남은 주 1을 반환한다', () => {
    const { label, weeksLeft } = calcCountdown('2026-11-21', '2026-11-14');
    expect(label).toBe('D-7');
    expect(weeksLeft).toBe(1);
  });

  it('시험 이후는 시험 종료를 반환한다', () => {
    const { label, weeksLeft } = calcCountdown('2026-11-21', '2026-11-22');
    expect(label).toBe('시험 종료');
    expect(weeksLeft).toBeNull();
  });

  it('날짜가 바뀌면 다른 결과를 반환한다 (인터벌 갱신 필요성)', () => {
    const before = calcCountdown('2026-11-21', '2026-11-19');
    const after = calcCountdown('2026-11-21', '2026-11-20');
    expect(before.label).not.toBe(after.label);
  });

  it('weeksLeft는 항상 올림 처리된다', () => {
    // 8일 남으면 2주 (ceil(8/7) = 2)
    const { weeksLeft } = calcCountdown('2026-11-21', '2026-11-13');
    expect(weeksLeft).toBe(2);
  });
});
