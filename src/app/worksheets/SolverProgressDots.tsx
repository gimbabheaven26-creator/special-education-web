'use client';

interface SolverProgressDotsProps {
  total: number;
  currentIndex: number;
  answers: Record<string, string>;
}

export function SolverProgressDots({
  total,
  currentIndex,
  answers,
}: SolverProgressDotsProps) {
  return (
    <div className="flex flex-nowrap overflow-x-auto sm:flex-wrap gap-1.5 max-h-10 sm:max-h-16 overflow-y-auto py-1">
      {Array.from({ length: total }, (_, i) => {
        const isCurrent = i === currentIndex;
        const hasAnswer = Object.keys(answers).length > i; // approximate

        let dotClass =
          'w-3 h-3 rounded-full transition-all duration-200 flex-shrink-0 cursor-pointer';

        if (isCurrent) {
          dotClass += ' bg-primary ring-2 ring-primary/40 ring-offset-1 ring-offset-background';
        } else if (hasAnswer) {
          dotClass += ' bg-emerald-500';
        } else {
          dotClass += ' bg-muted-foreground/30';
        }

        return <div key={i} className={dotClass} />;
      })}
    </div>
  );
}
