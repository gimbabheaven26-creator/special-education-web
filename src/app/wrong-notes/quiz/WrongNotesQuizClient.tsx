'use client';

import { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { useQuizStore } from '@/stores/useQuizStore';
import { useStudyStore } from '@/stores/useStudyStore';
import { useLeitnerStore } from '@/stores/useLeitnerStore';
import type { QuizQuestion } from '@/types/quiz';
import { Badge } from '@/components/ui/badge';
import { createScoreTiers, getScoreTier } from '@/lib/study/score-tiers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface QuizAnswer {
  questionId: string;
  isCorrect: boolean;
}

/** WrongNote hydrated with a guaranteed non-null question */
interface QuizReadyNote {
  questionId: string;
  subject: string;
  userAnswer: string | number;
  attempts: number;
  lastAttempt: number;
  mastered: boolean;
  question: QuizQuestion;
}

interface WrongNotesQuizClientProps {
  readonly subjectTitleMap: Readonly<Record<string, string>>;
  readonly chapterTitleMap: Readonly<Record<string, string>>;
  readonly allQuestions: readonly QuizQuestion[];
}

const WRONG_QUIZ_TIERS = createScoreTiers([
  '거의 완벽하게 극복했어요! 이 오답들은 이제 실력이에요.',
  '많이 잡았어요! 나머지 몇 문제만 정리하면 될 거예요.',
  '조금씩 감이 오고 있어요. 틀린 문제를 다시 보면 빠르게 올라요.',
  '아직 어려운 문제들이에요. 해설을 꼼꼼히 보고 다시 도전해봐요!',
]);

/** "2024 전공A 11번" → "2024년도 기출 A형 11번" / "...동형" → "2024 A-11 동형" */
function formatSourceBadge(source: string): { label: string; variant: 'kice' | 'similar' | 'none' } {
  const m = source.match(/(\d{4})\s+전공([AB])\s+(\d+)번/);
  if (!m) return { label: source, variant: 'none' };
  const [, year, type, num] = m;
  if (source.includes('동형')) return { label: `${year} ${type}-${num} 동형`, variant: 'similar' };
  return { label: `${year}년도 기출 ${type}형 ${num}번`, variant: 'kice' };
}

export default function WrongNotesQuizClient({ subjectTitleMap, chapterTitleMap, allQuestions }: WrongNotesQuizClientProps) {
  const wrongNotes = useQuizStore((s) => s.wrongNotes);
  const addWrongNote = useQuizStore((s) => s.addWrongNote);
  const markMastered = useQuizStore((s) => s.markMastered);
  const addQuizResult = useQuizStore((s) => s.addQuizResult);
  const recordQuizResult = useStudyStore((s) => s.recordQuizResult);

  // Synchronous hydration via allQuestions prop (server-loaded) — no async needed
  // Snapshot at mount to prevent list changing mid-quiz
  const [questions] = useState<QuizReadyNote[]>(() => {
    const qMap = new Map(allQuestions.map((q) => [q.id, q]));
    return wrongNotes.flatMap((n) => {
      if (n.mastered) return [];
      const q = qMap.get(n.questionId);
      if (!q) return [];
      // fill_in 중 지문 포함(caseContext 있음) 또는 100자 초과 긴 문제 제외
      if (q.type === 'fill_in' && (q.caseContext || q.question.length > 100)) return [];
      return [{ ...n, question: q }];
    });
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [finished, setFinished] = useState(false);
  const [comboStreak, setComboStreak] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [xpToast, setXpToast] = useState<{ amount: number; visible: boolean }>({
    amount: 0,
    visible: false,
  });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentNote: QuizReadyNote | undefined = questions[currentIndex];

  const showXPToast = useCallback((amount: number) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setXpToast({ amount, visible: true });
    toastTimerRef.current = setTimeout(() => {
      setXpToast((prev) => ({ ...prev, visible: false }));
    }, 1200);
  }, []);

  const handleAnswer = useCallback(
    (userAnswer: string | number, isCorrect: boolean) => {
      if (!currentNote) return;

      const newAnswer: QuizAnswer = {
        questionId: currentNote.questionId,
        isCorrect,
      };
      const updatedAnswers = [...answers, newAnswer];
      setAnswers(updatedAnswers);

      // Record in study store (XP, streak, daily stats)
      recordQuizResult(isCorrect);

      // Record in quiz store (history)
      addQuizResult({
        questionId: currentNote.questionId,
        userAnswer,
        isCorrect,
        timestamp: Date.now(),
        subject: currentNote.question.subject,
        chapter: currentNote.question.chapter,
      });

      if (isCorrect) {
        markMastered(currentNote.questionId);
        useLeitnerStore.getState().answerCard(currentNote.questionId, true);
      } else {
        addWrongNote(currentNote.question, userAnswer);
      }

      // Combo tracking
      const newCombo = isCorrect ? comboStreak + 1 : 0;
      setComboStreak(newCombo);

      // XP calculation
      let earned = isCorrect ? XP_TOAST_CORRECT : XP_TOAST_WRONG;
      const combo = isCorrect ? getComboBonus(newCombo) : null;
      if (combo) {
        earned += combo.bonus;
      }
      setXpEarned((prev) => prev + earned);
      showXPToast(earned);

      if (currentIndex + 1 >= questions.length) {
        setFinished(true);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    },
    [currentNote, answers, currentIndex, questions.length, comboStreak, markMastered, addWrongNote, recordQuizResult, addQuizResult, showXPToast],
  );

  // Empty state
  if (questions.length === 0) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">오답 재시험</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <p className="text-lg font-medium text-muted-foreground">
            재시험할 오답이 없어요
          </p>
          <p className="text-sm text-muted-foreground">
            모든 오답을 완료 처리했거나 아직 오답이 없습니다.
          </p>
          <Button
            render={<Link href="/wrong-notes" />}
            size="lg"
            className="min-h-[44px]"
          >
            오답 노트로 돌아가기
          </Button>
        </div>
      </main>
    );
  }

  // Results
  if (finished) {
    const correctCount = answers.filter((a) => a.isCorrect).length;
    const totalCount = answers.length;
    const rate = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

    return (
      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">재시험 결과</h1>
        </div>

        {/* 감성 피드백 */}
        {(() => {
          const tier = getScoreTier(rate, WRONG_QUIZ_TIERS);
          if (!tier) return null;
          return (
            <div className="flex flex-col items-center text-center space-y-2">
              <span className="text-5xl" aria-hidden="true">{tier.emoji}</span>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                {tier.message}
              </p>
            </div>
          );
        })()}

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
              <p className="text-center text-sm text-primary font-medium">
                +{xpEarned} XP 획득!
              </p>
            )}
            {correctCount > 0 && (
              <p className="text-center text-sm text-green-600">
                맞은 문제 {correctCount}개가 완료 처리되었어요.
              </p>
            )}
            {totalCount - correctCount > 0 && (
              <p className="text-center text-sm text-muted-foreground">
                틀린 문제 {totalCount - correctCount}개는 다음 재시험에서 다시 만나요.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            render={<Link href="/wrong-notes" />}
            variant="outline"
            size="lg"
            className="flex-1 min-h-[44px]"
          >
            오답 노트로 돌아가기
          </Button>
          <Button
            render={<Link href="/wrong-notes/quiz" />}
            size="lg"
            className="flex-1 min-h-[44px]"
          >
            다시 재시험
          </Button>
        </div>
      </main>
    );
  }

  // Quiz in progress
  const question = currentNote.question;

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <XPToast amount={xpToast.amount} visible={xpToast.visible} />

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">오답 재시험</h1>
        <Badge variant="outline">
          {currentIndex + 1} / {questions.length}
        </Badge>
      </div>

      {comboStreak >= 3 && (
        <ComboIndicator streak={comboStreak} />
      )}

      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {subjectTitleMap[question.subject] || question.subject}
            </Badge>
            <Badge variant="outline">
              {chapterTitleMap[`${question.subject}::${question.chapter}`] || question.chapter}
            </Badge>
            {question.source && (() => {
              const { label, variant } = formatSourceBadge(question.source);
              const cls =
                variant === 'kice'
                  ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                  : variant === 'similar'
                  ? 'border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950/40 dark:text-green-300'
                  : 'text-muted-foreground';
              return (
                <Badge variant="outline" className={`font-normal ${cls}`}>
                  {label}
                </Badge>
              );
            })()}
          </div>

          {question.caseContext && (
            <CaseContextBox caseContext={question.caseContext} />
          )}

          <p className="text-base font-medium leading-relaxed">
            {question.question}
          </p>

          {question.type === 'multiple' && (
            <MultipleChoice
              key={question.id}
              question={question}
              onAnswer={(answer, isCorrect) => handleAnswer(answer, isCorrect)}
            />
          )}
          {question.type === 'ox' && (
            <OXChoice
              key={question.id}
              question={question}
              onAnswer={(answer, isCorrect) => handleAnswer(answer, isCorrect)}
            />
          )}
          {question.type === 'fill_in' && (
            <FillInChoice
              key={question.id}
              question={question}
              onAnswer={(answer, isCorrect) => handleAnswer(answer, isCorrect)}
            />
          )}
          {question.type === 'descriptive' && (
            <DescriptiveChoice
              key={question.id}
              question={question}
              onAnswer={(answer, isCorrect) => handleAnswer(answer, isCorrect)}
            />
          )}
          {question.type === 'scenario_composite' && (
            <ScenarioCompositeChoice
              key={question.id}
              question={question}
              onAnswer={(answer, isCorrect) => handleAnswer(answer, isCorrect)}
            />
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
          <Button
            render={<Link href="/wrong-notes" />}
            variant="ghost"
            size="sm"
            className="min-h-[44px]"
          >
            오답 노트로 돌아가기
          </Button>
        </div>
      </div>
    </main>
  );
}
