'use client';

import { useEffect, useState, useCallback } from 'react';
import { useStudyStore } from '@/stores/useStudyStore';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface ChapterTrackerProps {
  subjectSlug: string;
  subjectTitle: string;
  chapterSlug: string;
  chapterTitle: string;
}

export function ChapterTracker({
  subjectSlug,
  subjectTitle,
  chapterSlug,
  chapterTitle,
}: ChapterTrackerProps) {
  const [completed, setCompleted] = useState(false);
  const [showXP, setShowXP] = useState(false);

  useEffect(() => {
    useStudyStore.getState().recordActivity({
      subjectSlug,
      subjectTitle,
      chapterSlug,
      chapterTitle,
    });
  }, [subjectSlug, subjectTitle, chapterSlug, chapterTitle]);

  const handleComplete = useCallback(() => {
    if (completed) return;

    useStudyStore.getState().recordChapterComplete();
    setCompleted(true);
    setShowXP(true);

    const timer = setTimeout(() => {
      setShowXP(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [completed]);

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <div className="relative">
        <Button
          onClick={handleComplete}
          disabled={completed}
          variant={completed ? 'secondary' : 'default'}
          size="lg"
          className="gap-2 px-6"
        >
          {completed ? (
            <>
              <CheckCircle className="size-4" />
              학습 완료됨
            </>
          ) : (
            '학습 완료'
          )}
        </Button>

        {showXP && (
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce text-sm font-bold text-purple-500">
            +20 XP
          </span>
        )}
      </div>
    </div>
  );
}
