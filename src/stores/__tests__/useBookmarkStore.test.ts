import { describe, it, expect, beforeEach } from 'vitest';
import { useBookmarkStore } from '../useBookmarkStore';

describe('useBookmarkStore', () => {
  beforeEach(() => {
    useBookmarkStore.setState({ bookmarks: [] });
  });

  describe('초기 상태', () => {
    it('북마크 배열이 비어있다', () => {
      const { bookmarks } = useBookmarkStore.getState();
      expect(bookmarks).toEqual([]);
    });
  });

  describe('addBookmark', () => {
    it('북마크를 추가하면 id와 createdAt이 자동 생성된다', () => {
      const { addBookmark } = useBookmarkStore.getState();
      addBookmark({ path: '/concepts/행동수정', title: '행동수정', subject: 'behavior-support' });

      const { bookmarks } = useBookmarkStore.getState();
      expect(bookmarks).toHaveLength(1);
      expect(bookmarks[0].path).toBe('/concepts/행동수정');
      expect(bookmarks[0].title).toBe('행동수정');
      expect(bookmarks[0].subject).toBe('behavior-support');
      expect(bookmarks[0].id).toBeDefined();
      expect(bookmarks[0].createdAt).toBeTypeOf('number');
    });

    it('여러 북마크를 추가하면 순서대로 쌓인다', () => {
      const { addBookmark } = useBookmarkStore.getState();
      addBookmark({ path: '/concepts/a', title: 'A', subject: 'a' });
      addBookmark({ path: '/concepts/b', title: 'B', subject: 'b' });

      const { bookmarks } = useBookmarkStore.getState();
      expect(bookmarks).toHaveLength(2);
      expect(bookmarks[0].path).toBe('/concepts/a');
      expect(bookmarks[1].path).toBe('/concepts/b');
    });

    it('같은 경로를 중복 추가해도 둘 다 저장된다 (스토어 레벨 중복 방지 없음)', () => {
      const { addBookmark } = useBookmarkStore.getState();
      addBookmark({ path: '/concepts/a', title: 'A', subject: 'a' });
      addBookmark({ path: '/concepts/a', title: 'A', subject: 'a' });

      const { bookmarks } = useBookmarkStore.getState();
      expect(bookmarks).toHaveLength(2);
    });
  });

  describe('removeBookmark', () => {
    it('경로로 북마크를 제거한다', () => {
      useBookmarkStore.setState({
        bookmarks: [
          { id: '1', path: '/concepts/a', title: 'A', subject: 'a', createdAt: 1 },
          { id: '2', path: '/concepts/b', title: 'B', subject: 'b', createdAt: 2 },
        ],
      });

      const { removeBookmark } = useBookmarkStore.getState();
      removeBookmark('/concepts/a');

      const { bookmarks } = useBookmarkStore.getState();
      expect(bookmarks).toHaveLength(1);
      expect(bookmarks[0].path).toBe('/concepts/b');
    });

    it('존재하지 않는 경로를 제거해도 에러가 발생하지 않는다', () => {
      useBookmarkStore.setState({
        bookmarks: [
          { id: '1', path: '/concepts/a', title: 'A', subject: 'a', createdAt: 1 },
        ],
      });

      const { removeBookmark } = useBookmarkStore.getState();
      removeBookmark('/concepts/nonexistent');

      const { bookmarks } = useBookmarkStore.getState();
      expect(bookmarks).toHaveLength(1);
    });

    it('빈 배열에서 제거해도 에러가 발생하지 않는다', () => {
      const { removeBookmark } = useBookmarkStore.getState();
      removeBookmark('/concepts/a');

      const { bookmarks } = useBookmarkStore.getState();
      expect(bookmarks).toEqual([]);
    });
  });

  describe('isBookmarked', () => {
    it('북마크된 경로는 true를 반환한다', () => {
      useBookmarkStore.setState({
        bookmarks: [
          { id: '1', path: '/concepts/a', title: 'A', subject: 'a', createdAt: 1 },
        ],
      });

      const { isBookmarked } = useBookmarkStore.getState();
      expect(isBookmarked('/concepts/a')).toBe(true);
    });

    it('북마크되지 않은 경로는 false를 반환한다', () => {
      const { isBookmarked } = useBookmarkStore.getState();
      expect(isBookmarked('/concepts/nonexistent')).toBe(false);
    });
  });

  describe('immutability', () => {
    it('addBookmark은 기존 배열을 변경하지 않는다', () => {
      const before = useBookmarkStore.getState().bookmarks;
      useBookmarkStore.getState().addBookmark({ path: '/x', title: 'X', subject: 'x' });
      const after = useBookmarkStore.getState().bookmarks;
      expect(before).not.toBe(after);
    });

    it('removeBookmark은 기존 배열을 변경하지 않는다', () => {
      useBookmarkStore.setState({
        bookmarks: [{ id: '1', path: '/x', title: 'X', subject: 'x', createdAt: 1 }],
      });
      const before = useBookmarkStore.getState().bookmarks;
      useBookmarkStore.getState().removeBookmark('/x');
      const after = useBookmarkStore.getState().bookmarks;
      expect(before).not.toBe(after);
    });
  });
});
