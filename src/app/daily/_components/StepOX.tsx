'use client';

import { RotateCcw, ArrowRight } from 'lucide-react';
import type { DailyQuestion } from '@/types/daily';
import { OXQuestion } from './OXQuestion';

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
          <div className="p-4 rounded-xl border border-border bg-card">
            <p className="text-sm font-medium text-foreground">
              정답: {oxQuestions.filter((q) => oxAnswers[q.id]?.toUpperCase() === String(q.answer).toUpperCase()).length} / {oxQuestions.length}
            </p>
            {wrongChaptersStep1.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                취약 챕터: {Array.from(new Set(wrongChaptersStep1)).join(', ')}
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
