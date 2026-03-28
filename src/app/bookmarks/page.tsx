'use client';

import Link from 'next/link';
import { useBookmarkStore } from '@/stores/useBookmarkStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/EmptyState';
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
        <EmptyState
          icon={<Bookmark className="h-16 w-16 text-muted-foreground/30" />}
          title="아직 북마크가 없어요"
          description="중요한 챕터를 북마크에 저장하면 언제든 빠르게 돌아올 수 있어요."
          action={{ label: '과목 보러 가기', href: '/concepts', ariaLabel: '과목 학습 페이지로 이동' }}
        />
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
