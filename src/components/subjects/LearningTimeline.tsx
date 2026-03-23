'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { CheckCircle, Circle, BookOpen, Tag } from 'lucide-react';
import { useStudyStore } from '@/stores/useStudyStore';
import { Badge } from '@/components/ui/badge';

interface Chapter {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  order: number;
}

interface LearningTimelineProps {
  subjectSlug: string;
  chapters: Chapter[];
  /** 한글 concepts 폴더명. 존재 시 /concepts/폴더명/slug URL 사용 */
  conceptsFolder?: string;
}

interface ChapterStatus {
  visited: boolean;
  isCurrent: boolean;
}

function useChapterStatuses(
  subjectSlug: string,
  chapters: readonly Chapter[]
): ReadonlyMap<string, ChapterStatus> {
  const recentActivities = useStudyStore((state) => state.recentActivities);

  return useMemo(() => {
    const subjectActivities = recentActivities.filter(
      (a) => a.subjectSlug === subjectSlug
    );

    const visitedSlugs = new Set(subjectActivities.map((a) => a.chapterSlug));

    const mostRecentSlug =
      subjectActivities.length > 0
        ? subjectActivities.reduce((latest, a) =>
            a.timestamp > latest.timestamp ? a : latest
          ).chapterSlug
        : null;

    const statusMap = new Map<string, ChapterStatus>();
    for (const chapter of chapters) {
      statusMap.set(chapter.slug, {
        visited: visitedSlugs.has(chapter.slug),
        isCurrent: chapter.slug === mostRecentSlug,
      });
    }

    return statusMap;
  }, [subjectSlug, chapters, recentActivities]);
}

function ProgressHeader({
  totalChapters,
  completedCount,
}: {
  totalChapters: number;
  completedCount: number;
}) {
  const percentage =
    totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 0;

  return (
    <div className="flex items-center gap-3 sm:gap-4 rounded-lg bg-muted/50 px-3 sm:px-4 py-3">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <BookOpen className="size-4" />
        <span>
          {completedCount}/{totalChapters} 챕터
        </span>
      </div>
      <div className="flex flex-1 items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-sm font-medium text-accent">{percentage}%</span>
      </div>
    </div>
  );
}

function TimelineNode({
  chapter,
  subjectSlug,
  status,
  isLast,
  conceptsFolder,
}: {
  chapter: Chapter;
  subjectSlug: string;
  status: ChapterStatus;
  isLast: boolean;
  conceptsFolder?: string;
}) {
  const href = conceptsFolder
    ? `/concepts/${encodeURIComponent(conceptsFolder)}/${encodeURIComponent(chapter.slug)}`
    : `/subjects/${subjectSlug}/${chapter.slug}`;

  return (
    <div className="relative flex gap-3 sm:gap-4">
      {/* Vertical line + circle */}
      <div className="flex flex-col items-center">
        <NodeIndicator visited={status.visited} isCurrent={status.isCurrent} />
        {!isLast && (
          <div className="w-0.5 flex-1 bg-gradient-to-b from-primary/40 to-muted" />
        )}
      </div>

      {/* Content card */}
      <Link
        href={href}
        className="group mb-6 flex-1"
      >
        <div className="rounded-lg border border-border bg-card p-3 sm:p-4 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md">
          <div className="mb-1 flex items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">
              {chapter.title}
            </h3>
            {status.isCurrent && (
              <Badge variant="default" className="text-[10px]">
                현재 학습 중
              </Badge>
            )}
          </div>

          <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
            {chapter.description}
          </p>

          {chapter.keywords.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <Tag className="size-3 text-muted-foreground" />
              {chapter.keywords.map((keyword) => (
                <Badge key={keyword} variant="secondary" className="text-[10px]">
                  {keyword}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}

function NodeIndicator({
  visited,
  isCurrent,
}: {
  visited: boolean;
  isCurrent: boolean;
}) {
  if (isCurrent) {
    return (
      <div className="relative flex size-5 items-center justify-center">
        <span className="absolute size-5 animate-ping rounded-full bg-primary/30" />
        <span className="relative size-3 rounded-full bg-primary ring-2 ring-primary/30" />
      </div>
    );
  }

  if (visited) {
    return (
      <CheckCircle className="size-5 shrink-0 text-accent" />
    );
  }

  return (
    <Circle className="size-5 shrink-0 text-muted-foreground/50" />
  );
}

export default function LearningTimeline({
  subjectSlug,
  chapters,
  conceptsFolder,
}: LearningTimelineProps) {
  const sortedChapters = useMemo(
    () => [...chapters].sort((a, b) => a.order - b.order),
    [chapters]
  );

  const statuses = useChapterStatuses(subjectSlug, sortedChapters);

  const completedCount = useMemo(
    () =>
      Array.from(statuses.values()).filter((s) => s.visited).length,
    [statuses]
  );

  return (
    <div>
      <ProgressHeader
        totalChapters={sortedChapters.length}
        completedCount={completedCount}
      />

      <div className="mt-6">
        {sortedChapters.map((chapter, index) => {
          const status = statuses.get(chapter.slug) ?? {
            visited: false,
            isCurrent: false,
          };

          return (
            <TimelineNode
              key={chapter.slug}
              chapter={chapter}
              subjectSlug={subjectSlug}
              status={status}
              isLast={index === sortedChapters.length - 1}
              conceptsFolder={conceptsFolder}
            />
          );
        })}
      </div>
    </div>
  );
}
