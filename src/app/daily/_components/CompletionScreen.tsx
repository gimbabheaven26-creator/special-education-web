'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { RecommendedChapters } from '@/components/RecommendedChapters';
import type { DailyQuestion } from '@/types/daily';
import { OX_COUNT, FILL_IN_COUNT, DESCRIPTIVE_COUNT } from '@/types/daily';

const DAILY_TIERS = [
  { min: 91, emoji: '🏆', message: '거의 완벽해요! 오늘 학습 내용이 확실히 정리됐네요.', bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800' },
  { min: 61, emoji: '💪', message: '좋은 흐름이에요! 놓친 문제만 정리하면 더 완벽해질 거예요.', bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800' },
  { min: 31, emoji: '🌱', message: '감이 잡히기 시작했어요! 틀린 문제 위주로 복습하면 빠르게 성장할 거예요.', bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800' },
  { min: 0, emoji: '📖', message: '오늘 학습을 완료한 것 자체가 큰 진전이에요. 꾸준히 하면 반드시 올라요!', bg: 'bg-slate-50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-800' },
];

export function CompletionScreen({
  timeslotLabel,
  oxQuestions,
  oxAnswers,
  wrongChapters = [],
}: {
  timeslotLabel: string;
  oxQuestions: DailyQuestion[];
  oxAnswers: Record<string, 'O' | 'X'>;
  wrongChapters?: string[];
}) {
  const oxCorrect = oxQuestions.filter(
    (q) => oxAnswers[q.id]?.toUpperCase() === String(q.answer).toUpperCase(),
  ).length;
  const oxTotal = oxQuestions.length;
  const oxPct = oxTotal > 0 ? Math.round((oxCorrect / oxTotal) * 100) : 0;
  const tier = DAILY_TIERS.find((t) => oxPct >= t.min) ?? DAILY_TIERS[DAILY_TIERS.length - 1];
  const uniqueWrongChapters = Array.from(new Set(wrongChapters));

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-6">
      <div className="text-6xl" aria-hidden="true">{tier.emoji}</div>
      <div>
        <h1 className="text-2xl font-bold text-foreground">{timeslotLabel} 학습 완료!</h1>
        <p className={`text-sm mt-3 mx-auto max-w-sm rounded-xl border px-4 py-3 ${tier.bg}`}>
          {tier.message}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
        <div className="rounded-xl bg-card border border-border p-4">
          <p className="text-3xl font-bold text-primary tabular-nums">{oxPct}%</p>
          <p className="text-xs text-muted-foreground mt-1">OX 정답률</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-4">
          <p className="text-3xl font-bold text-foreground tabular-nums">{oxCorrect}<span className="text-lg text-muted-foreground">/{oxTotal}</span></p>
          <p className="text-xs text-muted-foreground mt-1">OX 정답</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-4">
          <p className="text-3xl font-bold text-foreground tabular-nums">{FILL_IN_COUNT + DESCRIPTIVE_COUNT}</p>
          <p className="text-xs text-muted-foreground mt-1">서술 완료</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        OX {OX_COUNT}문제 + 단답 {FILL_IN_COUNT}문제 + 서술 {DESCRIPTIVE_COUNT}문제
      </p>

      {/* Weak chapters callout */}
      {uniqueWrongChapters.length > 0 && (
        <div className="max-w-xs mx-auto rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/20 p-4 text-left space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">복습 추천 챕터</span>
          </div>
          <ul className="text-xs text-amber-600 dark:text-amber-400 space-y-1 pl-6 list-disc">
            {uniqueWrongChapters.map((ch) => (
              <li key={ch}>{ch}</li>
            ))}
          </ul>
        </div>
      )}

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
