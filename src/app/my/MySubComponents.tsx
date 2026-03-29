'use client';

import Link from 'next/link';
import { LogIn, ChevronRight } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { useStudyStore } from '@/stores/useStudyStore';
import { useQuizStore } from '@/stores/useQuizStore';
import type { WrongNote } from '@/types/study';

// ─── Guest view ───────────────────────────────────────────────────────────────

export function GuestBanner() {
  return (
    <div className="flex flex-col items-center gap-4 py-10 px-4 text-center rounded-2xl border border-dashed border-border bg-muted/20">
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary text-2xl font-bold">
        ?
      </div>
      <div>
        <p className="font-semibold text-foreground">로그인하면 기기 간 동기화됩니다</p>
        <p className="text-sm text-muted-foreground mt-1">
          학습 기록, 오답노트, 플래시카드가 모든 기기에서 유지됩니다.
        </p>
      </div>
      <Link
        href="/login"
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        <LogIn className="h-4 w-4" />
        로그인 / 회원가입
      </Link>
    </div>
  );
}

// ─── Subject progress tab ─────────────────────────────────────────────────────

export function SubjectProgressTab() {
  const { recentActivities } = useStudyStore();
  const wrongNotes = useQuizStore((s) => s.wrongNotes);

  // Group recent activities by subject
  type SubjectEntry = { slug: string; title: string; chapters: string[] };
  const subjectMap: Record<string, SubjectEntry> = {};
  for (const act of recentActivities) {
    if (!subjectMap[act.subjectSlug]) {
      subjectMap[act.subjectSlug] = { slug: act.subjectSlug, title: act.subjectTitle, chapters: [] };
    }
    if (!subjectMap[act.subjectSlug].chapters.includes(act.chapterSlug)) {
      subjectMap[act.subjectSlug].chapters.push(act.chapterSlug);
    }
  }

  // Wrong note counts by subject
  const wrongBySubject: Record<string, number> = {};
  for (const n of wrongNotes) {
    const subj = n.subject;
    wrongBySubject[subj] = (wrongBySubject[subj] ?? 0) + 1;
  }

  const subjects = Object.values(subjectMap);

  if (subjects.length === 0) {
    return (
      <EmptyState
        icon="📖"
        title="아직 학습 기록이 없어요"
        description="첫 과목을 시작해보세요!"
        action={{ label: '과목 학습 시작하기', href: '/concepts', ariaLabel: '과목 학습 페이지로 이동' }}
      />
    );
  }

  const maxChapters = Math.max(...subjects.map((s) => s.chapters.length), 1);

  return (
    <div className="space-y-3">
      {subjects.slice(0, 11).map(({ slug, title, chapters }) => {
        const pct = Math.round((chapters.length / Math.max(maxChapters, 1)) * 100);
        const wrongs = wrongBySubject[slug] ?? 0;
        return (
          <div key={slug}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-foreground truncate">{title}</span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                {wrongs > 0 && (
                  <span className="text-red-500">오답 {wrongs}</span>
                )}
                <span>{chapters.length}챕터</span>
              </div>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Recent wrong notes tab ───────────────────────────────────────────────────

export function RecentWrongTab() {
  const wrongNotes = useQuizStore((s) => s.wrongNotes);

  const recent: WrongNote[] = [...wrongNotes]
    .filter((n) => !n.mastered)
    .sort((a, b) => b.lastAttempt - a.lastAttempt)
    .slice(0, 5);

  if (recent.length === 0) {
    return (
      <EmptyState
        icon="✅"
        title="틀린 문제가 없어요"
        description="이대로 꾸준히 풀어보세요!"
      />
    );
  }

  return (
    <div className="space-y-2">
      {recent.map((note) => (
        <Link
          key={note.questionId}
          href="/wrong-notes"
          className="block p-3 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              {note.subject}
            </span>
            {note.attempts >= 3 && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400">
                {note.attempts}회 연속
              </span>
            )}
          </div>
          <p className="text-sm line-clamp-2 text-foreground text-muted-foreground">{note.questionId}</p>
        </Link>
      ))}
      <Link
        href="/wrong-notes"
        className="flex items-center justify-center gap-1 py-2 text-sm text-primary hover:underline"
      >
        전체 오답노트 보기
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
