'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { makeSheetCode } from '@/lib/sheet-code';

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
  dateRaw: string;
}

export function HomeQuizSectionClient({ questions, date, dateRaw }: HomeQuizSectionClientProps) {
  if (questions.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 text-center">
        <p className="text-sm text-muted-foreground">오늘의 문제 준비 중...</p>
      </div>
    );
  }

  const oxCount = questions.filter((q) => q.type === 'ox').length;
  const fillInCount = questions.filter((q) => q.type === 'fill_in').length;
  const descriptiveCount = questions.filter((q) => q.type === 'descriptive').length;
  const sheetCode = makeSheetCode(dateRaw);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div>
          <h2 className="text-sm font-semibold text-foreground">오늘의 문제</h2>
          <p className="text-xs text-muted-foreground">{date}</p>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
          {sheetCode}
        </span>
      </div>

      {/* 구성 + CTA */}
      <div className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>OX {oxCount}</span>
          <span>단답 {fillInCount}</span>
          <span>서술 {descriptiveCount}</span>
        </div>
        <Link
          href="/daily"
          className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          지금 풀기 <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
