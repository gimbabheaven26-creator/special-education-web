'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useStudyStore } from '@/stores/useStudyStore';

const STUDY_PATHS = ['/concepts/', '/quiz/', '/flashcards', '/worksheets/', '/kice/', '/wrong-notes'];
const FLUSH_INTERVAL_MS = 60_000; // 1분마다 플러시
const MIN_SESSION_SECONDS = 30;   // 30초 미만은 무시

function isStudyPath(pathname: string): boolean {
  return STUDY_PATHS.some((p) => pathname.startsWith(p));
}

/**
 * 보이지 않는 학습 시간 추적 컴포넌트.
 * 학습 페이지에 있을 때 자동으로 시간을 측정하고 useStudyStore에 기록.
 */
export function StudySessionTracker() {
  const pathname = usePathname();
  const recordStudyTime = useStudyStore((s) => s.recordStudyTime);
  const sessionStartRef = useRef<number | null>(null);
  const accumulatedRef = useRef(0);

  useEffect(() => {
    if (!isStudyPath(pathname)) {
      // 비학습 페이지: 누적된 시간 플러시
      if (accumulatedRef.current > 0) {
        const minutes = Math.round(accumulatedRef.current / 60);
        if (minutes > 0) recordStudyTime(minutes);
        accumulatedRef.current = 0;
      }
      sessionStartRef.current = null;
      return;
    }

    // 학습 페이지: 타이머 시작
    sessionStartRef.current = Date.now();

    // 1분마다 누적 시간 플러시
    const interval = setInterval(() => {
      if (sessionStartRef.current) {
        const elapsed = (Date.now() - sessionStartRef.current) / 1000;
        if (elapsed >= MIN_SESSION_SECONDS) {
          accumulatedRef.current += elapsed;
          sessionStartRef.current = Date.now();

          // 1분 이상 누적되면 플러시
          if (accumulatedRef.current >= 60) {
            const minutes = Math.floor(accumulatedRef.current / 60);
            recordStudyTime(minutes);
            accumulatedRef.current -= minutes * 60;
          }
        }
      }
    }, FLUSH_INTERVAL_MS);

    // 페이지 떠날 때 or 페이지 변경 시 누적 처리
    const handleBeforeUnload = () => {
      if (sessionStartRef.current) {
        const elapsed = (Date.now() - sessionStartRef.current) / 1000;
        if (elapsed >= MIN_SESSION_SECONDS) {
          accumulatedRef.current += elapsed;
        }
        const minutes = Math.round(accumulatedRef.current / 60);
        if (minutes > 0) recordStudyTime(minutes);
        accumulatedRef.current = 0;
        sessionStartRef.current = null;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);

      // 클린업 시 (페이지 전환) 누적 처리
      if (sessionStartRef.current) {
        const elapsed = (Date.now() - sessionStartRef.current) / 1000;
        if (elapsed >= MIN_SESSION_SECONDS) {
          accumulatedRef.current += elapsed;
        }
        sessionStartRef.current = null;
      }
    };
  }, [pathname, recordStudyTime]);

  return null; // 보이지 않는 컴포넌트
}
