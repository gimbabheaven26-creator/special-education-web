'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trophy, BookOpen, ChevronRight, Check, X } from 'lucide-react';
import { SUBJECT_LABELS } from '@/types/kice';
import type { KiceQuestion } from '@/types/kice';

interface Props {
  question: KiceQuestion;
  year: number;
  session: string;
  dateStr: string;
}

type AnswerState = 'unanswered' | 'correct' | 'wrong';

export function TodayChallenge({ question, year, session, dateStr }: Props) {
  const [userAnswer, setUserAnswer] = useState('');
  const [state, setState] = useState<AnswerState>('unanswered');
  const [showAnswer, setShowAnswer] = useState(false);

  const storageKey = `today-challenge-${dateStr}`;

  // 이미 풀었으면 복원
  const [alreadyDone] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(storageKey) !== null;
  });

  const handleSubmit = () => {
    if (!userAnswer.trim()) return;

    const blanks = question.blanks;
    const answers = blanks
      ? Object.values(blanks).map((b) => b.answer.toLowerCase().trim())
      : [];

    const isCorrect = answers.some(
      (ans) => userAnswer.trim().toLowerCase().includes(ans)
    );

    const result = isCorrect ? 'correct' : 'wrong';
    setState(result);
    setShowAnswer(true);

    try {
      localStorage.setItem(storageKey, result);
    } catch { /* quota exceeded — 무시 */ }
  };

  const subjectLabels = question.subjects
    .map((s) => SUBJECT_LABELS[s] ?? s)
    .join(', ');

  return (
    <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-5 space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
            <Trophy className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">오늘의 도전</h2>
            <p className="text-[11px] text-muted-foreground">
              {year}년 {session} Q{question.number} · {subjectLabels}
            </p>
          </div>
        </div>
        <Link
          href={`/kice?year=${year}&session=${encodeURIComponent(session)}#q-${question.number}`}
          className="text-xs text-primary hover:underline flex items-center gap-0.5"
        >
          전체 보기
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {/* 문제 지문 */}
      <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
        {question.context.length > 200
          ? question.context.slice(0, 200) + '...'
          : question.context}
      </p>

      {/* 키워드 */}
      {question.keywords.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {question.keywords.slice(0, 4).map((kw) => (
            <span
              key={kw}
              className="text-[10px] text-muted-foreground bg-muted/50 rounded px-1.5 py-0.5"
            >
              #{kw}
            </span>
          ))}
        </div>
      )}

      {/* 답변 영역 */}
      {alreadyDone ? (
        <div className="rounded-lg bg-muted/30 p-3 text-center">
          <p className="text-sm text-muted-foreground">오늘의 도전을 이미 완료했어요!</p>
          <Link
            href={`/kice?year=${year}&session=${encodeURIComponent(session)}#q-${question.number}`}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
          >
            <BookOpen className="h-3 w-3" />
            해설 보기
          </Link>
        </div>
      ) : state === 'unanswered' ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="정답을 입력하세요"
            className="flex-1 px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            aria-label="오늘의 도전 정답 입력"
          />
          <button
            onClick={handleSubmit}
            disabled={!userAnswer.trim()}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            제출
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div
            className={`flex items-center gap-2 rounded-lg p-3 ${
              state === 'correct'
                ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50'
                : 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50'
            }`}
          >
            {state === 'correct' ? (
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <X className="h-4 w-4 text-red-600 dark:text-red-400" />
            )}
            <span className="text-sm font-medium">
              {state === 'correct' ? '정답!' : '아쉬워요'}
            </span>
          </div>

          {showAnswer && question.blanks && (
            <div className="text-xs text-muted-foreground">
              정답:{' '}
              {Object.values(question.blanks)
                .map((b) => b.answer)
                .join(', ')}
            </div>
          )}

          <Link
            href={`/kice?year=${year}&session=${encodeURIComponent(session)}#q-${question.number}`}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <BookOpen className="h-3 w-3" />
            해설과 모범답안 보기
          </Link>
        </div>
      )}
    </div>
  );
}
