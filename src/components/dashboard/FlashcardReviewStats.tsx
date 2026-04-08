'use client';

import { useLeitnerStore } from '@/stores/useLeitnerStore';
import type { AnswerGrade } from '@/stores/useLeitnerStore';
import { useShallow } from 'zustand/react/shallow';

const GRADE_CONFIG: Record<AnswerGrade, { label: string; color: string; bg: string }> = {
  knew: { label: '바로 맞춤', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500' },
  hint: { label: '힌트 후', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500' },
  forgot: { label: '다시 학습', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500' },
};

const BOX_LABELS = ['1단계', '2단계', '3단계', '4단계', '5단계'];

export function FlashcardReviewStats() {
  const reviewLogs = useLeitnerStore((s) => s.reviewLogs);
  const stats = useLeitnerStore(useShallow((s) => s.getStats()));

  if (reviewLogs.length === 0 && stats.total === 0) return null;

  const gradeCount: Record<AnswerGrade, number> = { knew: 0, hint: 0, forgot: 0 };
  for (const log of reviewLogs) {
    gradeCount[log.grade]++;
  }
  const total = reviewLogs.length;

  const boxCounts = [stats.box1, stats.box2, stats.box3, stats.box4, stats.box5];
  const maxBox = Math.max(...boxCounts, 1);

  return (
    <div className="p-4 rounded-2xl border border-border bg-card space-y-3">
      <p className="text-xs font-semibold text-muted-foreground">플래시카드 복습</p>

      {total > 0 && (
        <>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-violet-600 dark:text-violet-400 tabular-nums">
              {total}회
            </span>
            <span className="text-xs text-muted-foreground">총 복습</span>
          </div>

          {/* 등급 분포 바 */}
          <div className="h-2.5 rounded-full overflow-hidden flex">
            {(['knew', 'hint', 'forgot'] as const).map((grade) => {
              const pct = (gradeCount[grade] / total) * 100;
              if (pct === 0) return null;
              return (
                <div
                  key={grade}
                  className={`${GRADE_CONFIG[grade].bg} transition-all`}
                  style={{ width: `${pct}%` }}
                />
              );
            })}
          </div>

          {/* 등급 범례 */}
          <div className="flex gap-3">
            {(['knew', 'hint', 'forgot'] as const).map((grade) => {
              const count = gradeCount[grade];
              if (count === 0) return null;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={grade} className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${GRADE_CONFIG[grade].bg}`} />
                  <span className={`text-[10px] ${GRADE_CONFIG[grade].color}`}>
                    {GRADE_CONFIG[grade].label} {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* 박스 분포 */}
      {stats.total > 0 && (
        <div className="space-y-1.5 pt-1">
          <p className="text-[10px] text-muted-foreground">카드 {stats.total}장 · 오늘 복습 {stats.dueToday}장</p>
          <div className="flex gap-1 items-end h-10">
            {boxCounts.map((count, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                <div
                  className="w-full rounded-sm bg-violet-200 dark:bg-violet-800 transition-all"
                  style={{ height: `${Math.max((count / maxBox) * 32, 2)}px` }}
                />
                <span className="text-[8px] text-muted-foreground">{BOX_LABELS[i]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
