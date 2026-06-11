import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export interface NextStep {
  href: string;
  label: string;
  emoji: string;
}

/**
 * 완료 화면 하단에 다음 학습 행동을 제안하는 넛지 블록.
 * steps가 비어 있으면 렌더링하지 않는다.
 */
export function NextStepNudge({ steps }: { steps: ReadonlyArray<NextStep> }) {
  if (steps.length === 0) return null;

  return (
    <section
      aria-label="다음 추천 학습"
      className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2"
    >
      <p className="text-xs font-semibold text-primary">다음 단계</p>
      <div className="space-y-2">
        {steps.map((step) => (
          <Link
            key={step.href}
            href={step.href}
            className="flex items-center gap-3 rounded-lg bg-background px-3 py-2.5 text-sm font-medium text-foreground ring-1 ring-border transition-colors hover:bg-muted"
          >
            <span className="shrink-0" aria-hidden="true">{step.emoji}</span>
            <span className="flex-1 min-w-0 truncate">{step.label}</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </section>
  );
}
