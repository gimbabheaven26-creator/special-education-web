'use client';

import { CheckCircle2 } from 'lucide-react';
import type { DailyQuestion } from '@/types/daily';
import { TextQuestion } from './TextQuestion';

export function StepDescriptive({
  descriptiveQuestions,
  revealed,
  step3Done,
  onReveal,
  onFinishStep3,
}: {
  descriptiveQuestions: DailyQuestion[];
  revealed: boolean;
  step3Done: boolean;
  onReveal: () => void;
  onFinishStep3: () => void;
}) {
  return (
    <>
      <p className="text-xs text-muted-foreground px-1">
        각 문항에 핵심 키워드를 포함하여 서술해보세요.
      </p>
      <div className="space-y-3">
        {descriptiveQuestions.map((q, i) => (
          <TextQuestion key={q.id} question={q} index={i + 1} revealed={revealed} type="descriptive" />
        ))}
      </div>

      {!step3Done && !revealed && (
        <button
          onClick={onReveal}
          className="w-full py-3 rounded-xl border border-border bg-card text-sm font-medium hover:bg-muted transition-colors"
        >
          정답 키워드 확인
        </button>
      )}

      {revealed && !step3Done && (
        <button
          onClick={onFinishStep3}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          오늘 학습 완료 <CheckCircle2 className="h-4 w-4" />
        </button>
      )}
    </>
  );
}
