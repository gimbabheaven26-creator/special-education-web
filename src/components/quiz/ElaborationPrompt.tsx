'use client';

import { useCallback, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { evaluateElaboration, type ElaborationResult } from '@/lib/elaboration';

interface ElaborationPromptProps {
  readonly explanation: string;
  readonly onComplete: (result: ElaborationResult) => void;
  readonly onSkip: () => void;
}

const LEVEL_STYLES: Record<ElaborationResult['level'], { emoji: string; color: string }> = {
  excellent: { emoji: '🎯', color: 'text-green-600 dark:text-green-400' },
  good: { emoji: '👍', color: 'text-blue-600 dark:text-blue-400' },
  partial: { emoji: '🤔', color: 'text-amber-600 dark:text-amber-400' },
  insufficient: { emoji: '📖', color: 'text-red-600 dark:text-red-400' },
};

export default function ElaborationPrompt({ explanation, onComplete, onSkip }: ElaborationPromptProps) {
  const [userInput, setUserInput] = useState('');
  const [result, setResult] = useState<ElaborationResult | null>(null);

  const handleSubmit = useCallback(() => {
    if (userInput.trim().length < 2) return;
    const evalResult = evaluateElaboration(userInput, explanation);
    setResult(evalResult);
    onComplete(evalResult);
  }, [userInput, explanation, onComplete]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  // Show result
  if (result) {
    const style = LEVEL_STYLES[result.level];
    return (
      <Card className="border-primary/30">
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{style.emoji}</span>
            <p className={`text-sm font-semibold ${style.color}`}>
              {result.feedback}
            </p>
          </div>

          <div className="text-sm text-muted-foreground">
            키워드 매칭: {result.matched.length} / {result.keywords.length}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {result.keywords.map((kw) => {
              const isMatched = result.matched.includes(kw);
              return (
                <Badge
                  key={kw}
                  variant={isMatched ? 'default' : 'outline'}
                  className={`text-xs ${
                    isMatched
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-0'
                      : 'text-muted-foreground'
                  }`}
                >
                  {kw}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Input prompt
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2">
          <span className="text-lg">💭</span>
          <div>
            <p className="text-sm font-semibold">왜 이것이 정답인지 설명해보세요</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              핵심 개념을 한 줄로 정리하면 기억에 오래 남아요
            </p>
          </div>
        </div>

        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="예: 부적 강화에 의해 유지되는 행동이므로 선행사건 중재가 효과적이다..."
          className="w-full p-3 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
          rows={2}
          autoFocus
        />

        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            disabled={userInput.trim().length < 2}
            size="sm"
            className="flex-1 min-h-[40px]"
          >
            확인
          </Button>
          <Button
            onClick={onSkip}
            variant="ghost"
            size="sm"
            className="min-h-[40px]"
          >
            건너뛰기
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
