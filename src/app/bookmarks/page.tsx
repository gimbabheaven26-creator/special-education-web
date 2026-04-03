'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useBookmarkStore } from '@/stores/useBookmarkStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Bookmark, Trash2, Brain, ArrowUpDown } from 'lucide-react';
import { CONCEPTS_FOLDER_TO_SLUG } from '@/lib/content/concept-urls';

/** bookmark.path에서 과목 slug 추출: /concepts/한글폴더/... → slug */
function getSubjectSlugFromPath(path: string): string | null {
  const match = path.match(/^\/concepts\/([^/]+)/);
  if (!match) return null;
  const folder = decodeURIComponent(match[1]);
  return CONCEPTS_FOLDER_TO_SLUG[folder] ?? null;
}

type SortMode = 'newest' | 'oldest' | 'subject';

export default function BookmarksPage() {
  const bookmarks = useBookmarkStore((s) => s.bookmarks);
  const removeBookmark = useBookmarkStore((s) => s.removeBookmark);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('newest');

  // Unique subjects for filter tabs
  const subjects = useMemo(() => {
    const set = new Set(bookmarks.map((b) => b.subject));
    return Array.from(set).sort();
  }, [bookmarks]);

  // Filter + sort
  const filtered = useMemo(() => {
    const result = selectedSubject
      ? bookmarks.filter((b) => b.subject === selectedSubject)
      : [...bookmarks];

    if (sortMode === 'newest') {
      result.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortMode === 'oldest') {
      result.sort((a, b) => a.createdAt - b.createdAt);
    } else {
      result.sort((a, b) => a.subject.localeCompare(b.subject, 'ko'));
    }

    return result;
  }, [bookmarks, selectedSubject, sortMode]);

  const cycleSortMode = () => {
    setSortMode((prev) =>
      prev === 'newest' ? 'oldest' : prev === 'oldest' ? 'subject' : 'newest'
    );
  };

  const sortLabel: Record<SortMode, string> = {
    newest: '최신순',
    oldest: '오래된순',
    subject: '과목순',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
        <Bookmark className="h-7 w-7" />
        북마크
      </h1>

      {bookmarks.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="h-16 w-16 text-muted-foreground/30" />}
          title="아직 북마크가 없어요"
          description="개념학습 페이지에서 '북마크' 버튼을 누르면 여기에 모여요. 시험 전 복습할 핵심만 골라두세요."
          action={{ label: '개념학습 보러 가기', href: '/concepts', ariaLabel: '개념학습 페이지로 이동' }}
        />
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            개념학습 페이지에서 북마크한 챕터예요. 시험 전 복습에 활용하세요. 총 {bookmarks.length}개.
          </p>

          {/* 북마크 퀴즈 배너 */}
          <Link
            href="/bookmarks/quiz"
            className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">북마크 퀴즈</p>
                <p className="text-xs text-muted-foreground">북마크한 {bookmarks.length}개 챕터에서 출제</p>
              </div>
            </div>
            <Button size="sm" className="shrink-0 min-h-[36px]">시작</Button>
          </Link>

          {/* Action buttons */}
          <div className="flex justify-between items-center gap-2 flex-wrap">
            {/* Subject filter */}
            <div className="flex gap-1.5 flex-wrap" role="tablist" aria-label="과목 필터">
              <button
                onClick={() => setSelectedSubject(null)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  selectedSubject === null
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:border-primary/40'
                }`}
                role="tab"
                aria-selected={selectedSubject === null}
              >
                전체 ({bookmarks.length})
              </button>
              {subjects.map((subject) => {
                const count = bookmarks.filter((b) => b.subject === subject).length;
                return (
                  <button
                    key={subject}
                    onClick={() => setSelectedSubject(subject === selectedSubject ? null : subject)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      selectedSubject === subject
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-muted-foreground hover:border-primary/40'
                    }`}
                    role="tab"
                    aria-selected={selectedSubject === subject}
                  >
                    {subject} ({count})
                  </button>
                );
              })}
            </div>

            {/* Sort + quiz buttons */}
            <div className="flex gap-2 shrink-0">
              <Button variant="ghost" size="sm" onClick={cycleSortMode} className="gap-1 text-xs">
                <ArrowUpDown className="h-3.5 w-3.5" />
                {sortLabel[sortMode]}
              </Button>
              <Button render={<Link href="/bookmarks/quiz" />} size="sm" className="min-h-[36px]">
                <Brain className="h-4 w-4 mr-1" />
                북마크 퀴즈
              </Button>
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((bookmark) => (
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
                      aria-label={`"${bookmark.title}" 북마크 삭제`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
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
                  {(() => {
                    const slug = getSubjectSlugFromPath(bookmark.path);
                    if (!slug) return null;
                    return (
                      <Button
                        render={<Link href={`/quiz/${slug}`} />}
                        variant="outline"
                        size="sm"
                        className="min-h-[44px] w-full"
                        aria-label={`${bookmark.subject} 과목 퀴즈 풀기`}
                      >
                        <Brain className="h-4 w-4 mr-2" />
                        이 과목 퀴즈 풀기
                      </Button>
                    );
                  })()}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filter empty state */}
          {filtered.length === 0 && selectedSubject && (
            <div className="text-center py-10 text-muted-foreground text-sm">
              <p>&ldquo;{selectedSubject}&rdquo; 과목 북마크가 없어요.</p>
              <button
                onClick={() => setSelectedSubject(null)}
                className="text-primary hover:underline mt-2"
              >
                전체 보기
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
