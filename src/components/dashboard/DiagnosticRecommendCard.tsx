'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useQuizStore } from '@/stores/useQuizStore';
import { useFocusStore } from '@/stores/useFocusStore';
import { getWeakSubjectsFromDiagnosis } from '@/lib/study/focus-utils';
import { getSubjectTitle } from '@/lib/study/study-planner';
import { getConceptUrl } from '@/lib/content/concept-urls';
import { AlertTriangle, BookOpen, Zap, ArrowRight } from 'lucide-react';

export function DiagnosticRecommendCard() {
  const sessions = useQuizStore((s) => s.diagnosticSessions);
  const setFocus = useFocusStore((s) => s.setFocus);
  const focusSubject = useFocusStore((s) => s.focusSubject);
  const weakSubjects = useMemo(() => getWeakSubjectsFromDiagnosis(sessions, 1), [sessions]);

  if (sessions.length === 0) {
    return (
      <Link
        href="/diagnosis"
        className="flex items-center gap-3 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4 hover:bg-primary/10 transition-colors"
      >
        <Zap className="h-5 w-5 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">진단평가 시작하기</p>
          <p className="text-xs text-muted-foreground">
            실력을 진단하고 맞춤 학습 경로를 받아보세요
          </p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </Link>
    );
  }

  const top = weakSubjects[0];
  if (!top) return null;

  const alreadyFocused = focusSubject === top.slug;
  const title = getSubjectTitle(top.slug);

  return (
    <div className="rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/30 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
          진단 기반 추천
        </span>
      </div>

      <p className="text-sm text-foreground">
        <span className="font-semibold">{title}</span> 정답률이{' '}
        <span className="font-semibold text-amber-700 dark:text-amber-300">{top.rate}%</span>로
        가장 낮아요. 이 과목부터 보강하면 효과적이에요.
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        <Link
          href={getConceptUrl(top.slug)}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/40 transition-colors"
        >
          <BookOpen className="h-3 w-3" />
          개념 학습
        </Link>
        <Link
          href={`/quiz/ox?subject=${top.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
        >
          <Zap className="h-3 w-3" />
          OX 퀴즈
        </Link>
        {!alreadyFocused && (
          <button
            onClick={() => setFocus(top.slug)}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/40 transition-colors"
          >
            집중 과목으로 설정
          </button>
        )}
      </div>
    </div>
  );
}
