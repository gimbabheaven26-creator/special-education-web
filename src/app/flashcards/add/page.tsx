'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLeitnerStore } from '@/store/useLeitnerStore';
import { subjects } from '@/data/subjects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function generateId(): string {
  return `card-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function AddFlashcardPage() {
  const addCard = useLeitnerStore((s) => s.addCard);

  const [subjectSlug, setSubjectSlug] = useState(subjects[0]?.slug ?? '');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [successCount, setSuccessCount] = useState(0);
  const [lastAdded, setLastAdded] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    addCard({
      id: generateId(),
      subjectSlug,
      question: question.trim(),
      answer: answer.trim(),
    });

    setLastAdded(question.trim());
    setSuccessCount((c) => c + 1);
    setQuestion('');
    setAnswer('');
  }

  const selectedSubject = subjects.find((s) => s.slug === subjectSlug);

  return (
    <main className="max-w-xl mx-auto px-4 py-10 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">카드 추가</h1>
        <p className="text-sm text-muted-foreground">새 플래시카드를 박스 1에 추가합니다.</p>
      </div>

      {successCount > 0 && (
        <div className="rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-3 flex items-center gap-3">
          <Badge variant="secondary" className="shrink-0">
            +{successCount}
          </Badge>
          <p className="text-sm text-green-800 dark:text-green-300">
            <span className="font-medium">&ldquo;{lastAdded}&rdquo;</span> 카드가 추가되었어요.
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">새 카드</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Subject selector */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">과목</label>
              <select
                value={subjectSlug}
                onChange={(e) => setSubjectSlug(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                {subjects.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.title}
                  </option>
                ))}
              </select>
              {selectedSubject && (
                <p className="text-xs text-muted-foreground">{selectedSubject.description}</p>
              )}
            </div>

            {/* Question */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="question">
                질문
              </label>
              <textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="예: IEP의 필수 구성요소 6가지는?"
                rows={3}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none"
                required
              />
            </div>

            {/* Answer */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="answer">
                답
              </label>
              <textarea
                id="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="답을 입력하세요"
                rows={4}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none"
                required
              />
            </div>

            <div className="flex gap-3 pt-1">
              <Button
                type="submit"
                className="flex-1"
                disabled={!question.trim() || !answer.trim()}
              >
                추가
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Action links */}
      <div className="flex gap-3 justify-center flex-wrap">
        {successCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/flashcards" />}
          >
            돌아가기
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/flashcards" />}
        >
          ← 플래시카드 홈
        </Button>
      </div>
    </main>
  );
}
