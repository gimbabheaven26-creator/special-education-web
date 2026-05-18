'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import type { HydratedWrongNote } from './WrongNotesClient';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, CopyPlus, RotateCcw } from 'lucide-react';
import { Users } from 'lucide-react';
import { useLeitnerStore } from '@/stores/useLeitnerStore';
import type { ErrorPattern } from '@/lib/study/error-patterns';
import { ErrorPatternBadge } from './ErrorPatternBadge';
import { buildWrongNoteReviewActions } from './review-actions';

const TYPE_LABELS: Record<string, string> = {
  ox: 'OX',
  multiple: '객관식',
  fill_in: '주관식',
  descriptive: '서술형',
};

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function formatAnswer(answer: string | number, note: HydratedWrongNote): string {
  const { question } = note;
  if (!question) return String(answer);
  if (question.type === 'multiple' && question.options) {
    const idx = Number(answer);
    const option = question.options[idx];
    return option ? `${idx + 1}. ${option}` : String(answer);
  }
  return String(answer);
}

interface WrongNoteCardProps {
  note: HydratedWrongNote;
  chapterTitle?: string;
  errorPatterns?: ErrorPattern[];
  wrongCount?: number;
  onMarkMastered: (questionId: string) => void;
  onUnmarkMastered: (questionId: string) => void;
  onDelete: (questionId: string) => void;
}

export default function WrongNoteCard({
  note,
  chapterTitle,
  errorPatterns,
  wrongCount,
  onMarkMastered,
  onUnmarkMastered,
  onDelete,
}: WrongNoteCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [savedToFlashcard, setSavedToFlashcard] = useState(false);
  const addCard = useLeitnerStore((s) => s.addCard);
  const leitnerCards = useLeitnerStore((s) => s.cards);
  const { question } = note;
  const questionText = question?.question ?? '';
  const shouldTruncate = questionText.length > 80;
  const reviewActions = buildWrongNoteReviewActions(question, chapterTitle);

  const alreadyInFlashcard = leitnerCards.some((c) => c.id === `wrong-${note.questionId}`);

  const handleSaveToFlashcard = useCallback(() => {
    if (alreadyInFlashcard || savedToFlashcard || !question) return;
    const quizType = question.type === 'ox' || question.type === 'fill_in' ? question.type : undefined;
    addCard({
      id: `wrong-${note.questionId}`,
      subjectSlug: question.subject,
      question: questionText,
      answer: String(question.answer),
      source: quizType === 'ox' ? 'quiz-ox' : quizType === 'fill_in' ? 'quiz-fill_in' : undefined,
      chapterSlug: question.chapter,
      quizId: question.id,
      quizType,
    });
    setSavedToFlashcard(true);
  }, [addCard, alreadyInFlashcard, savedToFlashcard, question, note.questionId, questionText]);

  const isStreak = note.attempts >= 3 && !note.mastered;

  return (
    <Card className={`${note.mastered ? 'opacity-60' : ''} ${isStreak ? 'border-red-400 dark:border-red-700' : ''}`}>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {question && <Badge variant="outline">{TYPE_LABELS[question.type] ?? question.type}</Badge>}
          <Badge variant="secondary">{note.attempts}회 시도</Badge>
          {isStreak && (
            <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
              {note.attempts}회 연속 오답
            </Badge>
          )}
          {wrongCount != null && wrongCount > 0 && (
            <Badge variant="outline" className="text-muted-foreground gap-1">
              <Users className="h-3 w-3" aria-hidden="true" />
              {wrongCount}명도 틀렸어요
            </Badge>
          )}
          {note.mastered && (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              완료
            </Badge>
          )}
          <span className="ml-auto text-xs text-muted-foreground">
            {formatDate(note.lastAttempt)}
          </span>
        </div>

        {errorPatterns && errorPatterns.length > 0 && (
          <ErrorPatternBadge patterns={errorPatterns} />
        )}

        <button
          type="button"
          className="w-full text-left"
          onClick={() => setExpanded((prev) => !prev)}
        >
          <p className="text-sm font-medium leading-relaxed">
            {shouldTruncate && !expanded
              ? `${questionText.slice(0, 80)}...`
              : questionText}
          </p>
          {shouldTruncate && (
            <span className="text-xs text-muted-foreground">
              {expanded ? '접기' : '더 보기'}
            </span>
          )}
        </button>

        <div className="space-y-1 rounded-lg bg-muted/50 p-3 text-sm">
          <p className="text-red-600 dark:text-red-400">
            <span className="font-medium">내 답: </span>
            {formatAnswer(note.userAnswer, note)}
          </p>
          <p className="text-green-600 dark:text-green-400">
            <span className="font-medium">정답: </span>
            {question ? formatAnswer(question.answer, note) : '-'}
          </p>
        </div>

        {expanded && question?.explanation && (
          <div className="space-y-2 rounded-lg bg-blue-50 p-3 text-sm dark:bg-blue-950/30">
            <p className="font-medium text-blue-800 dark:text-blue-300">해설</p>
            <p className="leading-relaxed text-blue-700 dark:text-blue-200">
              {question.explanation}
            </p>
            {question.wrongExplanations && Object.keys(question.wrongExplanations).length > 0 && (
              <div className="mt-2 space-y-1 border-t border-blue-200 pt-2 dark:border-blue-800">
                <p className="font-medium text-blue-800 dark:text-blue-300">오답 선지 해설</p>
                {Object.entries(question.wrongExplanations).map(([key, text]) => (
                  <p key={key} className="leading-relaxed text-blue-600 dark:text-blue-300/80">
                    <span className="font-medium">{key}: </span>{text as string}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
          <p className="text-xs font-semibold text-foreground">이 오답 다음 복습</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {reviewActions.map((action) => {
              const Icon = action.kind === 'concept' ? BookOpen : RotateCcw;
              return (
                <Link
                  key={action.kind}
                  href={action.href}
                  aria-label={action.ariaLabel}
                  className="inline-flex min-h-[36px] items-center justify-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {action.label}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={handleSaveToFlashcard}
              disabled={alreadyInFlashcard || savedToFlashcard}
              className="inline-flex min-h-[36px] items-center justify-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CopyPlus className="h-3.5 w-3.5" />
              {alreadyInFlashcard || savedToFlashcard ? '플래시카드 저장됨' : '플래시카드로 저장'}
            </button>
          </div>
          {reviewActions.length === 0 && (
            <p className="text-xs text-muted-foreground">
              문제 정보를 불러오면 개념 복습과 다시 풀기 링크가 표시됩니다.
            </p>
          )}
        </div>

        {reviewActions.length === 0 && (
          <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSaveToFlashcard}
            disabled={alreadyInFlashcard || savedToFlashcard}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CopyPlus className="h-3.5 w-3.5" />
            {alreadyInFlashcard || savedToFlashcard ? '플래시카드 저장됨' : '플래시카드로 저장'}
          </button>
          </div>
        )}

        <div className="flex gap-2">
          {note.mastered ? (
            <Button
              variant="outline"
              size="sm"
              className="min-h-[44px] flex-1"
              onClick={() => onUnmarkMastered(note.questionId)}
            >
              완료 취소
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              className="min-h-[44px] flex-1"
              onClick={() => onMarkMastered(note.questionId)}
            >
              완료 처리
            </Button>
          )}
          <Button
            variant="destructive"
            size="sm"
            className="min-h-[44px]"
            onClick={() => onDelete(note.questionId)}
          >
            삭제
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
