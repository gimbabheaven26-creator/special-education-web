'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, X, ArrowRight } from 'lucide-react';
import type { TermEntry } from '@/lib/content/term-utils';

export function TodayTermCardClient({ term }: { term: TermEntry }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 카드 */}
      <button
        onClick={() => setOpen(true)}
        className="w-full text-left p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-primary uppercase tracking-wide">오늘의 단어</span>
          <span className="text-[10px] text-muted-foreground ml-auto">{term.subject}</span>
        </div>
        <p className="font-semibold text-foreground text-sm">
          {term.term_ko}
          {term.term_hanja && (
            <span className="ml-2 text-xs text-muted-foreground font-normal">{term.term_hanja}</span>
          )}
        </p>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
          {term.definition}
        </p>
      </button>

      {/* 바텀시트 */}
      {open && (
        <>
          {/* 오버레이 */}
          <div
            className="fixed inset-0 bg-black/40 z-50"
            onClick={() => setOpen(false)}
          />
          {/* 시트 */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl shadow-xl max-w-lg mx-auto">
            {/* 핸들 */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            <div className="px-5 pb-8 pt-2">
              {/* 헤더 */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    오늘의 단어 · {term.subject}
                  </span>
                  <h3 className="text-xl font-bold mt-2 text-foreground">
                    {term.term_ko}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {term.term_hanja && (
                      <span className="text-sm text-muted-foreground">{term.term_hanja}</span>
                    )}
                    {term.term_en && (
                      <span className="text-sm text-primary/70 italic">{term.term_en}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                  aria-label="오늘의 단어 닫기"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* 정의 */}
              <p className="text-sm text-foreground/80 leading-relaxed mb-5">
                {term.definition}
              </p>

              {/* 액션 버튼 */}
              <div className="flex flex-col gap-2">
                <Link
                  href={`/terms?q=${encodeURIComponent(term.term_ko)}&subject=${encodeURIComponent(term.subject)}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <span>용어학습 페이지에서 보기</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-border text-muted-foreground text-sm opacity-50 cursor-not-allowed">
                  <span>관련 문제 풀어보기</span>
                  <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-medium">준비 중</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
