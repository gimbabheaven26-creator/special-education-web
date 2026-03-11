import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Bookmark } from '@/types/study';

interface BookmarkStore {
  bookmarks: Bookmark[];
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => void;
  removeBookmark: (path: string) => void;
  isBookmarked: (path: string) => boolean;
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
    { name: 'bookmarks' }
  )
);
