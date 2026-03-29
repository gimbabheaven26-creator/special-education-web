'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStudyStore } from '@/stores/useStudyStore';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface ChapterTrackerProps {
  subjectSlug: string;
  subjectTitle: string;
  chapterSlug: string;
  chapterTitle: string;
  /** 학습 완료 후 이동할 URL. 미지정 시 /subjects/${subjectSlug} */
  redirectUrl?: string;
}

export function ChapterTracker({
  subjectSlug,
  subjectTitle,
  chapterSlug,
  chapterTitle,
  redirectUrl,
}: ChapterTrackerProps) {
  const router = useRouter();
  const alreadyCompleted = useStudyStore((s) => s.isChapterCompleted)(subjectSlug, chapterSlug);
  const [completed, setCompleted] = useState(alreadyCompleted);
  const [showXP, setShowXP] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Bug1 fix: 마운트 시 1회만 기록 — props 변경 시 중복 호출 방지
  useEffect(() => {
    useStudyStore.getState().recordActivity({
      subjectSlug,
      subjectTitle,
      chapterSlug,
      chapterTitle,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bug2 fix: 언마운트 시 타이머 정리 — 메모리 누수 방지
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleComplete = useCallback(() => {
    if (completed) return;

    const store = useStudyStore.getState();
    store.recordChapterComplete();
    store.markChapterCompleted(subjectSlug, chapterSlug);
    setCompleted(true);
    setShowXP(true);

    // XP 애니메이션 후 과목 페이지로 자동 이동
    timerRef.current = setTimeout(() => {
      setShowXP(false);
      router.push(redirectUrl ?? `/subjects/${subjectSlug}`);
    }, 1500);
  }, [completed, router, subjectSlug, chapterSlug, redirectUrl]);

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
