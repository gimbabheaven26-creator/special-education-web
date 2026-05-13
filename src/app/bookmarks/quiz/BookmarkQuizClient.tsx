'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useBookmarkStore } from '@/stores/useBookmarkStore';
import { useQuizStore } from '@/stores/useQuizStore';
import { useStudyStore } from '@/stores/useStudyStore';
import { useLeitnerStore } from '@/stores/useLeitnerStore';
import { CONCEPTS_FOLDER_TO_SLUG } from '@/lib/content/concept-urls';
import type { QuizQuestion } from '@/types/quiz';
import { createScoreTiers, getScoreTier } from '@/lib/study/score-tiers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Bookmark } from 'lucide-react';
import {
  MultipleChoice,
  OXChoice,
  FillInChoice,
  DescriptiveChoice,
  ScenarioCompositeChoice,
  CaseContextBox,
} from '@/app/quiz/[subject]/QuestionCard';
import { XPToast } from '@/app/quiz/[subject]/ProgressDots';
import { ComboIndicator } from '@/components/quiz/ComboIndicator';
import { XP_TOAST_CORRECT, XP_TOAST_WRONG, getComboBonus } from '@/lib/study/xp-constants';

interface BookmarkQuizClientProps {
  readonly subjectTitleMap: Readonly<Record<string, string>>;
  readonly chapterTitleMap: Readonly<Record<string, string>>;
}

const BOOKMARK_QUIZ_TIERS = createScoreTiers([
  '북마크한 챕터를 완벽하게 정복했어요! 대단해요!',
  '북마크한 챕터를 거의 완벽하게 소화했어요!',
  '잘하고 있어요! 몇 개만 더 정리하면 될 거예요.',
  '조금씩 감을 잡고 있어요. 개념을 다시 보면 빠르게 올라요.',
  '북마크한 챕터를 개념학습에서 다시 읽어보면 도움이 될 거예요!',
  '시작이 반이에요! 북마크한 개념을 하나씩 읽어보면 금방 감이 올 거예요.',
]);

/** bookmark.path에서 { subjectSlug, chapterSlug } 추출 */
function parseBookmarkPath(path: string): { subjectSlug: string; chapterSlug: string } | null {
  const match = path.match(/^\/concepts\/([^/]+)\/([^/]+)/);
  if (!match) return null;
  const folder = decodeURIComponent(match[1]);
  const subjectSlug = CONCEPTS_FOLDER_TO_SLUG[folder];
  if (!subjectSlug) return null;
  const chapterSlug = decodeURIComponent(match[2]);
  return { subjectSlug, chapterSlug };
}

export default function BookmarkQuizClient({ subjectTitleMap, chapterTitleMap }: BookmarkQuizClientProps) {
  const bookmarks = useBookmarkStore((s) => s.bookmarks);
  const addWrongNote = useQuizStore((s) => s.addWrongNote);
  const addQuizResult = useQuizStore((s) => s.addQuizResult);
  const recordQuizResult = useStudyStore((s) => s.recordQuizResult);

  const chapterPairsKey = useMemo(() => {
    const seen = new Set<string>();
    const keys: string[] = [];
    for (const bm of bookmarks) {
      const parsed = parseBookmarkPath(bm.path);
      if (!parsed) continue;
      const key = `${parsed.subjectSlug}::${parsed.chapterSlug}`;
      if (seen.has(key)) continue;
      seen.add(key);
      keys.push(key);
    }
    return keys.sort().join(',');
  }, [bookmarks]);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (hasLoaded) return;

    if (!chapterPairsKey) {
      setQuestions([]);
      setLoading(false);
      setLoadError(false);
      return;
    }

    const chapters = chapterPairsKey.split(',').map((k) => {
      const [subject, chapter] = k.split('::');
      return { subject, chapter };
    });
    let cancelled = false;

    setLoading(true);
    setLoadError(false);

    fetch('/api/quiz/by-chapters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chapters }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch bookmark quizzes: ${res.status}`);
        return res.json() as Promise<{ quizzes?: QuizQuestion[] }>;
      })
      .then((data) => {
        if (cancelled) return;
        const quizzes: QuizQuestion[] = data.quizzes ?? [];
        const filtered = quizzes.filter((q) => {
          if (q.type === 'fill_in' && (q.caseContext || q.question.length > 100)) return false;
          return true;
        });
        setQuestions(filtered);
        setHasLoaded(true);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError(true);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [hasLoaded, retryKey, chapterPairsKey]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; isCorrect: boolean }[]>([]);
  const [finished, setFinished] = useState(false);
  const [comboStreak, setComboStreak] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [xpToast, setXpToast] = useState<{ amount: number; visible: boolean }>({ amount: 0, visible: false });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentQuestion: QuizQuestion | undefined = questions[currentIndex];

  const showXPToast = useCallback((amount: number) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setXpToast({ amount, visible: true });
    toastTimerRef.current = setTimeout(() => {
      setXpToast((prev) => ({ ...prev, visible: false }));
    }, 1200);
  }, []);

  const handleAnswer = useCallback(
    (userAnswer: string | number, isCorrect: boolean) => {
      if (!currentQuestion) return;

      setAnswers((prev) => [...prev, { questionId: currentQuestion.id, isCorrect }]);

      recordQuizResult(isCorrect);
      addQuizResult({
        questionId: currentQuestion.id,
        userAnswer,
        isCorrect,
        timestamp: Date.now(),
        subject: currentQuestion.subject,
        chapter: currentQuestion.chapter,
      });

      if (!isCorrect) {
        addWrongNote(currentQuestion, userAnswer);
      }

      useLeitnerStore.getState().answerCard(currentQuestion.id, isCorrect ? 'knew' : 'forgot');

      const newCombo = isCorrect ? comboStreak + 1 : 0;
      setComboStreak(newCombo);

      let earned = isCorrect ? XP_TOAST_CORRECT : XP_TOAST_WRONG;
      const combo = isCorrect ? getComboBonus(newCombo) : null;
      if (combo) earned += combo.bonus;
      setXpEarned((prev) => prev + earned);
      showXPToast(earned);

      if (currentIndex + 1 >= questions.length) {
        setFinished(true);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    },
    [currentQuestion, currentIndex, questions.length, comboStreak, addWrongNote, recordQuizResult, addQuizResult, showXPToast],
  );

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="h-8 w-48 bg-muted rounded animate-pulse mb-6" />
        <div className="h-64 bg-muted rounded-xl animate-pulse" />
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <h1 className="text-2xl font-bold tracking-tight">북마크 퀴즈</h1>
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <p className="text-lg font-medium text-muted-foreground">퀴즈를 불러오지 못했어요</p>
          <p className="text-sm text-muted-foreground">잠시 후 다시 시도해 주세요.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button type="button" size="lg" className="min-h-[44px]" onClick={() => setRetryKey((p) => p + 1)}>
              다시 불러오기
            </Button>
            <Button render={<Link href="/bookmarks" />} variant="outline" size="lg" className="min-h-[44px]">
              북마크로 돌아가기
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (questions.length === 0) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <h1 className="text-2xl font-bold tracking-tight">북마크 퀴즈</h1>
        <EmptyState
          icon={<Bookmark className="h-16 w-16 text-muted-foreground/30" />}
          title="북마크한 챕터의 퀴즈가 없어요"
          description="챕터를 북마크하면 해당 챕터의 퀴즈를 모아서 풀 수 있어요."
          action={{ label: '과목 학습하러 가기', href: '/concepts', ariaLabel: '과목 학습 페이지로 이동' }}
        />
      </main>
    );
  }

  if (finished) {
    const correctCount = answers.filter((a) => a.isCorrect).length;
    const totalCount = answers.length;
    const rate = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    const tier = getScoreTier(rate, BOOKMARK_QUIZ_TIERS);

    return (
      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <h1 className="text-2xl font-bold tracking-tight">북마크 퀴즈 결과</h1>

        {tier && (
          <div className="flex flex-col items-center text-center space-y-2">
            <span className="text-5xl" aria-hidden="true">{tier.emoji}</span>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">{tier.message}</p>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-3xl">
              {correctCount} / {totalCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{correctCount}</p>
                <p className="text-sm text-muted-foreground">정답</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{totalCount - correctCount}</p>
                <p className="text-sm text-muted-foreground">오답</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{rate}%</p>
                <p className="text-sm text-muted-foreground">정답률</p>
              </div>
            </div>
            {xpEarned > 0 && (
              <p className="text-center text-sm text-primary font-medium">+{xpEarned} XP 획득!</p>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button render={<Link href="/bookmarks" />} variant="outline" size="lg" className="flex-1 min-h-[44px]">
            북마크로 돌아가기
          </Button>
          <Button render={<Link href="/bookmarks/quiz" />} size="lg" className="flex-1 min-h-[44px]">
            다시 풀기
          </Button>
        </div>
      </main>
    );
  }

  const question = currentQuestion;

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <XPToast amount={xpToast.amount} visible={xpToast.visible} />

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">북마크 퀴즈</h1>
        <Badge variant="outline">
          {currentIndex + 1} / {questions.length}
        </Badge>
      </div>

      {comboStreak >= 3 && <ComboIndicator streak={comboStreak} />}

      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {subjectTitleMap[question.subject] || question.subject}
            </Badge>
            <Badge variant="outline">
              {chapterTitleMap[`${question.subject}::${question.chapter}`] || question.chapter}
            </Badge>
          </div>

          {question.caseContext && <CaseContextBox caseContext={question.caseContext} />}

          <p className="text-base font-medium leading-relaxed">{question.question}</p>

          {question.type === 'multiple' && (
            <MultipleChoice key={question.id} question={question} onAnswer={(a, c) => handleAnswer(a, c)} />
          )}
          {question.type === 'ox' && (
            <OXChoice key={question.id} question={question} onAnswer={(a, c) => handleAnswer(a, c)} />
          )}
          {question.type === 'fill_in' && (
            <FillInChoice key={question.id} question={question} onAnswer={(a, c) => handleAnswer(a, c)} />
          )}
          {question.type === 'descriptive' && (
            <DescriptiveChoice key={question.id} question={question} onAnswer={(a, c) => handleAnswer(a, c)} />
          )}
          {question.type === 'scenario_composite' && (
            <ScenarioCompositeChoice key={question.id} question={question} onAnswer={(a, c) => handleAnswer(a, c)} />
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <Link
            href={`/concepts/${subjectTitleMap[question.subject] || question.subject}`}
            className="text-xs text-primary hover:underline px-2 py-1"
          >
            개념 보기
          </Link>
          <Button render={<Link href="/bookmarks" />} variant="ghost" size="sm" className="min-h-[44px]">
            북마크로 돌아가기
          </Button>
        </div>
      </div>
    </main>
  );
}
