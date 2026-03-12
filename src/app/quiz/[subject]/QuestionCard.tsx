'use client';

import { useState } from 'react';
import type { QuizQuestion } from '@/types/quiz';
import { checkFillInAnswer } from '@/lib/answer-checker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle } from 'lucide-react';
import { FeedbackSection } from './QuestionActions';

// ─── Case Context Box ───────────────────────────────────────────────────────

export function CaseContextBox({ caseContext }: { caseContext: string }) {
  return (
    <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950/20">
      <p className="mb-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
        {'📋 사례'}
      </p>
      <p className="text-sm leading-relaxed text-amber-900 dark:text-amber-200">
        {caseContext}
      </p>
    </div>
  );
}

// ─── MultipleChoice ─────────────────────────────────────────────────────────

export function MultipleChoice({
  question,
  onAnswer,
}: {
  question: QuizQuestion;
  onAnswer: (answer: number, isCorrect: boolean) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = submitted && selected !== null && selected === Number(question.answer);

  const handleSelect = (index: number) => {
    if (submitted) return;
    setSelected(index);
    setSubmitted(true);
  };

  const handleNext = () => {
    if (selected === null) return;
    onAnswer(selected, selected === Number(question.answer));
  };

  return (
    <div>
      <div className="space-y-3 mb-6">
        {question.options?.map((option, index) => {
          let className =
            'w-full text-left p-4 rounded-lg border border-border transition-colors cursor-pointer';
          if (submitted) {
            if (index === Number(question.answer)) {
              className += ' border-green-500 bg-green-50 dark:bg-green-950/20';
            } else if (index === selected && index !== Number(question.answer)) {
              className += ' border-red-500 bg-red-50 dark:bg-red-950/20';
            } else {
              className += ' bg-muted/30';
            }
          } else if (selected === index) {
            className += ' border-primary bg-primary/10';
          } else {
            className += ' hover:bg-muted/50';
          }

          return (
            <button
              key={index}
              className={className}
              onClick={() => handleSelect(index)}
              disabled={submitted}
            >
              <span className="text-sm font-medium mr-2">{index + 1}.</span>
              <span className="text-sm">{option}</span>
            </button>
          );
        })}
      </div>
      {submitted && (
        <div className="mb-2 flex items-center gap-2">
          {isCorrect ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
          <span className="text-sm font-medium">
            {isCorrect ? '정답입니다!' : `오답 (정답: ${Number(question.answer) + 1}번)`}
          </span>
        </div>
      )}
      {submitted && (
        <FeedbackSection
          question={question}
          isCorrect={isCorrect}
          selectedOptionIndex={selected !== null ? String(selected) : undefined}
        />
      )}
      <div className="flex gap-3">
        {submitted && (
          <Button onClick={handleNext} className="w-full min-h-[44px]">
            다음
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── OXChoice ───────────────────────────────────────────────────────────────

export function OXChoice({
  question,
  onAnswer,
}: {
  question: QuizQuestion;
  onAnswer: (answer: string, isCorrect: boolean) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = submitted && selected === String(question.answer);

  const handleSelect = (choice: string) => {
    if (submitted) return;
    setSelected(choice);
    setSubmitted(true);
  };

  const handleNext = () => {
    if (!selected) return;
    onAnswer(selected, selected === String(question.answer));
  };

  return (
    <div>
      <div className="flex gap-4 mb-6">
        {['O', 'X'].map((choice) => {
          let className =
            'flex-1 h-20 text-3xl font-bold rounded-xl border border-border transition-colors cursor-pointer';
          if (submitted) {
            if (choice === String(question.answer)) {
              className += ' border-green-500 bg-green-50 dark:bg-green-950/20 text-green-600';
            } else if (choice === selected && choice !== String(question.answer)) {
              className += ' border-red-500 bg-red-50 dark:bg-red-950/20 text-red-600';
            } else {
              className += ' bg-muted/30 text-muted-foreground';
            }
          } else if (selected === choice) {
            className += ' border-primary bg-primary/10 text-primary';
          } else {
            className += ' hover:bg-muted/50';
          }

          return (
            <button
              key={choice}
              className={className}
              onClick={() => handleSelect(choice)}
              disabled={submitted}
            >
              {choice}
            </button>
          );
        })}
      </div>
      {submitted && (
        <div className="mb-2 flex items-center gap-2">
          {isCorrect ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
          <span className="text-sm font-medium">
            {isCorrect ? '정답입니다!' : `오답 (정답: ${String(question.answer)})`}
          </span>
        </div>
      )}
      {submitted && (
        <FeedbackSection
          question={question}
          isCorrect={isCorrect}
          selectedOptionIndex={selected === 'O' ? '0' : '1'}
        />
      )}
      <div className="flex gap-3">
        {submitted && (
          <Button onClick={handleNext} className="w-full min-h-[44px]">
            다음
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── FillInChoice ───────────────────────────────────────────────────────────

export function FillInChoice({
  question,
  onAnswer,
}: {
  question: QuizQuestion;
  onAnswer: (answer: string, isCorrect: boolean) => void;
}) {
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = submitted && checkFillInAnswer(input, String(question.answer));

  const handleSubmit = () => {
    if (!input.trim()) return;
    setSubmitted(true);
  };

  const handleNext = () => {
    onAnswer(input.trim(), checkFillInAnswer(input, String(question.answer)));
  };

  return (
    <div>
      <div className="mb-6">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => !submitted && e.key === 'Enter' && handleSubmit()}
          placeholder="정답을 입력하세요"
          disabled={submitted}
          className={`h-12 ${submitted ? (isCorrect ? 'border-green-500' : 'border-red-500') : ''}`}
        />
      </div>
      {submitted && (
        <div className="mb-2 flex items-center gap-2">
          {isCorrect ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
          <span className="text-sm font-medium">
            {isCorrect ? '정답입니다!' : `오답 (정답: ${String(question.answer)})`}
          </span>
        </div>
      )}
      {submitted && (
        <FeedbackSection question={question} isCorrect={isCorrect} />
      )}
      <div className="flex gap-3">
        {!submitted ? (
          <Button onClick={handleSubmit} disabled={!input.trim()} className="w-full min-h-[44px]">
            제출
          </Button>
        ) : (
          <Button onClick={handleNext} className="w-full min-h-[44px]">
            다음 문제
          </Button>
        )}
      </div>
    </div>
  );
}
