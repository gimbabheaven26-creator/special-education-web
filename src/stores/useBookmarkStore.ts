import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Bookmark } from '@/types/study';
import { SLUG_TO_CONCEPTS_FOLDER } from '@/lib/content/concept-urls';

interface BookmarkStore {
  bookmarks: Bookmark[];
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => void;
  removeBookmark: (path: string) => void;
  isBookmarked: (path: string) => boolean;
}

/** 경로 정규화: 항상 디코딩된 상태로 저장하여 인코딩 불일치 방지 */
function normalizePath(p: string): string {
  try {
    return decodeURIComponent(p);
  } catch {
    return p;
  }
}

/**
 * /subjects/slug/chapter 형태의 기존 path를 /concepts/한글폴더 로 변환.
 * 매핑에 없는 slug는 원본 그대로 유지.
 */
function migrateBookmarkPath(oldPath: string): string {
  if (!oldPath.startsWith('/subjects/')) return normalizePath(oldPath);
  const parts = oldPath.replace('/subjects/', '').split('/');
  const slug = parts[0];
  const folder = SLUG_TO_CONCEPTS_FOLDER[slug];
  if (!folder) return normalizePath(oldPath);
  return `/concepts/${folder}`;
}

export const useBookmarkStore = create<BookmarkStore>()(
  persist(
    (set, get) => ({
      bookmarks: [],

      addBookmark: (bookmark) => {
        const np = normalizePath(bookmark.path);
        if (get().bookmarks.some((b) => normalizePath(b.path) === np)) return;
        set((state) => ({
          bookmarks: [
            ...state.bookmarks,
            {
              ...bookmark,
              path: np,
              id: crypto.randomUUID(),
              createdAt: Date.now(),
            },
          ],
        }));
      },

      removeBookmark: (path) => {
        const np = normalizePath(path);
        set((state) => ({
          bookmarks: state.bookmarks.filter(
            (b) => normalizePath(b.path) !== np,
          ),
        }));
      },

      isBookmarked: (path) => {
        const np = normalizePath(path);
        return get().bookmarks.some((b) => normalizePath(b.path) === np);
      },
    }),
    {
      name: 'bookmarks',
      version: 2,
      migrate: (persisted, version) => {
        const state = persisted as { bookmarks?: Bookmark[] };
        if (version === 0 || version === undefined) {
          return {
            ...state,
            bookmarks: (state.bookmarks ?? []).map((b) => ({
              ...b,
              path: migrateBookmarkPath(b.path),
            })),
          };
        }
        if (version === 1) {
          return {
            ...state,
            bookmarks: (state.bookmarks ?? []).map((b) => ({
              ...b,
              path: normalizePath(b.path),
            })),
          };
        }
        return persisted as BookmarkStore;
      },
    }
  )
);
