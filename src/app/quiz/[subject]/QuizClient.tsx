'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { QuizQuestion } from '@/types/quiz';
import { checkFillInAnswer } from '@/lib/answer-checker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, RotateCcw, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, Flag } from 'lucide-react';
import { useQuizFeedbackStore } from '@/stores/useQuizFeedbackStore';

function QuizResult({
  questions,
  correctCount,
  onRestart,
}: {
  questions: QuizQuestion[];
  correctCount: number;
  onRestart: () => void;
}) {
  const total = questions.length;
  const rate = Math.round((correctCount / total) * 100);

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <div className="text-6xl font-bold text-foreground mb-2">{rate}%</div>
        <p className="text-xl text-muted-foreground">
          {total}문제 중 {correctCount}문제 정답
        </p>
      </div>
      <Card className="mb-6">
        <CardContent className="pt-6">
          {rate >= 80 ? (
            <p className="text-green-600 dark:text-green-400 font-medium">대단해요! 꾸준한 학습이 빛을 발하고 있어요.</p>
          ) : rate >= 60 ? (
            <p className="text-yellow-600 dark:text-yellow-400 font-medium">잘 하고 있어요! 이 부분을 마스터하는 중이에요.</p>
          ) : (
            <p className="text-red-600 dark:text-red-400 font-medium">아직 익히는 중이에요. 한 번 더 도전하면 달라질 거에요!</p>
          )}
        </CardContent>
      </Card>
      <div className="flex gap-4 justify-center">
        <Button onClick={onRestart} className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4" />
          다시 풀기
        </Button>
        <Link
          href="/quiz"
          className="inline-flex shrink-0 items-center justify-center rounded-lg border border-border bg-background text-sm font-medium whitespace-nowrap transition-all h-8 gap-1.5 px-2.5 hover:bg-muted hover:text-foreground"
        >
          과목 목록
        </Link>
      </div>
    </div>
  );
}

function ErrorReportSection({ questionId }: { questionId: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const addErrorReport = useQuizFeedbackStore((s) => s.addErrorReport);

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

function QuestionActions({ question }: { question: QuizQuestion }) {
  const { getFeedback, addFeedback } = useQuizFeedbackStore();
  const currentFeedback = getFeedback(question.id);

  return (
    <div className="mb-4">
      <div className="flex items-center gap-1 flex-wrap">
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

function ExplanationToggle({ explanation }: { explanation: string }) {
  const [open, setOpen] = useState(false);

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

function MultipleChoice({
  question,
  onAnswer,
}: {
  question: QuizQuestion;
  onAnswer: (answer: number) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (index: number) => {
    if (submitted) return;
    setSelected(index);
    setSubmitted(true);
  };

  const handleNext = () => {
    if (selected === null) return;
    onAnswer(selected);
    setSelected(null);
    setSubmitted(false);
  };

  return (
    <div>
      <div className="space-y-3 mb-6">
        {question.options?.map((option, index) => {
          let className =
            'w-full text-left p-4 rounded-lg border border-border transition-colors cursor-pointer';
          if (submitted) {
            if (index === question.answer) {
              className += ' border-green-500 bg-green-50 dark:bg-green-950/20';
            } else if (index === selected && index !== question.answer) {
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
          {selected === question.answer ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
          <span className="text-sm font-medium">
            {selected === question.answer ? '정답입니다!' : `오답 (정답: ${Number(question.answer) + 1}번)`}
          </span>
        </div>
      )}
      {submitted && <ExplanationToggle explanation={question.explanation} />}
      {submitted && <QuestionActions question={question} />}
      <div className="flex gap-3">
        {submitted && (
          <Button onClick={handleNext} className="w-full">
            다음
          </Button>
        )}
      </div>
    </div>
  );
}

function OXChoice({
  question,
  onAnswer,
}: {
  question: QuizQuestion;
  onAnswer: (answer: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (choice: string) => {
    if (submitted) return;
    setSelected(choice);
    setSubmitted(true);
  };

  const handleNext = () => {
    if (!selected) return;
    onAnswer(selected);
    setSelected(null);
    setSubmitted(false);
  };

  return (
    <div>
      <div className="flex gap-4 mb-6">
        {['O', 'X'].map((choice) => {
          let className =
            'flex-1 h-20 text-3xl font-bold rounded-xl border border-border transition-colors cursor-pointer';
          if (submitted) {
            if (choice === question.answer) {
              className += ' border-green-500 bg-green-50 dark:bg-green-950/20 text-green-600';
            } else if (choice === selected && choice !== question.answer) {
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
          {selected === question.answer ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
          <span className="text-sm font-medium">
            {selected === question.answer ? '정답입니다!' : `오답 (정답: ${String(question.answer)})`}
          </span>
        </div>
      )}
      {submitted && <ExplanationToggle explanation={question.explanation} />}
      {submitted && <QuestionActions question={question} />}
      <div className="flex gap-3">
        {submitted && (
          <Button onClick={handleNext} className="w-full">
            다음
          </Button>
        )}
      </div>
    </div>
  );
}

function FillInChoice({
  question,
  onAnswer,
}: {
  question: QuizQuestion;
  onAnswer: (answer: string) => void;
}) {
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!input.trim()) return;
    setSubmitted(true);
  };

  const handleNext = () => {
    onAnswer(input.trim());
    setInput('');
    setSubmitted(false);
  };

  const isCorrect = submitted && checkFillInAnswer(input, String(question.answer));

  return (
    <div>
      <div className="mb-6">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => !submitted && e.key === 'Enter' && handleSubmit()}
          placeholder="정답을 입력하세요"
          disabled={submitted}
          className={submitted ? (isCorrect ? 'border-green-500' : 'border-red-500') : ''}
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
      {submitted && <ExplanationToggle explanation={question.explanation} />}
      {submitted && <QuestionActions question={question} />}
      <div className="flex gap-3">
        {!submitted ? (
          <Button onClick={handleSubmit} disabled={!input.trim()} className="w-full">
            제출
          </Button>
        ) : (
          <Button onClick={handleNext} className="w-full">
            다음 문제
          </Button>
        )}
      </div>
    </div>
  );
}

export function QuizClient({
  subjectTitle,
  questions,
}: {
  subjectTitle: string;
  questions: QuizQuestion[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-8 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">{subjectTitle} 퀴즈</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">퀴즈를 준비 중입니다.</p>
          </CardContent>
        </Card>
        <Link
          href="/quiz"
          className="mt-6 inline-flex shrink-0 items-center justify-center rounded-lg border border-border bg-background text-sm font-medium whitespace-nowrap transition-all h-8 gap-1.5 px-2.5 hover:bg-muted hover:text-foreground"
        >
          과목 목록으로
        </Link>
      </div>
    );
  }

  const handleRestart = () => {
    setCurrentIndex(0);
    setCorrectCount(0);
    setFinished(false);
  };

  const handleAnswer = (answer: string | number) => {
    const question = questions[currentIndex];
    const isCorrect = question.type === 'fill_in'
      ? checkFillInAnswer(String(answer), String(question.answer))
      : String(answer) === String(question.answer);
    if (isCorrect) setCorrectCount((prev) => prev + 1);

    if (currentIndex + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">{subjectTitle} 퀴즈</h1>

      {finished ? (
        <QuizResult
          questions={questions}
          correctCount={correctCount}
          onRestart={handleRestart}
        />
      ) : (
        <>
          <div className="mb-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>{currentIndex + 1} / {questions.length}</span>
              <Badge variant="outline">
                {currentQuestion.type === 'multiple'
                  ? '객관식'
                  : currentQuestion.type === 'ox'
                  ? 'OX퀴즈'
                  : '단답형'}
              </Badge>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base font-medium leading-relaxed">
                {currentQuestion.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentQuestion.type === 'multiple' && (
                <MultipleChoice
                  key={currentIndex}
                  question={currentQuestion}
                  onAnswer={(ans) => handleAnswer(ans)}
                />
              )}
              {currentQuestion.type === 'ox' && (
                <OXChoice
                  key={currentIndex}
                  question={currentQuestion}
                  onAnswer={(ans) => handleAnswer(ans)}
                />
              )}
              {currentQuestion.type === 'fill_in' && (
                <FillInChoice
                  key={currentIndex}
                  question={currentQuestion}
                  onAnswer={(ans) => handleAnswer(ans)}
                />
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
