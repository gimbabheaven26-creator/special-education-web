'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, CheckCircle, Eye, EyeOff } from 'lucide-react';
import type { KiceQuestion } from '@/types/kice';
import { SUBJECT_LABELS } from '@/types/kice';

const STORAGE_KEY = 'se-qotd-answered';

interface QuestionOfTheDayProps {
  question: KiceQuestion;
  year: number;
  session: string;
  dateStr: string;
}

function getStoredDate(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function markAnswered(dateStr: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, dateStr);
  } catch {
    // ignore
  }
}

/** Build display text from context, truncating long dialogues */
function buildQuestionText(q: KiceQuestion): string {
  const parts: string[] = [];
  if (q.context) {
    parts.push(q.context);
  }
  return parts.join('\n\n');
}

/** Extract answer strings from blanks or model_answers */
function extractAnswers(q: KiceQuestion): string[] {
  if (q.blanks) {
    return Object.entries(q.blanks).map(
      ([key, val]) => `${key}: ${val.answer}`
    );
  }
  if (q.model_answers) {
    return Object.entries(q.model_answers).map(
      ([key, val]) => `${key}: ${typeof val === 'string' ? val : JSON.stringify(val)}`
    );
  }
  return [];
}

export function QuestionOfTheDay({
  question,
  year,
  session,
  dateStr,
}: QuestionOfTheDayProps) {
  const [showAnswer, setShowAnswer] = useState(() => getStoredDate() === dateStr);
  const [userInput, setUserInput] = useState('');

  const isFillIn = question.type === 'fill_in';
  const answers = extractAnswers(question);
  const questionText = buildQuestionText(question);
  const subjectTags = (question.subjects ?? []).map(
    (s) => SUBJECT_LABELS[s] ?? s
  );

  const handleReveal = useCallback(() => {
    setShowAnswer(true);
    markAnswered(dateStr);
  }, [dateStr]);

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10">
              <GraduationCap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">오늘의 기출</h3>
              <p className="text-[11px] text-muted-foreground">
                {year}학년도 {session} {question.number}번 ({question.points}점)
              </p>
            </div>
          </div>
          <div className="flex gap-1.5 flex-wrap justify-end">
            {subjectTags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0.5">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Question text */}
        <div className="text-sm leading-relaxed whitespace-pre-line bg-muted/30 rounded-lg p-3 border border-border/50 max-h-[200px] overflow-y-auto">
          {questionText}
        </div>

        {/* Keywords */}
        {question.keywords && question.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {question.keywords.map((kw) => (
              <span
                key={kw}
                className="text-[10px] px-2 py-0.5 rounded-full bg-primary/5 text-primary border border-primary/10"
              >
                {kw}
              </span>
            ))}
          </div>
        )}

        {/* Answer area */}
        {!showAnswer ? (
          <div className="space-y-3">
            {isFillIn ? (
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="답안을 입력하세요"
                className="w-full h-11 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            ) : (
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="답안을 작성해보세요"
                rows={3}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            )}
            <Button
              onClick={handleReveal}
              variant="outline"
              className="w-full gap-2 min-h-[44px]"
            >
              <Eye className="h-4 w-4" />
              정답 확인
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* User's answer if provided */}
            {userInput && (
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <span className="font-medium text-muted-foreground">내 답: </span>
                {userInput}
              </div>
            )}

            {/* Correct answers */}
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 mb-1">
                <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  정답
                </span>
              </div>
              {answers.map((ans, i) => (
                <p
                  key={i}
                  className="text-sm leading-relaxed text-emerald-700 dark:text-emerald-200"
                >
                  {ans}
                </p>
              ))}
            </div>

            <button
              onClick={() => {
                setShowAnswer(false);
                setUserInput('');
              }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <EyeOff className="h-3 w-3" />
              답 숨기기
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
