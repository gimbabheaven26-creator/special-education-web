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

  it('/terms → learn', () => {
    expect(getActiveGroupId('/terms')).toBe('learn');
  });

  it('/concepts → learn', () => {
    expect(getActiveGroupId('/concepts')).toBe('learn');
  });

  it('/concepts/시각장애 → learn (하위 경로)', () => {
    expect(getActiveGroupId('/concepts/시각장애')).toBe('learn');
  });

  it('/kice/exam → record (/kice가 기록 항목)', () => {
    expect(getActiveGroupId('/kice/exam')).toBe('record');
  });

  it('/my → null (프로필/설정 전용, 기록에서 분리됨)', () => {
    expect(getActiveGroupId('/my')).toBeNull();
  });

  it('/kice/analytics → record', () => {
    expect(getActiveGroupId('/kice/analytics')).toBe('record');
  });

  it('/wrong-notes → record', () => {
    expect(getActiveGroupId('/wrong-notes')).toBe('record');
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

  it('/scenarios → learn', () => {
    expect(getActiveGroupId('/scenarios')).toBe('learn');
  });

  it('/diagnosis → learn', () => {
    expect(getActiveGroupId('/diagnosis')).toBe('learn');
  });

  it('/quiz/ox → learn', () => {
    expect(getActiveGroupId('/quiz/ox')).toBe('learn');
  });

  it('/quiz/short → learn', () => {
    expect(getActiveGroupId('/quiz/short')).toBe('learn');
  });

  it('/practice → learn', () => {
    expect(getActiveGroupId('/practice')).toBe('learn');
  });

  it('/practice-hub → learn (학습 그룹 href)', () => {
    expect(getActiveGroupId('/practice-hub')).toBe('learn');
  });

  it('알 수 없는 경로 → null', () => {
    expect(getActiveGroupId('/unknown')).toBeNull();
  });
});

describe('NAV_GROUPS 구조', () => {
  it('3개 그룹 (학습/기록/함께하기)', () => {
    expect(NAV_GROUPS).toHaveLength(3);
  });

  it('각 그룹에 id, label, icon, items 존재', () => {
    for (const group of NAV_GROUPS) {
      expect(group.id).toBeTruthy();
      expect(group.label).toBeTruthy();
      expect(group.icon).toBeDefined();
      expect(group.items.length).toBeGreaterThan(0);
    }
  });

  it('총 서브 항목 수 (8+5+1 = 14)', () => {
    const total = NAV_GROUPS.reduce((sum, g) => sum + g.items.length, 0);
    expect(total).toBe(14);
  });

  it('개념학습이 learn 그룹에 존재', () => {
    const learn = NAV_GROUPS.find((g) => g.id === 'learn');
    expect(learn).toBeDefined();
    const conceptItem = learn!.items.find((i) => i.href === '/concepts');
    expect(conceptItem).toBeDefined();
    expect(conceptItem!.label).toBe('개념학습');
  });

  it('learn 그룹에 href가 /practice-hub', () => {
    const learn = NAV_GROUPS.find((g) => g.id === 'learn');
    expect(learn).toBeDefined();
    expect(learn!.href).toBe('/practice-hub');
  });

  it('record 그룹에 href가 /record', () => {
    const record = NAV_GROUPS.find((g) => g.id === 'record');
    expect(record).toBeDefined();
    expect(record!.href).toBe('/record');
  });

  it('/subjects 항목이 어떤 그룹에도 없음', () => {
    for (const group of NAV_GROUPS) {
      const subjectsItem = group.items.find((i) => i.href === '/subjects');
      expect(subjectsItem).toBeUndefined();
    }
  });
});
