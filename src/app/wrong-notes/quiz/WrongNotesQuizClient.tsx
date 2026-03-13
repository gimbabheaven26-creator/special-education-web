'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuizStore } from '@/stores/useQuizStore';
import { useStudyStore } from '@/stores/useStudyStore';
import type { WrongNote } from '@/types/study';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  MultipleChoice,
  OXChoice,
  FillInChoice,
  CaseContextBox,
} from '@/app/quiz/[subject]/QuestionCard';

interface QuizAnswer {
  questionId: string;
  isCorrect: boolean;
}

interface WrongNotesQuizClientProps {
  readonly subjectTitleMap: Readonly<Record<string, string>>;
  readonly chapterTitleMap: Readonly<Record<string, string>>;
}

export default function WrongNotesQuizClient({ subjectTitleMap, chapterTitleMap }: WrongNotesQuizClientProps) {
  const wrongNotes = useQuizStore((s) => s.wrongNotes);
  const addWrongNote = useQuizStore((s) => s.addWrongNote);
  const markMastered = useQuizStore((s) => s.markMastered);
  const addQuizResult = useQuizStore((s) => s.addQuizResult);
  const recordQuizResult = useStudyStore((s) => s.recordQuizResult);

  const unmasteredNotes = useMemo(
    () => wrongNotes.filter((n) => !n.mastered),
    [wrongNotes],
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [finished, setFinished] = useState(false);

  // Snapshot the questions at mount to avoid shifting indices
  const [questions] = useState(() =>
    unmasteredNotes.map((n) => ({ ...n })),
  );

  const currentNote: WrongNote | undefined = questions[currentIndex];

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
      } else {
        addWrongNote(currentNote.question, userAnswer);
      }

      if (currentIndex + 1 >= questions.length) {
        setFinished(true);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    },
    [currentNote, answers, currentIndex, questions.length, markMastered, addWrongNote, recordQuizResult, addQuizResult],
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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">오답 재시험</h1>
        <Badge variant="outline">
          {currentIndex + 1} / {questions.length}
        </Badge>
      </div>

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
          {(question.type === 'fill_in' || question.type === 'descriptive') && (
            <FillInChoice
              key={question.id}
              question={question}
              onAnswer={(answer, isCorrect) => handleAnswer(answer, isCorrect)}
            />
          )}
        </CardContent>
      </Card>

      <Button
        render={<Link href="/wrong-notes" />}
        variant="ghost"
        size="sm"
        className="min-h-[44px]"
      >
        오답 노트로 돌아가기
      </Button>
    </main>
  );
}
