'use client';

import { RotateCcw, ArrowRight } from 'lucide-react';
import type { DailyQuestion } from '@/types/daily';
import { TextQuestion } from './TextQuestion';

export function StepFillIn({
  fillInQuestions,
  revealed,
  step2Done,
  onFinishStep2,
  onProceedToStep3,
}: {
  fillInQuestions: DailyQuestion[];
  revealed: boolean;
  step2Done: boolean;
  onFinishStep2: () => void;
  onProceedToStep3: (retry: boolean) => void;
}) {
  return (
    <>
      <p className="text-xs text-muted-foreground px-1">
        문제를 읽고 답을 생각해보세요. 답안 확인 후 자기 채점합니다.
      </p>
      <div className="space-y-3">
        {fillInQuestions.map((q, i) => (
          <TextQuestion key={q.id} question={q} index={i + 1} revealed={revealed} type="fill_in" />
        ))}
      </div>

      {!step2Done && (
        <button
          onClick={onFinishStep2}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          답안 확인
        </button>
      )}

      {step2Done && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onProceedToStep3(true)}
              className="py-3 px-2 rounded-xl border border-border bg-card text-xs font-medium text-foreground hover:bg-muted transition-colors text-center"
            >
              단답형 한번 더
              <RotateCcw className="h-3.5 w-3.5 mx-auto mt-1" />
            </button>
            <button
              onClick={() => onProceedToStep3(false)}
              className="py-3 px-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors text-center"
            >
              서술형으로 넘어가기
              <ArrowRight className="h-3.5 w-3.5 mx-auto mt-1" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
