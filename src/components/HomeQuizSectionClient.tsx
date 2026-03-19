'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';

interface DailyQuestion {
  id: string;
  number: number;
  type: 'ox' | 'fill_in' | 'descriptive';
  question: string;
  answer: string;
  chapter: string;
}

interface HomeQuizSectionClientProps {
  questions: DailyQuestion[];
  date: string;
}

const TYPE_LABEL: Record<DailyQuestion['type'], string> = {
  ox: 'OX',
  fill_in: '단답',
  descriptive: '서술',
};

export function HomeQuizSectionClient({ questions, date }: HomeQuizSectionClientProps) {
  const [showAnswers, setShowAnswers] = useState(false);

  if (questions.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 text-center">
        <p className="text-sm text-muted-foreground">오늘의 문제 준비 중...</p>
      </div>
    );
  }

  const oxQuestions = questions.filter((q) => q.type === 'ox');
  const fillInQuestions = questions.filter((q) => q.type === 'fill_in');
  const descriptiveQuestions = questions.filter((q) => q.type === 'descriptive');

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div>
          <h2 className="text-sm font-semibold text-foreground">오늘의 문제</h2>
          <p className="text-xs text-muted-foreground">{date}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAnswers((v) => !v)}
            className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            {showAnswers ? (
              <>답안 닫기 <ChevronUp className="h-3.5 w-3.5" /></>
            ) : (
              <>답안 보기 <ChevronDown className="h-3.5 w-3.5" /></>
            )}
          </button>
        </div>
      </div>

      {/* 문제 목록 */}
      {!showAnswers && (
        <div className="p-4 space-y-1">
          {questions.map((q) => (
            <div key={q.id} className="flex items-start gap-2 py-1.5">
              <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground mt-0.5 min-w-[32px] text-center">
                {TYPE_LABEL[q.type]}
              </span>
              <span className="text-sm text-foreground leading-relaxed">
                {q.number}. {q.question}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 답안 표 */}
      {showAnswers && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground w-12">번호</th>
                <th className="text-left px-2 py-2 text-xs font-medium text-muted-foreground w-14">유형</th>
                <th className="text-left px-2 py-2 text-xs font-medium text-muted-foreground">정답</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id} className="border-b border-border/50 last:border-0">
                  <td className="px-4 py-2 text-sm text-muted-foreground">{q.number}</td>
                  <td className="px-2 py-2">
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      {TYPE_LABEL[q.type]}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-sm text-foreground leading-relaxed max-w-[200px]">
                    {q.type === 'descriptive'
                      ? `핵심: ${String(q.answer).split(/[.。]/)[0].slice(0, 60)}${String(q.answer).length > 60 ? '...' : ''}`
                      : String(q.answer)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* OX / 단답 / 서술 구성 표시 + 지금 풀기 */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>OX {oxQuestions.length}</span>
          <span>단답 {fillInQuestions.length}</span>
          <span>서술 {descriptiveQuestions.length}</span>
        </div>
        <Link
          href="/daily"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          지금 풀기 <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
