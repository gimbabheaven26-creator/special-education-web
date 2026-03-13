'use client';

import { useState } from 'react';
import type { WrongNote } from '@/types/study';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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

function formatAnswer(answer: string | number, note: WrongNote): string {
  const { question } = note;
  if (question.type === 'multiple' && question.options) {
    const idx = Number(answer);
    const option = question.options[idx];
    return option ? `${idx + 1}. ${option}` : String(answer);
  }
  return String(answer);
}

interface WrongNoteCardProps {
  note: WrongNote;
  onMarkMastered: (questionId: string) => void;
  onUnmarkMastered: (questionId: string) => void;
  onDelete: (questionId: string) => void;
}

export default function WrongNoteCard({
  note,
  onMarkMastered,
  onUnmarkMastered,
  onDelete,
}: WrongNoteCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { question } = note;
  const questionText = question.question;
  const shouldTruncate = questionText.length > 80;

  return (
    <Card className={note.mastered ? 'opacity-60' : ''}>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{TYPE_LABELS[question.type] ?? question.type}</Badge>
          <Badge variant="secondary">{note.attempts}회 시도</Badge>
          {note.mastered && (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              완료
            </Badge>
          )}
          <span className="ml-auto text-xs text-muted-foreground">
            {formatDate(note.lastAttempt)}
          </span>
        </div>

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
            {formatAnswer(question.answer, note)}
          </p>
        </div>

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
