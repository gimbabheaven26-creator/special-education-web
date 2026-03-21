'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useQuizStore } from '@/stores/useQuizStore';
import { useStudyStore } from '@/stores/useStudyStore';
import type { WrongNote } from '@/types/study';
import type { Confidence } from '@/types/quiz';
import { Badge } from '@/components/ui/badge';
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
import { ConfidenceToggle } from '@/components/quiz/ConfidenceToggle';
import { XP_TOAST_CORRECT, XP_TOAST_WRONG, getComboBonus } from '@/lib/xp-constants';

interface QuizAnswer {
  questionId: string;
  isCorrect: boolean;
}

interface WrongNotesQuizClientProps {
  readonly subjectTitleMap: Readonly<Record<string, string>>;
  readonly chapterTitleMap: Readonly<Record<string, string>>;
}

/** "2024 전공A 11번" → "2024년도 기출 A형 11번" / "...동형" → "2024 A-11 동형" */
function formatSourceBadge(source: string): string {
  const m = source.match(/(\d{4})\s+전공([AB])\s+(\d+)번/);
  if (!m) return source;
  const [, year, type, num] = m;
  if (source.includes('동형')) return `${year} ${type}-${num} 동형`;
  return `${year}년도 기출 ${type}형 ${num}번`;
}

export default function WrongNotesQuizClient({ subjectTitleMap, chapterTitleMap }: WrongNotesQuizClientProps) {
  const wrongNotes = useQuizStore((s) => s.wrongNotes);
  const addWrongNote = useQuizStore((s) => s.addWrongNote);
  const markMastered = useQuizStore((s) => s.markMastered);
  const addQuizResult = useQuizStore((s) => s.addQuizResult);
  const recordQuizResult = useStudyStore((s) => s.recordQuizResult);

  const unmasteredNotes = useMemo(
    () => wrongNotes.filter((n) => {
      if (n.mastered) return false;
      // fill_in 중 지문 포함(caseContext 있음) 또는 100자 초과 긴 문제 제외
      if (n.question.type === 'fill_in' && (n.question.caseContext || n.question.question.length > 100)) return false;
      return true;
    }),
    [wrongNotes],
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [finished, setFinished] = useState(false);
  const [comboStreak, setComboStreak] = useState(0);
  const [confidence, setConfidence] = useState<Confidence>('sure');
  const [xpEarned, setXpEarned] = useState(0);
  const [xpToast, setXpToast] = useState<{ amount: number; visible: boolean }>({
    amount: 0,
    visible: false,
  });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Snapshot the questions at mount to avoid shifting indices
  const [questions] = useState(() =>
    unmasteredNotes.map((n) => ({ ...n })),
  );

  const currentNote: WrongNote | undefined = questions[currentIndex];

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

      // Record in quiz store (history) with confidence
      addQuizResult({
        questionId: currentNote.questionId,
        userAnswer,
        isCorrect,
        timestamp: Date.now(),
        subject: currentNote.question.subject,
        chapter: currentNote.question.chapter,
        confidence,
      });

      if (isCorrect) {
        markMastered(currentNote.questionId);
      } else {
        addWrongNote(currentNote.question, userAnswer);
      }

      // Reset confidence for next question
      setConfidence('sure');

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
    [currentNote, answers, currentIndex, questions.length, comboStreak, confidence, markMastered, addWrongNote, recordQuizResult, addQuizResult, showXPToast],
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
                맞은 문제 {correctCount}개가 완료 처리되었습니다.
              </p>
            )}
            {totalCount - correctCount > 0 && (
              <p className="text-center text-sm text-red-600">
                틀린 문제 {totalCount - correctCount}개의 시도 횟수가 증가했습니다.
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
            {question.source && (
              <Badge variant="outline" className="text-muted-foreground font-normal">
                {formatSourceBadge(question.source)}
              </Badge>
            )}
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

      <div className="flex items-center justify-between">
        <ConfidenceToggle value={confidence} onChange={setConfidence} />
        <Button
          render={<Link href="/wrong-notes" />}
          variant="ghost"
          size="sm"
          className="min-h-[44px]"
        >
          오답 노트로 돌아가기
        </Button>
      </div>
    </main>
  );
}
