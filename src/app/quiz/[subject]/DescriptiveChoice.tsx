'use client';

import { useMemo, useState } from 'react';
import type { QuizQuestion } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import ScoringGuide from '@/components/quiz/ScoringGuide';
import { scoreDescriptiveAnswer } from '@/lib/descriptive-scoring';

export function DescriptiveChoice({
  question,
  onAnswer,
}: {
  question: QuizQuestion;
  onAnswer: (answer: string, isCorrect: boolean) => void;
}) {
  const [input, setInput] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [selfGraded, setSelfGraded] = useState<boolean | null>(null);

  const scoringResult = useMemo(() => {
    if (!showAnswer || !input.trim()) return null;
    const modelAnswer = String(question.answer);
    return scoreDescriptiveAnswer(input.trim(), modelAnswer);
  }, [showAnswer, input, question.answer]);

  const handleShowAnswer = () => {
    if (!input.trim()) return;
    setShowAnswer(true);
  };

  const handleSelfGrade = (correct: boolean) => {
    setSelfGraded(correct);
  };

  const handleNext = () => {
    if (selfGraded === null) return;
    onAnswer(input.trim(), selfGraded);
  };

  return (
    <div>
      <div className="mb-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="답안을 작성하세요..."
          disabled={showAnswer}
          rows={5}
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60 resize-y"
        />
      </div>

      {!showAnswer && (
        <Button
          onClick={handleShowAnswer}
          disabled={!input.trim()}
          className="w-full min-h-[44px] gap-2"
        >
          <Eye className="h-4 w-4" />
          채점 가이드 보기
        </Button>
      )}

      {showAnswer && (
        <div className="mb-4 rounded-lg border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-700 dark:bg-emerald-950/20">
          <p className="mb-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            모범답안
          </p>
          <p className="text-sm leading-relaxed text-emerald-900 dark:text-emerald-200 whitespace-pre-wrap">
            {String(question.answer)}
          </p>
        </div>
      )}

      {showAnswer && question.explanation && (
        <div className="mb-4 rounded-lg border border-blue-300 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-950/20">
          <p className="mb-1 text-xs font-semibold text-blue-700 dark:text-blue-400">
            해설
          </p>
          <p className="text-sm leading-relaxed text-blue-900 dark:text-blue-200 whitespace-pre-wrap">
            {question.explanation}
          </p>
        </div>
      )}

      {showAnswer && scoringResult && (
        <div className="mb-4">
          <ScoringGuide result={scoringResult} />
        </div>
      )}

      {showAnswer && selfGraded === null && (
        <div className="mb-4">
          <p className="text-sm font-medium text-center mb-3">키워드 분석을 참고하여 자기 채점해 주세요</p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => handleSelfGrade(true)}
              className="flex-1 min-h-[44px] gap-2 border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-950/20"
            >
              <CheckCircle className="h-4 w-4" />
              맞았어요
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSelfGrade(false)}
              className="flex-1 min-h-[44px] gap-2 border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/20"
            >
              <XCircle className="h-4 w-4" />
              틀렸어요
            </Button>
          </div>
        </div>
      )}

      {selfGraded !== null && (
        <>
          <div className="mb-4 flex items-center gap-2">
            {selfGraded ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">정답 처리되었습니다</span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-red-700 dark:text-red-400">오답 처리되었습니다</span>
              </>
            )}
          </div>
          <Button onClick={handleNext} className="w-full min-h-[44px]">
            다음
          </Button>
        </>
      )}
    </div>
  );
}
