'use client';

export function CaseContextBox({ caseContext }: { caseContext: string }) {
  return (
    <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950/20">
      <p className="mb-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
        {'📋 사례'}
      </p>
      <p className="text-sm leading-relaxed text-amber-900 dark:text-amber-200">
        {caseContext}
      </p>
    </div>
  );
}
