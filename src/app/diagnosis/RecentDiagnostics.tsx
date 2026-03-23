'use client';

import Link from 'next/link';
import { useQuizStore } from '@/stores/useQuizStore';
import type { DiagnosticSession } from '@/stores/useQuizStore';

const TYPE_LABELS: Record<DiagnosticSession['type'], string> = {
  ox: 'OX 진단',
  fill_in: '단답형',
};

export function RecentDiagnostics() {
  const sessions = useQuizStore((s) => s.diagnosticSessions);

  const recent = sessions
    .slice()
    .sort((a, b) => b.completedAt - a.completedAt)
    .slice(0, 5);

  if (recent.length === 0) {
    return (
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <span aria-hidden="true">&#128202;</span> 최근 진단 기록
        </h2>
        <div className="rounded-xl border border-border bg-muted/30 p-6 text-center text-muted-foreground">
          <p>아직 진단 기록이 없습니다.</p>
          <Link
            href="/quiz/ox"
            className="inline-block mt-2 text-primary font-medium hover:underline"
          >
            OX 진단부터 시작해보세요!
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <span aria-hidden="true">&#128202;</span> 최근 진단 기록
      </h2>
      <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
        {recent.map((session) => (
          <div
            key={session.id}
            className="flex items-center justify-between px-4 py-3 bg-background hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground">
                {session.label}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                {TYPE_LABELS[session.type] ?? session.type}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {session.stats.rate}%
              </span>
              <span>{session.stats.total}문제</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
