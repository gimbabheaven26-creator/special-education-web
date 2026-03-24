'use client';

import { useState, useEffect } from 'react';
import type { QuizQuestion } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import {
  ChevronDown, ChevronUp,
  ThumbsUp, ThumbsDown, Flag,
} from 'lucide-react';
import { useQuizStore } from '@/stores/useQuizStore';

// ─── ErrorReportSection ─────────────────────────────────────────────────────

function ErrorReportSection({ questionId }: { questionId: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const addErrorReport = useQuizStore((s) => s.addErrorReport);

  const handleSubmit = () => {
    if (!message.trim()) return;
    addErrorReport(questionId, message.trim());
    setSubmitted(true);
    setMessage('');
  };

  if (submitted) {
    return (
      <span className="text-xs text-muted-foreground">신고가 접수되었습니다</span>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen((prev) => !prev)}
        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
      >
        <Flag className="h-3.5 w-3.5" />
        오류 신고
      </Button>
      {open && (
        <div className="w-full mt-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="오류 내용을 간략히 적어주세요"
            className="w-full text-xs rounded-md border border-border bg-background p-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            rows={2}
          />
          <div className="flex gap-2 mt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSubmit}
              disabled={!message.trim()}
              className="h-6 px-2 text-xs"
            >
              제출
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              className="h-6 px-2 text-xs text-muted-foreground"
            >
              취소
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── QuestionActions ────────────────────────────────────────────────────────

export function QuestionActions({ question }: { question: QuizQuestion }) {
  const { getFeedback, addFeedback } = useQuizStore();
  const currentFeedback = getFeedback(question.id);

  return (
    <div className="mb-4">
      <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:flex-wrap">
        <span className="text-xs text-muted-foreground mr-1">이 문제가 도움이 됐나요?</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => addFeedback(question.id, 'up')}
          className={`h-7 px-2 gap-1 text-xs ${
            currentFeedback === 'up'
              ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => addFeedback(question.id, 'down')}
          className={`h-7 px-2 gap-1 text-xs ${
            currentFeedback === 'down'
              ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <ThumbsDown className="h-3.5 w-3.5" />
        </Button>
        <span className="mx-1 text-border">|</span>
        <ErrorReportSection questionId={question.id} />
      </div>
      {question.source && (
        <p className="mt-2 text-xs text-muted-foreground">
          출처: {question.source}
        </p>
      )}
    </div>
  );
}

// ─── Explanation Toggle ─────────────────────────────────────────────────────

export function ExplanationToggle({
  explanation,
  defaultOpen = false,
}: {
  explanation: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (defaultOpen) setOpen(true);
  }, [defaultOpen]);

  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1 text-sm font-medium text-blue-700 dark:text-blue-300 hover:underline"
      >
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        해설 보기
      </button>
      {open && (
        <div className="mt-2 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300">{explanation}</p>
        </div>
      )}
    </div>
  );
}

// ─── Wrong Explanation Box ──────────────────────────────────────────────────

export function WrongExplanationBox({ text }: { text: string }) {
  return (
    <div className="mb-3 p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
      <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">
        선택한 답이 틀린 이유
      </p>
      <p className="text-sm text-red-700 dark:text-red-300">{text}</p>
    </div>
  );
}

// ─── Feedback Section ───────────────────────────────────────────────────────

export function FeedbackSection({
  question,
  isCorrect,
  selectedOptionIndex,
}: {
  question: QuizQuestion;
  isCorrect: boolean;
  selectedOptionIndex?: string;
}) {
  const wrongExplanation =
    !isCorrect && selectedOptionIndex && question.wrongExplanations
      ? question.wrongExplanations[selectedOptionIndex]
      : undefined;

  return (
    <>
      {wrongExplanation && <WrongExplanationBox text={wrongExplanation} />}
      <ExplanationToggle
        explanation={question.explanation}
        defaultOpen
      />
      <QuestionActions question={question} />
    </>
  );
}
