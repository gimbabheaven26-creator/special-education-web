'use client';

import Link from 'next/link';
import { useBookmarkStore } from '@/stores/useBookmarkStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bookmark, Trash2 } from 'lucide-react';

export default function BookmarksPage() {
  const { bookmarks, removeBookmark } = useBookmarkStore();

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
        <Bookmark className="h-7 w-7" />
        북마크
      </h1>

      {bookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Bookmark className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">북마크가 없습니다</h2>
          <p className="text-muted-foreground mb-6">
            학습 중에 관심 있는 챕터를 북마크에 추가해보세요.
          </p>
          <Link
            href="/subjects"
            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-primary text-primary-foreground text-sm font-medium whitespace-nowrap transition-all h-11 gap-1.5 px-2.5"
          >
            과목 보러 가기
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button render={<Link href="/wrong-notes/quiz" />} size="sm">
              북마크 퀴즈 풀기
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookmarks.map((bookmark) => (
            <Card key={bookmark.id} className="group">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-medium truncate">
                      <Link
                        href={bookmark.path}
                        className="hover:text-primary transition-colors"
                      >
                        {bookmark.title}
                      </Link>
                    </CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => removeBookmark(bookmark.path)}
                    aria-label="북마크 삭제"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Badge variant="secondary">{bookmark.subject}</Badge>
                  <span>
                    {new Date(bookmark.createdAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        </div>
      )}
    </div>
  );
}
