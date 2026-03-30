'use client';

import { Bookmark } from 'lucide-react';
import { useBookmarkStore } from '@/stores/useBookmarkStore';
import { Button } from '@/components/ui/button';

interface BookmarkButtonProps {
  path: string;
  title: string;
  subject: string;
}

export function BookmarkButton({ path, title, subject }: BookmarkButtonProps) {
  const addBookmark = useBookmarkStore((s) => s.addBookmark);
  const removeBookmark = useBookmarkStore((s) => s.removeBookmark);
  const isBookmarked = useBookmarkStore((s) => s.isBookmarked(path));

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isBookmarked) {
      removeBookmark(path);
    } else {
      addBookmark({ path, title, subject });
    }
  };

  return (
    <Button
      variant={isBookmarked ? 'default' : 'outline'}
      size="sm"
      className={`gap-1.5 min-h-[36px] transition-all ${
        isBookmarked
          ? 'bg-primary text-primary-foreground'
          : 'border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
      }`}
      onClick={handleToggle}
      aria-label={isBookmarked ? '북마크 해제' : '북마크 추가'}
    >
      <Bookmark
        className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`}
      />
      <span className="text-xs font-medium">
        {isBookmarked ? '북마크됨' : '북마크'}
      </span>
    </Button>
  );
}
