import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMyPageData } from '../useMyPageData';
import { useBookmarkStore } from '@/stores/useBookmarkStore';
import { useQuizStore } from '@/stores/useQuizStore';
import { useStudyStore } from '@/stores/useStudyStore';

describe('useMyPageData recommendations — bookmark surfacing', () => {
  beforeEach(() => {
    useBookmarkStore.setState({ bookmarks: [] });
    useQuizStore.setState({ quizHistory: [], wrongNotes: [] });
  });

  it('includes a bookmark review item when bookmarks exist', () => {
    useBookmarkStore.setState({
      bookmarks: [
        { id: 'b1', path: '/concepts/행동수정/01', title: '긍정적 행동지원', subject: '행동수정', createdAt: Date.now() },
        { id: 'b2', path: '/concepts/행동수정/02', title: '기능평가', subject: '행동수정', createdAt: Date.now() },
      ],
    });

    const { result } = renderHook(() => useMyPageData());
    const bookmarkRec = result.current.recommendations.find((r) => r.type === 'bookmark');
    expect(bookmarkRec).toBeDefined();
    expect(bookmarkRec?.href).toBe('/bookmarks/quiz');
    expect(bookmarkRec?.label).toContain('2');
  });

  it('omits the bookmark item when there are no bookmarks', () => {
    const { result } = renderHook(() => useMyPageData());
    expect(result.current.recommendations.some((r) => r.type === 'bookmark')).toBe(false);
  });

  it('caps recommendations at 3 items', () => {
    useStudyStore.setState((s) => ({
      ...s,
      dailyProgress: { ...s.dailyProgress, quizzesCompleted: 0 },
    }));
    useBookmarkStore.setState({
      bookmarks: [{ id: 'b1', path: '/concepts/행동수정/01', title: 'PBS', subject: '행동수정', createdAt: Date.now() }],
    });
    const { result } = renderHook(() => useMyPageData());
    expect(result.current.recommendations.length).toBeLessThanOrEqual(3);
  });
});
