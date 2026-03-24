'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuizStore } from '@/stores/useQuizStore';
import type { DiagnosticSession } from '@/stores/useQuizStore';
import { ChevronDown, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { getConceptUrl } from '@/lib/concept-urls';

const TYPE_LABELS: Record<DiagnosticSession['type'], string> = {
  ox: 'OX 진단',
  fill_in: '단답형',
};

const EXPANDABLE_COUNT = 3;
const VISIBLE_COUNT = 5;

function SessionCard({ session, defaultOpen }: { session: DiagnosticSession; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const allQuestions = useQuizStore((s) => s.quizHistory);

  // questionIds로 실제 문제 데이터 매칭
  const questionDetails = session.results.map((r) => {
    const history = allQuestions.find((h) => h.questionId === r.questionId);
    return { ...r, subject: history?.subject, chapter: history?.chapter, question: history?.question };
  });

  return (
    <div className="bg-background">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          {open ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
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
          <span>{session.stats.correct}/{session.stats.total}</span>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-3 space-y-1">
          {questionDetails.map((item, i) => (
            <div
              key={item.questionId}
              className="flex items-start gap-2 py-1.5 border-t border-border/50 first:border-0"
            >
              {item.isCorrect ? (
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground truncate">
                  {item.question ?? `문제 ${i + 1}`}
                </p>
                {item.subject && (
                  <Link
                    href={getConceptUrl(item.subject)}
                    className="text-[11px] text-primary hover:underline"
                  >
                    개념 복습하기
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function RecentDiagnostics() {
  const sessions = useQuizStore((s) => s.diagnosticSessions);

  const sorted = sessions
    .slice()
    .sort((a, b) => b.completedAt - a.completedAt);

  const recent = sorted.slice(0, VISIBLE_COUNT);

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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <span aria-hidden="true">&#128202;</span> 최근 진단 기록
        </h2>
        {sorted.length > VISIBLE_COUNT && (
          <Link
            href="/my"
            className="text-xs text-primary hover:underline"
          >
            전체 기록 보기
          </Link>
        )}
      </div>
      <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
        {recent.map((session, i) => (
          <SessionCard
            key={session.id}
            session={session}
            defaultOpen={i < EXPANDABLE_COUNT}
          />
        ))}
      </div>
    </section>
  );
}
