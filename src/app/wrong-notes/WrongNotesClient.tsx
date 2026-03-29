'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useQuizStore } from '@/stores/useQuizStore';
import { useLeitnerStore } from '@/stores/useLeitnerStore';
import type { WrongNote } from '@/types/study';
import type { QuizQuestion } from '@/types/quiz';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import WrongNoteCard from './WrongNoteCard';
import SrsReviewMode from './SrsReviewMode';
import { detectErrorPatterns } from '@/lib/study/error-patterns';
import { WrongNoteAI } from '@/components/WrongNoteAI';
import { EmptyState } from '@/components/ui/EmptyState';

export interface HydratedWrongNote extends WrongNote {
  question: QuizQuestion | null;
}

type SortMode = 'recent' | 'attempts' | 'oldest';

function groupBySubject<T extends WrongNote>(notes: T[]): Record<string, T[]> {
  return notes.reduce<Record<string, T[]>>((acc, note) => {
    const subject = note.subject;
    return {
      ...acc,
      [subject]: [...(acc[subject] ?? []), note],
    };
  }, {});
}

interface WrongNotesClientProps {
  readonly subjectTitleMap: Readonly<Record<string, string>>;
  readonly chapterTitleMap: Readonly<Record<string, string>>;
  readonly allQuestions: readonly QuizQuestion[];
}

export default function WrongNotesClient({ subjectTitleMap, chapterTitleMap, allQuestions }: WrongNotesClientProps) {
  const searchParams = useSearchParams();
  const wrongNotes = useQuizStore((s) => s.wrongNotes);
  const quizHistory = useQuizStore((s) => s.quizHistory);
  const markMastered = useQuizStore((s) => s.markMastered);
  const unmarkMastered = useQuizStore((s) => s.unmarkMastered);
  const removeWrongNote = useQuizStore((s) => s.removeWrongNote);
  const diagnosticSessions = useQuizStore((s) => s.diagnosticSessions);
  const leitnerGetStats = useLeitnerStore((s) => s.getStats);

  const hydrated = useMemo<HydratedWrongNote[]>(() => {
    const qMap = new Map(allQuestions.map((q) => [q.id, q]));
    return wrongNotes.map((n) => ({ ...n, question: qMap.get(n.questionId) ?? null }));
  }, [wrongNotes, allQuestions]);

  const initialTab = searchParams.get('tab') === 'srs' ? 'srs' : 'all';
  const [activeTab, setActiveTab] = useState<'all' | 'srs'>(initialTab);
  const srsStats = useMemo(() => leitnerGetStats(), [leitnerGetStats]);

  const errorPatternsMap = useMemo(() => {
    const map = new Map<string, ReturnType<typeof detectErrorPatterns>>();
    for (const note of wrongNotes) {
      map.set(note.questionId, detectErrorPatterns(note, quizHistory));
    }
    return map;
  }, [wrongNotes, quizHistory]);

  const [subjectFilter, setSubjectFilter] = useState<string>(
    () => searchParams.get('subject') ?? 'all',
  );
  const [chapterFilter, setChapterFilter] = useState<string>(
    () => searchParams.get('chapter') ?? 'all',
  );
  const [sessionFilter, setSessionFilter] = useState<string>('all');
  const [showMastered, setShowMastered] = useState(true);
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [collapsedSubjects, setCollapsedSubjects] = useState<Set<string>>(new Set());

  const subjects = useMemo(() => {
    const set = new Set(wrongNotes.map((n) => n.subject));
    return Array.from(set).sort();
  }, [wrongNotes]);

  const chapters = useMemo(() => {
    if (subjectFilter === 'all') return [];
    const set = new Set(
      hydrated
        .filter((n) => n.subject === subjectFilter)
        .map((n) => n.question?.chapter)
        .filter((ch): ch is string => ch != null),
    );
    return Array.from(set).sort();
  }, [hydrated, subjectFilter]);

  const filteredNotes = useMemo(() => {
    let notes: HydratedWrongNote[] = hydrated;

    if (subjectFilter !== 'all') {
      notes = notes.filter((n) => n.subject === subjectFilter);
    }
    if (chapterFilter !== 'all') {
      notes = notes.filter((n) => n.question?.chapter === chapterFilter);
    }
    if (sessionFilter !== 'all') {
      notes = notes.filter((n) => n.sessionId === sessionFilter);
    }
    if (!showMastered) {
      notes = notes.filter((n) => !n.mastered);
    }

    const sorted = [...notes].sort((a, b) => {
      if (sortMode === 'recent') return b.lastAttempt - a.lastAttempt;
      if (sortMode === 'oldest') return a.lastAttempt - b.lastAttempt;
      return b.attempts - a.attempts;
    });

    return sorted;
  }, [hydrated, subjectFilter, chapterFilter, sessionFilter, showMastered, sortMode]);

  const stats = useMemo(() => {
    const total = wrongNotes.length;
    const mastered = wrongNotes.filter((n) => n.mastered).length;
    return { total, mastered, unmastered: total - mastered };
  }, [wrongNotes]);

  const weakChapters = useMemo(() => {
    const map = new Map<string, { chapter: string; subject: string; wrongCount: number }>();
    for (const note of hydrated) {
      const chapterKey = note.question?.chapter;
      if (!chapterKey) continue;
      const key = `${note.subject}::${chapterKey}`;
      const existing = map.get(key);
      if (existing) {
        existing.wrongCount += note.attempts;
      } else {
        map.set(key, {
          chapter: chapterTitleMap[`${note.subject}::${chapterKey}`] || chapterKey,
          subject: subjectTitleMap[note.subject] || note.subject,
          wrongCount: note.attempts,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.wrongCount - a.wrongCount).slice(0, 10);
  }, [hydrated, subjectTitleMap, chapterTitleMap]);

  const grouped = useMemo(() => groupBySubject(filteredNotes), [filteredNotes]);

  const toggleCollapse = (subject: string) => {
    setCollapsedSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(subject)) {
        next.delete(subject);
      } else {
        next.add(subject);
      }
      return next;
    });
  };

  if (wrongNotes.length === 0) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">오답 노트</h1>
          <p className="text-muted-foreground text-sm">
            틀린 문제를 모아 복습하세요.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="text-5xl" aria-hidden="true">✨</div>
          <p className="text-lg font-semibold text-foreground">
            아직 오답이 없어요
          </p>
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
            퀴즈를 풀면 틀린 문제가 자동으로 여기에 쌓여요.
            틀리는 게 실력의 시작이에요!
          </p>
          <Button render={<Link href="/quiz" />} size="lg" className="min-h-[44px]">
            첫 퀴즈 시작하기
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">오답 노트</h1>
        <p className="text-muted-foreground text-sm">
          틀린 문제를 모아 복습하세요.
        </p>
      </div>

      {/* 탭 전환 */}
      <div className="flex border-b border-border" role="tablist" aria-label="오답 노트 보기 방식">
        <button
          role="tab"
          aria-selected={activeTab === 'all'}
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors min-h-[44px] ${
            activeTab === 'all'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          전체 오답
          {stats.unmastered > 0 && (
            <span className="ml-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" aria-label={`미완료 오답 ${stats.unmastered}개`}>
              {stats.unmastered}
            </span>
          )}
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'srs'}
          onClick={() => setActiveTab('srs')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 min-h-[44px] ${
            activeTab === 'srs'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          간격 반복
          {srsStats.dueToday > 0 && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" aria-label={`오늘 복습할 카드 ${srsStats.dueToday}장`}>
              {srsStats.dueToday}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'srs' ? (
        <SrsReviewMode />
      ) : (
      <>
      {/* Stats */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">전체</span>
          <Badge variant="secondary">{stats.total}개</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">미완료</span>
          <Badge variant={stats.unmastered > 0 ? 'destructive' : 'outline'}>
            {stats.unmastered}개
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">완료</span>
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            {stats.mastered}개
          </Badge>
        </div>
      </div>

      {/* 챕터 분포 차트 */}
      {weakChapters.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <p className="text-sm font-semibold">챕터별 오답 분포</p>
          <div className="space-y-1.5">
            {weakChapters.slice(0, 5).map(({ chapter, subject, wrongCount }) => {
              const maxCount = weakChapters[0].wrongCount;
              const pct = Math.round((wrongCount / maxCount) * 100);
              return (
                <div key={`${subject}::${chapter}`} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-28 truncate shrink-0">{chapter}</span>
                  <div className="flex-1 h-4 rounded bg-muted overflow-hidden">
                    <div
                      className="h-full rounded bg-red-400 dark:bg-red-600 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium w-8 text-right shrink-0">{wrongCount}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI 약점 분석 */}
      <WrongNoteAI weakChapters={weakChapters} />

      {/* Re-quiz button */}
      {stats.unmastered > 0 && (
        <Button
          render={<Link href="/wrong-notes/quiz" />}
          size="lg"
          className="w-full min-h-[44px]"
        >
          오답 재시험 ({stats.unmastered}문제)
        </Button>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={subjectFilter}
          onChange={(e) => {
            setSubjectFilter(e.target.value);
            setChapterFilter('all');
          }}
          className="min-h-[44px] rounded-lg border border-border bg-background px-3 text-sm"
        >
          <option value="all">전체 과목</option>
          {subjects.map((s) => (
            <option key={s} value={s}>{subjectTitleMap[s] || s}</option>
          ))}
        </select>

        {diagnosticSessions.length > 0 && (
          <select
            value={sessionFilter}
            onChange={(e) => setSessionFilter(e.target.value)}
            className="min-h-[44px] rounded-lg border border-border bg-background px-3 text-sm"
          >
            <option value="all">전체 세션</option>
            {diagnosticSessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label} ({s.type === 'ox' ? 'OX' : '단답형'})
              </option>
            ))}
          </select>
        )}

        {chapters.length > 0 && (
          <select
            value={chapterFilter}
            onChange={(e) => setChapterFilter(e.target.value)}
            className="min-h-[44px] rounded-lg border border-border bg-background px-3 text-sm"
          >
            <option value="all">전체 챕터</option>
            {chapters.map((ch) => (
              <option key={ch} value={ch}>
                {chapterTitleMap[`${subjectFilter}::${ch}`] || ch}
              </option>
            ))}
          </select>
        )}

        <select
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as SortMode)}
          className="min-h-[44px] rounded-lg border border-border bg-background px-3 text-sm"
        >
          <option value="recent">최신순</option>
          <option value="oldest">오래된순</option>
          <option value="attempts">시도 횟수순</option>
        </select>

        <label className="flex items-center gap-2 min-h-[44px] cursor-pointer">
          <input
            type="checkbox"
            checked={showMastered}
            onChange={(e) => setShowMastered(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          <span className="text-sm">완료 포함</span>
        </label>
      </div>

      {/* Grouped notes */}
      {filteredNotes.length === 0 ? (
        <EmptyState
          title="필터 조건에 맞는 오답이 없어요"
          description="다른 과목이나 조건으로 검색해보세요."
          action={{ label: '전체 오답 보기', href: '/wrong-notes', ariaLabel: '필터 초기화하고 전체 오답 보기' }}
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([subject, notes]) => (
            <section key={subject}>
              <button
                type="button"
                className="flex w-full items-center justify-between py-2 min-h-[44px]"
                onClick={() => toggleCollapse(subject)}
              >
                <h2 className="text-lg font-semibold">{subjectTitleMap[subject] || subject}</h2>
                <Badge variant="outline">{notes.length}개</Badge>
              </button>
              {!collapsedSubjects.has(subject) && (
                <div className="space-y-3 mt-2">
                  {notes.map((note) => (
                    <WrongNoteCard
                      key={note.questionId}
                      note={note}
                      errorPatterns={errorPatternsMap.get(note.questionId)}
                      onMarkMastered={markMastered}
                      onUnmarkMastered={unmarkMastered}
                      onDelete={removeWrongNote}
                    />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
      </>
      )}
    </main>
  );
}
