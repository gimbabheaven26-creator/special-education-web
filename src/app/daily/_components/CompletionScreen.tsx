'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { RecommendedChapters } from '@/components/RecommendedChapters';
import type { DailyQuestion } from '@/types/daily';
import { OX_COUNT, FILL_IN_COUNT, DESCRIPTIVE_COUNT } from '@/types/daily';

export function CompletionScreen({
  timeslotLabel,
  oxQuestions,
  oxAnswers,
}: {
  timeslotLabel: string;
  oxQuestions: DailyQuestion[];
  oxAnswers: Record<string, 'O' | 'X'>;
}) {
  const oxCorrect = oxQuestions.filter(
    (q) => oxAnswers[q.id]?.toUpperCase() === String(q.answer).toUpperCase(),
  ).length;
  const oxTotal = oxQuestions.length;
  const oxPct = oxTotal > 0 ? Math.round((oxCorrect / oxTotal) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-6">
      <div className="flex justify-center">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-foreground">{timeslotLabel} 학습 완료!</h1>
        <p className="text-sm text-muted-foreground mt-2">
          OX {OX_COUNT} + 단답 {FILL_IN_COUNT} + 서술 {DESCRIPTIVE_COUNT} — 최소 경로 달성
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
        <div className="rounded-xl bg-card border border-border p-3">
          <p className="text-2xl font-bold text-primary tabular-nums">{oxPct}%</p>
          <p className="text-xs text-muted-foreground mt-0.5">OX 정답률</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-3">
          <p className="text-2xl font-bold text-foreground tabular-nums">{oxCorrect}/{oxTotal}</p>
          <p className="text-xs text-muted-foreground mt-0.5">OX 정답</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-3">
          <p className="text-2xl font-bold text-foreground tabular-nums">{FILL_IN_COUNT + DESCRIPTIVE_COUNT}</p>
          <p className="text-xs text-muted-foreground mt-0.5">서술 완료</p>
        </div>
      </div>
      <div className="flex flex-col gap-3 max-w-xs mx-auto">
        <Link href="/" className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium text-center hover:bg-primary/90 transition-colors">
          홈으로 돌아가기
        </Link>
        <Link href="/wrong-notes" className="w-full py-3 rounded-xl border border-border text-sm font-medium text-center hover:bg-muted transition-colors">
          오답노트 확인하기
        </Link>
        <Link href="/concepts" className="w-full py-3 rounded-xl border border-border text-sm font-medium text-center hover:bg-muted transition-colors text-primary">
          개념학습 보기
        </Link>
      </div>
      <div className="max-w-xs mx-auto w-full text-left">
        <RecommendedChapters />
      </div>
    </div>
  );
}
