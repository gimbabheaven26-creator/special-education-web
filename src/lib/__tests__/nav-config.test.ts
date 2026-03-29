import { describe, it, expect } from 'vitest';
import { isPathMatch, getActiveGroupId, NAV_GROUPS } from '../nav-config';

describe('isPathMatch', () => {
  it('정확 매칭', () => {
    expect(isPathMatch('/daily', '/daily')).toBe(true);
  });

  it('하위 경로 매칭', () => {
    expect(isPathMatch('/concepts/시각장애', '/concepts')).toBe(true);
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

  it('/daily → null (네비에서 제거됨, 홈에서만 진입)', () => {
    expect(getActiveGroupId('/daily')).toBeNull();
  });

  it('/terms → diagnosis', () => {
    expect(getActiveGroupId('/terms')).toBe('diagnosis');
  });

  it('/concepts → practice', () => {
    expect(getActiveGroupId('/concepts')).toBe('practice');
  });

  it('/concepts/시각장애 → practice (하위 경로)', () => {
    expect(getActiveGroupId('/concepts/시각장애')).toBe('practice');
  });

  it('/kice/exam → metacognition (/kice가 내 기록 항목)', () => {
    expect(getActiveGroupId('/kice/exam')).toBe('metacognition');
  });

  it('/my → metacognition (내 기록 허브)', () => {
    expect(getActiveGroupId('/my')).toBe('metacognition');
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

  it('/reviews → null (관리자 전용, 네비에서 제거됨)', () => {
    expect(getActiveGroupId('/reviews')).toBeNull();
  });

  it('/scenarios → practice (실력쌓기로 이동)', () => {
    expect(getActiveGroupId('/scenarios')).toBe('practice');
  });

  it('/diagnosis → diagnosis', () => {
    expect(getActiveGroupId('/diagnosis')).toBe('diagnosis');
  });

  it('/quiz/ox → diagnosis', () => {
    expect(getActiveGroupId('/quiz/ox')).toBe('diagnosis');
  });

  it('/quiz/short → diagnosis', () => {
    expect(getActiveGroupId('/quiz/short')).toBe('diagnosis');
  });

  it('/practice → practice', () => {
    expect(getActiveGroupId('/practice')).toBe('practice');
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

  it('총 서브 항목 수 (3+4+6+1 = 14)', () => {
    const total = NAV_GROUPS.reduce((sum, g) => sum + g.items.length, 0);
    expect(total).toBe(14);
  });

  it('개념학습이 practice 그룹에 존재', () => {
    const practice = NAV_GROUPS.find((g) => g.id === 'practice');
    expect(practice).toBeDefined();
    const conceptItem = practice!.items.find((i) => i.href === '/concepts');
    expect(conceptItem).toBeDefined();
    expect(conceptItem!.label).toBe('개념학습');
  });

  it('diagnosis 그룹에 href가 /diagnosis', () => {
    const diagnosis = NAV_GROUPS.find((g) => g.id === 'diagnosis');
    expect(diagnosis).toBeDefined();
    expect(diagnosis!.href).toBe('/diagnosis');
  });

  it('diagnosis 그룹에 /concepts 항목 없음', () => {
    const diagnosis = NAV_GROUPS.find((g) => g.id === 'diagnosis');
    expect(diagnosis).toBeDefined();
    const conceptItem = diagnosis!.items.find((i) => i.href === '/concepts');
    expect(conceptItem).toBeUndefined();
  });

  it('/subjects 항목이 어떤 그룹에도 없음', () => {
    for (const group of NAV_GROUPS) {
      const subjectsItem = group.items.find((i) => i.href === '/subjects');
      expect(subjectsItem).toBeUndefined();
    }
  });
});
