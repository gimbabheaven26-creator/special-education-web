'use client';

import { useMemo } from 'react';

const EXAM_DATE = '2026-11-21';

export function ExamCountdown() {
  const { label, weeksLeft, dateLabel } = useMemo(() => {
    const exam = new Date(EXAM_DATE + 'T00:00:00+09:00');
    const now = new Date(
      new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date()) + 'T00:00:00+09:00'
    );
    const diffMs = exam.getTime() - now.getTime();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const label = days < 0 ? '시험 종료' : days === 0 ? 'D-Day!' : `D-${days}`;
    const weeksLeft = days > 0 ? Math.ceil(days / 7) : null;
    const dateLabel = exam.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
    return { label, weeksLeft, dateLabel };
  }, []);

  return (
    <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
      <div>
        <p className="text-xs text-muted-foreground">특수교사 임용시험까지</p>
        <p className="text-2xl font-bold text-primary">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{dateLabel}</p>
      </div>
      {weeksLeft && (
        <div className="text-right">
          <p className="text-xs text-muted-foreground">남은 주</p>
          <p className="text-lg font-semibold text-foreground">{weeksLeft}주</p>
        </div>
      )}
    </div>
  );
}
