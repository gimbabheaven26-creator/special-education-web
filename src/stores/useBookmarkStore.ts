import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Bookmark } from '@/types/study';
import { SLUG_TO_CONCEPTS_FOLDER } from '@/lib/concept-urls';

interface BookmarkStore {
  bookmarks: Bookmark[];
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => void;
  removeBookmark: (path: string) => void;
  isBookmarked: (path: string) => boolean;
}

/**
 * /subjects/slug/chapter 형태의 기존 path를 /concepts/한글폴더 로 변환.
 * 매핑에 없는 slug는 원본 그대로 유지.
 */
function migrateBookmarkPath(oldPath: string): string {
  if (!oldPath.startsWith('/subjects/')) return oldPath;
  const parts = oldPath.replace('/subjects/', '').split('/');
  const slug = parts[0];
  const folder = SLUG_TO_CONCEPTS_FOLDER[slug];
  if (!folder) return oldPath;
  return `/concepts/${encodeURIComponent(folder)}`;
}

export const useBookmarkStore = create<BookmarkStore>()(
  persist(
    (set, get) => ({
      bookmarks: [],

      addBookmark: (bookmark) =>
        set((state) => ({
          bookmarks: [
            ...state.bookmarks,
            { ...bookmark, id: crypto.randomUUID(), createdAt: Date.now() },
          ],
        })),

      removeBookmark: (path) =>
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.path !== path),
        })),

      isBookmarked: (path) => get().bookmarks.some((b) => b.path === path),
    }),
    {
      name: 'bookmarks',
      version: 1,
      migrate: (persisted, version) => {
        if (version === 0 || version === undefined) {
          const state = persisted as { bookmarks?: Bookmark[] };
          return {
            ...state,
            bookmarks: (state.bookmarks ?? []).map((b) => ({
              ...b,
              path: migrateBookmarkPath(b.path),
            })),
          };
        }
        return persisted as BookmarkStore;
      },
    }
  )
);
