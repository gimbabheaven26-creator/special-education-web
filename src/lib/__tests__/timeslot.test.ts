import { getKSTTimeslot } from '../timeslot';

describe('getKSTTimeslot', () => {
  it('반환값에 date, slot, label, key가 포함된다', () => {
    const result = getKSTTimeslot();
    expect(result).toHaveProperty('date');
    expect(result).toHaveProperty('slot');
    expect(result).toHaveProperty('label');
    expect(result).toHaveProperty('key');
  });

  it('slot 범위는 0-5이다', () => {
    const { slot } = getKSTTimeslot();
    expect(slot).toBeGreaterThanOrEqual(0);
    expect(slot).toBeLessThanOrEqual(5);
  });

  it('date 형식은 YYYY-MM-DD이다', () => {
    const { date } = getKSTTimeslot();
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('key 형식은 YYYY-MM-DD-S0 이다', () => {
    const { key } = getKSTTimeslot();
    expect(key).toMatch(/^\d{4}-\d{2}-\d{2}-S[0-5]$/);
  });

  it.each([
    [0, 0, '새벽①'],
    [1, 0, '새벽①'],
    [3, 0, '새벽①'],
    [4, 1, '새벽②'],
    [5, 1, '새벽②'],
    [7, 1, '새벽②'],
    [8, 2, '오전'],
    [9, 2, '오전'],
    [11, 2, '오전'],
    [12, 3, '오후①'],
    [13, 3, '오후①'],
    [15, 3, '오후①'],
    [16, 4, '오후②'],
    [17, 4, '오후②'],
    [19, 4, '오후②'],
    [20, 5, '저녁'],
    [21, 5, '저녁'],
    [23, 5, '저녁'],
  ])('KST %i시 → S%i (%s)', (kstHour, expectedSlot, expectedLabel) => {
    // KST = UTC+9 이므로, UTC 시각 = kstHour - 9
    const utcHour = (kstHour - 9 + 24) % 24;
    const now = new Date(`2026-03-23T${String(utcHour).padStart(2, '0')}:30:00Z`);
    const result = getKSTTimeslot(now);
    expect(result.slot).toBe(expectedSlot);
    expect(result.label).toBe(expectedLabel);
  });

  it('key는 date와 slot으로 구성된다', () => {
    const now = new Date('2026-03-23T03:30:00Z'); // KST 12:30 → S3
    const result = getKSTTimeslot(now);
    expect(result.date).toBe('2026-03-23');
    expect(result.slot).toBe(3);
    expect(result.key).toBe('2026-03-23-S3');
    expect(result.label).toBe('오후①');
  });
});
