import { describe, expect, it } from 'vitest';
import {
  getChapterDisplayName,
  getSubjectDisplayName,
  hasSlugLikeToken,
} from '../display-labels';

describe('display-labels', () => {
  it('maps subject slugs to Korean learner-facing labels', () => {
    expect(getSubjectDisplayName('laws')).toBe('관련 법령');
    expect(getSubjectDisplayName('visual-impairment')).toBe('시각장애');
    expect(getSubjectDisplayName('behavior-support')).toBe('행동지원');
  });

  it('maps known concept/chapter slugs to readable Korean labels', () => {
    expect(getChapterDisplayName('special-education-act')).toBe('특수교육법');
    expect(getChapterDisplayName('pbs')).toBe('긍정적 행동지원');
    expect(getChapterDisplayName('visual-training')).toBe('시각 활용 훈련');
  });

  it('detects unresolved slug-like labels before they reach UX surfaces', () => {
    expect(hasSlugLikeToken('special-education-act')).toBe(true);
    expect(hasSlugLikeToken('긍정적 행동지원')).toBe(false);
  });
});
