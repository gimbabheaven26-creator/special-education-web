'use client';

import Link from 'next/link';
import { RotateCcw, ArrowRight, Target } from 'lucide-react';
import type { DailyQuestion } from '@/types/daily';
import { OXQuestion } from './OXQuestion';
import { getChapterDisplayName } from '@/lib/study/display-labels';
import { buildDailyNextStep } from '@/lib/study/daily-next-step';

export function StepOX({
  oxQuestions,
  oxAnswers,
  onAnswer,
  revealed,
  allOxAnswered,
  step1Done,
  wrongChaptersStep1,
  onFinishStep1,
  onProceedToStep2,
}: {
  oxQuestions: DailyQuestion[];
  oxAnswers: Record<string, 'O' | 'X'>;
  onAnswer: (id: string, answer: 'O' | 'X') => void;
  revealed: boolean;
  allOxAnswered: boolean;
  step1Done: boolean;
  wrongChaptersStep1: string[];
  onFinishStep1: () => void;
  onProceedToStep2: (useWrongOnly: boolean) => void;
}) {
  const nextStep = step1Done ? buildDailyNextStep(oxQuestions, oxAnswers) : null;

  return (
    <>
      <div className="space-y-3">
        {oxQuestions.map((q, i) => (
          <OXQuestion
            key={q.id}
            question={q}
            index={i + 1}
            userAnswer={oxAnswers[q.id] ?? null}
            onAnswer={onAnswer}
            revealed={revealed}
            correctAnswer={q.answer}
          />
        ))}
      </div>

      {!step1Done && (
        <button
          onClick={onFinishStep1}
          disabled={!allOxAnswered}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          채점하기
        </button>
      )}

      {step1Done && (
        <div className="space-y-3">
          {nextStep && (
            <div className="sticky top-2 z-10 rounded-xl border border-primary/20 bg-background/95 p-4 shadow-sm backdrop-blur">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Target className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-primary">다음 한 걸음</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{nextStep.message}</p>
                  {nextStep.primarySubjectLabel && nextStep.primaryChapterLabel && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {nextStep.primarySubjectLabel} · {nextStep.primaryChapterLabel}
                    </p>
                  )}
                </div>
              </div>
              {nextStep.conceptHref && (
                <Link
                  href={nextStep.conceptHref}
                  className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                >
                  관련 개념 보기
                </Link>
              )}
            </div>
          )}

          <div className="p-4 rounded-xl border border-border bg-card">
            <p className="text-sm font-medium text-foreground">
              정답: {oxQuestions.filter((q) => oxAnswers[q.id]?.toUpperCase() === String(q.answer).toUpperCase()).length} / {oxQuestions.length}
            </p>
            {wrongChaptersStep1.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                취약 챕터: {Array.from(new Set(wrongChaptersStep1)).map((chapter) => getChapterDisplayName(chapter)).join(', ')}
              </p>
            )}
          </div>

          {wrongChaptersStep1.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onProceedToStep2(true)}
                className="py-3 px-2 rounded-xl border border-border bg-card text-xs font-medium text-foreground hover:bg-muted transition-colors text-center"
              >
                틀린 영역 OX 다시 풀기
                <RotateCcw className="h-3.5 w-3.5 mx-auto mt-1" />
              </button>
              <button
                onClick={() => onProceedToStep2(false)}
                className="py-3 px-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors text-center"
              >
                단답형으로 넘어가기
                <ArrowRight className="h-3.5 w-3.5 mx-auto mt-1" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onProceedToStep2(false)}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              단답형으로 넘어가기 <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </>
  );
}
