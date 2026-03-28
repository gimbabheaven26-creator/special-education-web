import type { QuizQuestion } from '@/types/quiz';
import type { AnswerRecord } from './QuizResultScreen';

export function QuestionNav({
  questions,
  chapterMap,
  currentIndex,
  answers,
  onJump,
}: {
  questions: ReadonlyArray<QuizQuestion>;
  chapterMap: Record<string, string>;
  currentIndex: number;
  answers: ReadonlyArray<AnswerRecord>;
  onJump: (index: number) => void;
}) {
  const answeredMap = new Map(answers.map((a) => [a.questionIndex, a.isCorrect]));

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {questions.map((q, i) => {
        const chapterTitle = chapterMap[q.chapter] || q.chapter;
        const isCurrent = i === currentIndex;
        const result = answeredMap.get(i);

        let pillClass =
          'text-xs px-3 py-1.5 rounded-full cursor-pointer transition-all font-medium truncate max-w-[200px]';

        if (isCurrent) {
          pillClass += ' bg-primary text-primary-foreground ring-2 ring-primary/40';
        } else if (result === true) {
          pillClass += ' bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
        } else if (result === false) {
          pillClass += ' bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        } else {
          pillClass += ' bg-muted text-muted-foreground hover:bg-muted/80';
        }

        return (
          <button
            key={i}
            className={pillClass}
            onClick={() => onJump(i)}
            title={`${i + 1}. ${chapterTitle}`}
          >
            {i + 1}. {chapterTitle}
          </button>
        );
      })}
    </div>
  );
}
