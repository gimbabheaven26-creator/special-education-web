'use client';

import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FillBlankProps {
  readonly title?: string;
  /** Text with blanks marked as {{answer|hint}} */
  readonly text: string;
  /** Optional acceptable variants for each answer (keyed by answer text) */
  readonly acceptableVariants?: Readonly<Record<string, readonly string[]>>;
}

interface BlankInfo {
  readonly answer: string;
  readonly hint: string;
  readonly index: number;
}

function parseBlanks(text: string): { segments: string[]; blanks: BlankInfo[] } {
  const segments: string[] = [];
  const blanks: BlankInfo[] = [];
  const regex = /\{\{([^|]+)\|([^}]+)\}\}/g;
  let lastIndex = 0;
  let blankIndex = 0;
  let match: RegExpExecArray | null;

  match = regex.exec(text);
  while (match !== null) {
    segments.push(text.slice(lastIndex, match.index));
    blanks.push({ answer: match[1], hint: match[2], index: blankIndex });
    blankIndex++;
    lastIndex = match.index + match[0].length;
    match = regex.exec(text);
  }
  segments.push(text.slice(lastIndex));

  return { segments, blanks };
}

function normalize(str: string): string {
  return str.trim().replace(/\s+/g, '').toLowerCase();
}

export default function FillBlank({ title = '빈칸 채우기', text, acceptableVariants = {} }: FillBlankProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);

  const handleChange = useCallback((index: number, value: string) => {
    if (checked) return;
    setAnswers((prev) => ({ ...prev, [index]: value }));
  }, [checked]);

  const isCorrect = useCallback((blank: BlankInfo): boolean => {
    const userAnswer = normalize(answers[blank.index] ?? '');
    if (!userAnswer) return false;

    const correctNorm = normalize(blank.answer);
    if (userAnswer === correctNorm) return true;

    const variants = acceptableVariants[blank.answer];
    if (variants) {
      return variants.some((v) => normalize(v) === userAnswer);
    }
    return false;
  }, [answers, acceptableVariants]);

  const handleCheck = () => setChecked(true);

  const handleReset = () => {
    setAnswers({});
    setChecked(false);
  };

  if (!text) return null;

  const { segments, blanks } = parseBlanks(text);
  const correctCount = checked ? blanks.filter(isCorrect).length : 0;
  const allFilled = blanks.every((b) => (answers[b.index] ?? '').trim().length > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {!checked && (
          <p className="text-xs text-muted-foreground">빈칸에 적절한 단어를 입력하세요.</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm leading-relaxed">
          {segments.map((segment, i) => (
            <span key={`seg-${i}`}>
              <span className="whitespace-pre-wrap">{segment}</span>
              {i < blanks.length && (
                <span className="inline-flex items-center mx-0.5">
                  <input
                    type="text"
                    value={answers[blanks[i].index] ?? ''}
                    onChange={(e) => handleChange(blanks[i].index, e.target.value)}
                    placeholder={blanks[i].hint}
                    disabled={checked}
                    className={`inline-block w-28 px-2 py-0.5 border-b-2 text-center text-sm bg-transparent outline-none transition-colors ${
                      checked
                        ? isCorrect(blanks[i])
                          ? 'border-green-500 text-green-700 dark:text-green-300'
                          : 'border-red-500 text-red-700 dark:text-red-300'
                        : 'border-primary/50 focus:border-primary'
                    }`}
                  />
                  {checked && !isCorrect(blanks[i]) && (
                    <span className="text-xs text-green-600 ml-1">({blanks[i].answer})</span>
                  )}
                </span>
              )}
            </span>
          ))}
        </div>

        {checked && (
          <div className="text-center text-sm">
            <p className={correctCount === blanks.length ? 'text-green-600 font-semibold' : 'text-amber-600'}>
              {correctCount}/{blanks.length} 정답
              {correctCount === blanks.length && ' — 완벽합니다!'}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {!checked && allFilled && (
            <Button onClick={handleCheck} size="sm" className="flex-1 min-h-[44px]">
              정답 확인
            </Button>
          )}
          {checked && (
            <Button onClick={handleReset} variant="outline" size="sm" className="flex-1 min-h-[44px]">
              다시 풀기
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
