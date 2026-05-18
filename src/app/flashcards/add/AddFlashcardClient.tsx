'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLeitnerStore } from '@/stores/useLeitnerStore';
import { filterFlashcardEligible, convertQuizBatch } from '@/lib/quiz/flashcard-converter';
import type { QuizQuestion } from '@/types/quiz';
import type { Subject } from '@/types/content';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, BookOpen, Check } from 'lucide-react';

type Tab = 'manual' | 'quiz';

// ─── 법/교육과정 우선 과목 ─────────────────────────────────────────────────────
const PRIORITY_SUBJECTS = ['laws', 'curriculum'];

function generateId(): string {
  return `card-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── 수동 입력 탭 ───────────────────────────────────────────────────────────────

function ManualTab({ subjects }: { subjects: Subject[] }) {
  const addCard = useLeitnerStore((s) => s.addCard);

  const [subjectSlug, setSubjectSlug] = useState(subjects[0]?.slug ?? '');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [successCount, setSuccessCount] = useState(0);
  const [lastAdded, setLastAdded] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    addCard({
      id: generateId(),
      subjectSlug,
      question: question.trim(),
      answer: answer.trim(),
    });

    setLastAdded(question.trim());
    setSuccessCount((c) => c + 1);
    setQuestion('');
    setAnswer('');
  }

  const selectedSubject = subjects.find((s) => s.slug === subjectSlug);

  return (
    <div className="space-y-4">
      {successCount > 0 && (
        <div className="rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-3 flex items-center gap-3">
          <Badge variant="secondary" className="shrink-0">+{successCount}</Badge>
          <p className="text-sm text-green-800 dark:text-green-300">
            <span className="font-medium">&ldquo;{lastAdded}&rdquo;</span> 카드가 추가되었어요.
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">새 카드</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">과목</label>
              <select
                value={subjectSlug}
                onChange={(e) => setSubjectSlug(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                {subjects.map((s) => (
                  <option key={s.slug} value={s.slug}>{s.title}</option>
                ))}
              </select>
              {selectedSubject && (
                <p className="text-xs text-muted-foreground">{selectedSubject.description}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="question">질문</label>
              <textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="예: IEP의 필수 구성요소 6가지는?"
                rows={3}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="answer">답</label>
              <textarea
                id="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="핵심 내용이나 정답을 입력하세요"
                rows={4}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none"
                required
              />
            </div>

            <Button type="submit" className="w-full min-h-[44px]" disabled={!question.trim() || !answer.trim()}>
              추가
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── 퀴즈에서 가져오기 탭 ───────────────────────────────────────────────────────

function QuizImportTab({ subjects, quizzes }: { subjects: Subject[]; quizzes: QuizQuestion[] }) {
  const addCard = useLeitnerStore((s) => s.addCard);
  const cards = useLeitnerStore((s) => s.cards);

  const [selectedSubject, setSelectedSubject] = useState('all');
  const [addedCount, setAddedCount] = useState(0);

  const existingQuizIds = useMemo(
    () => new Set(cards.filter((c) => c.quizId).map((c) => c.quizId!)),
    [cards],
  );

  const eligible = useMemo(() => filterFlashcardEligible(quizzes), [quizzes]);

  const subjectMap = useMemo(
    () => new Map(subjects.map((s) => [s.slug, s.title])),
    [subjects],
  );

  // 과목별 집계
  const subjectStats = useMemo(() => {
    const stats = new Map<string, { total: number; added: number }>();
    for (const q of eligible) {
      const entry = stats.get(q.subject) ?? { total: 0, added: 0 };
      entry.total++;
      if (existingQuizIds.has(q.id)) entry.added++;
      stats.set(q.subject, entry);
    }
    return stats;
  }, [eligible, existingQuizIds]);

  const filtered = useMemo(
    () => selectedSubject === 'all' ? eligible : eligible.filter((q) => q.subject === selectedSubject),
    [eligible, selectedSubject],
  );

  const filteredNotAdded = useMemo(
    () => filtered.filter((q) => !existingQuizIds.has(q.id)),
    [filtered, existingQuizIds],
  );

  function handleAddAll() {
    const { cards: newCards } = convertQuizBatch(filtered, existingQuizIds);
    for (const card of newCards) {
      addCard(card);
    }
    setAddedCount((c) => c + newCards.length);
  }

  function handleAddSingle(quiz: QuizQuestion) {
    const { cards: newCards } = convertQuizBatch([quiz], existingQuizIds);
    for (const card of newCards) {
      addCard(card);
    }
    setAddedCount((c) => c + newCards.length);
  }

  // 우선 과목을 앞에, 나머지는 알파벳순
  const sortedSubjects = useMemo(() => {
    const slugs = Array.from(subjectStats.keys());
    const priority = slugs.filter((s) => PRIORITY_SUBJECTS.includes(s));
    const rest = slugs.filter((s) => !PRIORITY_SUBJECTS.includes(s));
    return [...priority, ...rest];
  }, [subjectStats]);

  return (
    <div className="space-y-4">
      {addedCount > 0 && (
        <div className="rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-3">
          <p className="text-sm text-green-800 dark:text-green-300 font-medium">
            {addedCount}장의 카드가 추가되었어요
          </p>
        </div>
      )}

      {/* 과목 선택 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedSubject('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            selectedSubject === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          전체 ({eligible.length})
        </button>
        {sortedSubjects.map((slug) => {
          const stat = subjectStats.get(slug)!;
          const isPriority = PRIORITY_SUBJECTS.includes(slug);
          return (
            <button
              key={slug}
              onClick={() => setSelectedSubject(slug)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedSubject === slug
                  ? 'bg-primary text-primary-foreground'
                  : isPriority
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {subjectMap.get(slug) ?? slug} ({stat.total - stat.added}/{stat.total})
            </button>
          );
        })}
      </div>

      {/* 전체 추가 버튼 */}
      {filteredNotAdded.length > 0 && (
        <Button
          onClick={handleAddAll}
          className="w-full min-h-[44px] gap-2"
          aria-label={`${selectedSubject === 'all' ? '전체' : subjectMap.get(selectedSubject)} ${filteredNotAdded.length}장 추가`}
        >
          <Plus className="h-4 w-4" />
          {filteredNotAdded.length}장 전체 추가
        </Button>
      )}

      {filteredNotAdded.length === 0 && filtered.length > 0 && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          모든 카드가 이미 추가되었어요
        </div>
      )}

      {/* 퀴즈 목록 */}
      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        {filtered.map((quiz) => {
          const isAdded = existingQuizIds.has(quiz.id);
          return (
            <div
              key={quiz.id}
              className={`rounded-lg border p-3 transition-colors ${
                isAdded
                  ? 'border-border/50 bg-muted/30 opacity-60'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-relaxed line-clamp-2">{quiz.question}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                    <span>{subjectMap.get(quiz.subject) ?? quiz.subject}</span>
                    <span>·</span>
                    <Badge variant="outline" className="text-[10px] h-4">
                      {quiz.type === 'ox' ? 'OX' : '단답형'}
                    </Badge>
                  </div>
                </div>
                {isAdded ? (
                  <span className="shrink-0 p-1.5 text-muted-foreground">
                    <Check className="h-4 w-4" />
                  </span>
                ) : (
                  <button
                    onClick={() => handleAddSingle(quiz)}
                    className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    aria-label={`"${quiz.question.slice(0, 30)}" 카드 추가`}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 메인 컴포넌트 ──────────────────────────────────────────────────────────────

export default function AddFlashcardClient({
  subjects,
  quizzes,
}: {
  subjects: Subject[];
  quizzes: QuizQuestion[];
}) {
  const [tab, setTab] = useState<Tab>('quiz');

  return (
    <main className="max-w-xl mx-auto px-4 py-10 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">카드 추가</h1>
        <p className="text-sm text-muted-foreground">
          퀴즈에서 가져오거나 직접 만들 수 있어요.
        </p>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-border">
        {([
          { key: 'quiz' as Tab, label: '퀴즈에서 가져오기', icon: BookOpen },
          { key: 'manual' as Tab, label: '직접 만들기', icon: Plus },
        ]).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            aria-selected={tab === key}
            role="tab"
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* 탭 컨텐츠 */}
      {tab === 'manual' && <ManualTab subjects={subjects} />}
      {tab === 'quiz' && <QuizImportTab subjects={subjects} quizzes={quizzes} />}

      {/* 하단 네비 */}
      <div className="flex gap-3 justify-center">
        <Link
          href="/flashcards"
          className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'min-h-[44px]' })}
        >
          ← 플래시카드 홈
        </Link>
      </div>
    </main>
  );
}
