import { describe, it, expect } from 'vitest';
import { isPathMatch, getActiveGroupId, NAV_GROUPS } from '../nav-config';

describe('isPathMatch', () => {
  it('정확 매칭', () => {
    expect(isPathMatch('/daily', '/daily')).toBe(true);
  });

  it('하위 경로 매칭', () => {
    expect(isPathMatch('/subjects/biology', '/subjects')).toBe(true);
  });

  it('trailing slash 없이 prefix 매칭 차단', () => {
    // /kice/exam 이 /kice/examfoo 를 매칭하면 안 됨
    expect(isPathMatch('/kice/examfoo', '/kice/exam')).toBe(false);
  });

  it('/kice/exam 과 /kice/analytics 혼동 없음', () => {
    expect(isPathMatch('/kice/analytics', '/kice/exam')).toBe(false);
    expect(isPathMatch('/kice/exam', '/kice/analytics')).toBe(false);
  });

  it('다른 경로는 false', () => {
    expect(isPathMatch('/wrong-notes', '/daily')).toBe(false);
  });
});

describe('getActiveGroupId', () => {
  it('홈은 null 반환', () => {
    expect(getActiveGroupId('/')).toBeNull();
  });

  it('/daily → diagnosis', () => {
    expect(getActiveGroupId('/daily')).toBe('diagnosis');
  });

  it('/terms → diagnosis', () => {
    expect(getActiveGroupId('/terms')).toBe('diagnosis');
  });

  it('/subjects → practice', () => {
    expect(getActiveGroupId('/subjects')).toBe('practice');
  });

  it('/kice/exam → practice', () => {
    expect(getActiveGroupId('/kice/exam')).toBe('practice');
  });

  it('/kice/analytics → metacognition', () => {
    expect(getActiveGroupId('/kice/analytics')).toBe('metacognition');
  });

  it('/wrong-notes → metacognition', () => {
    expect(getActiveGroupId('/wrong-notes')).toBe('metacognition');
  });

  it('/community → community', () => {
    expect(getActiveGroupId('/community')).toBe('community');
  });

  it('/community/create → community (하위 경로)', () => {
    expect(getActiveGroupId('/community/create')).toBe('community');
  });

  it('/reviews → community', () => {
    expect(getActiveGroupId('/reviews')).toBe('community');
  });

  it('알 수 없는 경로 → null', () => {
    expect(getActiveGroupId('/unknown')).toBeNull();
  });
});

describe('NAV_GROUPS 구조', () => {
  it('4개 그룹', () => {
    expect(NAV_GROUPS).toHaveLength(4);
  });

  it('각 그룹에 id, label, icon, items 존재', () => {
    for (const group of NAV_GROUPS) {
      expect(group.id).toBeTruthy();
      expect(group.label).toBeTruthy();
      expect(group.icon).toBeDefined();
      expect(group.items.length).toBeGreaterThan(0);
    }
  });

  it('총 서브 항목 수 (2+4+6+4 = 16)', () => {
    const total = NAV_GROUPS.reduce((sum, g) => sum + g.items.length, 0);
    expect(total).toBe(16);
  });
});
