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

  const handleToggle = () => {
    if (isBookmarked) {
      removeBookmark(path);
    } else {
      addBookmark({ path, title, subject });
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-10 w-10"
      onClick={handleToggle}
      aria-label={isBookmarked ? '북마크 해제' : '북마크 추가'}
    >
      <Bookmark
        className={`h-5 w-5 transition-colors ${
          isBookmarked
            ? 'fill-primary text-primary'
            : 'text-muted-foreground'
        }`}
      />
    </Button>
  );
}
