'use client';

import { useStudyStore } from '@/stores/useStudyStore';
import { useState } from 'react';

export function ExamCountdown() {
  const { examDate, setExamDate } = useStudyStore();
  const [editing, setEditing] = useState(false);

  const dDay = examDate
    ? Math.ceil((new Date(examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  if (editing || !examDate) {
    return (
      <div className="p-4 rounded-xl border border-border bg-card space-y-2">
        <p className="text-sm font-medium">시험일을 설정해주세요</p>
        <div className="flex gap-2">
          <input
            type="date"
            defaultValue={examDate ?? ''}
            onChange={e => setExamDate(e.target.value || null)}
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={() => setEditing(false)}
            className="px-3 py-2 text-sm rounded-lg bg-primary text-primary-foreground"
          >
            확인
          </button>
        </div>
      </div>
    );
  }

  const isOver = dDay !== null && dDay < 0;
  const label = isOver ? '시험 종료' : dDay === 0 ? 'D-Day!' : `D-${dDay}`;

  return (
    <div
      className="p-4 rounded-xl border border-border bg-card flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => setEditing(true)}
    >
      <div>
        <p className="text-xs text-muted-foreground">임용시험까지</p>
        <p className="text-2xl font-bold text-primary">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {new Date(examDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
      <div className="text-right">
        {dDay !== null && dDay > 0 && (
          <>
            <p className="text-xs text-muted-foreground">남은 주</p>
            <p className="text-lg font-semibold text-foreground">{Math.ceil(dDay / 7)}주</p>
          </>
        )}
      </div>
    </div>
  );
}
