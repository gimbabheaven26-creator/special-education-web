'use client';

import { useState, useMemo } from 'react';
import type { QuizQuestion } from '@/types/quiz';
import { checkFillInAnswer } from '@/lib/answer-checker';
import { shuffle } from '@/lib/array-utils';
import { CheckCircle, XCircle, ChevronDown, ChevronUp, Eye, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SelfCheckSectionProps {
  items: string[];
  quizzes: QuizQuestion[];
}


// ─── Inline Quiz (single question, self-contained) ──────────────────────────

function InlineQuiz({ question }: { question: QuizQuestion }) {
  const [selected, setSelected] = useState<number | string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [fillInput, setFillInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [selfGraded, setSelfGraded] = useState<boolean | null>(null);

  const correctAnswer = question.answer;

  const isCompleted =
    (submitted && question.type !== 'descriptive') ||
    (question.type === 'descriptive' && selfGraded !== null);

  const handleScrollToContent = () => {
    const el = document.getElementById('chapter-content');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const isCorrect = useMemo(() => {
    if (question.type === 'descriptive') return selfGraded === true;
    if (!submitted) return false;
    if (question.type === 'multiple') {
      return selected === Number(correctAnswer);
    }
    if (question.type === 'ox') {
      return String(selected) === String(correctAnswer);
    }
    if (question.type === 'fill_in') {
      return checkFillInAnswer(fillInput, String(correctAnswer));
    }
    return false;
  }, [submitted, selected, fillInput, correctAnswer, question.type, selfGraded]);

  const handleMultipleSelect = (index: number) => {
    if (submitted) return;
    setSelected(index);
    setSubmitted(true);
  };

  const handleOXSelect = (choice: string) => {
    if (submitted) return;
    setSelected(choice);
    setSubmitted(true);
  };

  const handleFillSubmit = () => {
    if (!fillInput.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="mt-3 p-4 rounded-lg bg-muted/40 border border-border">
      <p className="text-sm font-medium mb-3 leading-relaxed">{question.question}</p>

      {/* Multiple choice */}
      {question.type === 'multiple' && question.options && (
        <div className="space-y-2 mb-3">
          {question.options.map((option, index) => {
            let cls =
              'w-full text-left p-3 rounded-lg border border-border text-sm transition-colors';
            if (submitted) {
              if (index === Number(correctAnswer)) {
                cls += ' border-green-500 bg-green-50 dark:bg-green-950/20';
              } else if (index === selected && index !== Number(correctAnswer)) {
                cls += ' border-red-500 bg-red-50 dark:bg-red-950/20';
              } else {
                cls += ' bg-muted/30 opacity-60';
              }
            } else {
              cls += ' hover:bg-muted/50 cursor-pointer';
            }
            return (
              <button
                key={index}
                className={cls}
                onClick={() => handleMultipleSelect(index)}
                disabled={submitted}
              >
                <span className="font-medium mr-2">{index + 1}.</span>
                {option}
              </button>
            );
          })}
        </div>
      )}

      {/* OX choice */}
      {question.type === 'ox' && (
        <div className="flex gap-3 mb-3">
          {['O', 'X'].map((choice) => {
            let cls =
              'flex-1 h-14 text-2xl font-bold rounded-lg border border-border transition-colors';
            if (submitted) {
              if (choice === String(correctAnswer)) {
                cls += ' border-green-500 bg-green-50 dark:bg-green-950/20 text-green-600';
              } else if (choice === selected && choice !== String(correctAnswer)) {
                cls += ' border-red-500 bg-red-50 dark:bg-red-950/20 text-red-600';
              } else {
                cls += ' bg-muted/30 text-muted-foreground';
              }
            } else {
              cls += ' hover:bg-muted/50 cursor-pointer';
            }
            return (
              <button
                key={choice}
                className={cls}
                onClick={() => handleOXSelect(choice)}
                disabled={submitted}
              >
                {choice}
              </button>
            );
          })}
        </div>
      )}

      {/* Fill-in */}
      {question.type === 'fill_in' && (
        <div className="mb-3">
          <div className="flex gap-2">
            <Input
              value={fillInput}
              onChange={(e) => setFillInput(e.target.value)}
              onKeyDown={(e) => !submitted && e.key === 'Enter' && handleFillSubmit()}
              placeholder="정답 입력"
              disabled={submitted}
              className={`h-10 ${submitted ? (isCorrect ? 'border-green-500' : 'border-red-500') : ''}`}
            />
            {!submitted && (
              <Button onClick={handleFillSubmit} disabled={!fillInput.trim()} size="sm" className="h-10">
                확인
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Descriptive */}
      {question.type === 'descriptive' && (
        <div className="mb-3">
          <textarea
            value={descInput}
            onChange={(e) => setDescInput(e.target.value)}
            placeholder="답안을 작성하세요..."
            disabled={showModelAnswer}
            rows={4}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60 resize-y mb-2"
          />
          {!showModelAnswer && (
            <Button
              onClick={() => { if (descInput.trim()) setShowModelAnswer(true); }}
              disabled={!descInput.trim()}
              size="sm"
              className="w-full gap-2"
            >
              <Eye className="h-4 w-4" />
              모범답안 보기
            </Button>
          )}
          {showModelAnswer && (
            <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 dark:border-emerald-700 dark:bg-emerald-950/20 mb-2">
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">모범답안</p>
              <p className="text-sm leading-relaxed text-emerald-900 dark:text-emerald-200 whitespace-pre-wrap">
                {String(correctAnswer)}
              </p>
            </div>
          )}
          {showModelAnswer && selfGraded === null && (
            <div className="flex gap-2">
              <button
                onClick={() => setSelfGraded(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-green-300 text-green-700 text-sm font-medium hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-950/20"
              >
                <CheckCircle className="h-4 w-4" /> 맞았어요
              </button>
              <button
                onClick={() => setSelfGraded(false)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-red-300 text-red-700 text-sm font-medium hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/20"
              >
                <XCircle className="h-4 w-4" /> 틀렸어요
              </button>
            </div>
          )}
        </div>
      )}

      {/* Result (non-descriptive) */}
      {submitted && question.type !== 'descriptive' && (
        <div className="flex items-center gap-2 text-sm">
          {isCorrect ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-green-700 dark:text-green-400 font-medium">정답!</span>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-red-700 dark:text-red-400 font-medium">
                오답 — 정답: {question.type === 'multiple' ? `${Number(correctAnswer) + 1}번` : String(correctAnswer)}
              </span>
            </>
          )}
        </div>
      )}

      {/* Descriptive result */}
      {question.type === 'descriptive' && selfGraded !== null && (
        <div className="flex items-center gap-2 text-sm">
          {selfGraded ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-green-700 dark:text-green-400 font-medium">정답 처리</span>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-red-700 dark:text-red-400 font-medium">오답 처리</span>
            </>
          )}
        </div>
      )}

      {/* Explanation */}
      {isCompleted && question.explanation && (
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
          💡 {question.explanation}
        </p>
      )}

      {/* 다시 공부하기 */}
      {isCompleted && (
        <button
          onClick={handleScrollToContent}
          className="mt-3 flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <BookOpen className="h-3.5 w-3.5" />
          다시 공부하기
        </button>
      )}
    </div>
  );
}

// ─── Self Check Item ─────────────────────────────────────────────────────────

function SelfCheckItem({
  text,
  quiz,
}: {
  text: string;
  quiz: QuizQuestion | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <li className="list-none">
      <button
        className="flex items-start gap-3 w-full text-left py-2 group"
        onClick={() => quiz && setOpen((prev) => !prev)}
        disabled={!quiz}
      >
        <span className="mt-0.5 flex-shrink-0">
          {quiz ? (
            open ? (
              <ChevronUp className="h-5 w-5 text-primary" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            )
          ) : (
            <span className="inline-block w-5 h-5 rounded border border-border" />
          )}
        </span>
        <span className={`text-sm leading-relaxed ${quiz ? 'group-hover:text-primary transition-colors cursor-pointer' : 'text-muted-foreground'}`}>
          {text}
        </span>
      </button>
      {open && quiz && <InlineQuiz key={quiz.id} question={quiz} />}
    </li>
  );
}

// ─── Main Section ────────────────────────────────────────────────────────────

export function SelfCheckSection({ items, quizzes }: SelfCheckSectionProps) {
  // Assign one random quiz per self-check item (no duplicates)
  const assignedQuizzes = useMemo(() => {
    const shuffled = shuffle(quizzes);
    return items.map((_, i) => shuffled[i] ?? null);
  }, [items, quizzes]);

  if (items.length === 0) return null;

  return (
    <section className="mt-8 pt-6 border-t border-border">
      <h2 className="text-xl font-bold mb-4">자가점검</h2>
      {quizzes.length > 0 && (
        <p className="text-xs text-muted-foreground mb-4">
          항목을 클릭하면 관련 퀴즈를 풀 수 있습니다
        </p>
      )}
      <ul className="space-y-1">
        {items.map((text, i) => (
          <SelfCheckItem key={i} text={text} quiz={assignedQuizzes[i]} />
        ))}
      </ul>
    </section>
  );
}
