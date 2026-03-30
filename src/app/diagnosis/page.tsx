import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { DiagnosticsSummary } from './DiagnosticsSummary';
import { RecentDiagnostics } from './RecentDiagnostics';

export const metadata: Metadata = {
  title: '진단평가',
  description: '실력을 진단하고 약점을 파악하세요. OX 진단, 단답형 진단, 용어학습을 제공합니다.',
};

export default function DiagnosisPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">진단평가</h1>
        <p className="text-sm text-muted-foreground mt-1">
          실력을 진단하고 약점을 파악하세요
        </p>
      </div>

      {/* 진단 요약 — 총 풀이 + 최근 정답률 */}
      <DiagnosticsSummary />

      {/* 바로 시작 — 큰 액션 버튼 */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground px-1">바로 시작</h2>
        <Link
          href="/quiz/ox"
          className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors group"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center">
            <span className="text-lg" aria-hidden="true">&#x2B55;</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground">OX 진단</p>
            <p className="text-sm text-muted-foreground">전 과목 OX 문제로 빠르게 실력 확인</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Link>

        <Link
          href="/quiz/short"
          className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors group"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center">
            <span className="text-lg" aria-hidden="true">&#x270F;&#xFE0F;</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground">단답형 진단</p>
            <p className="text-sm text-muted-foreground">전 과목 단답형으로 실력 진단</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Link>

        <Link
          href="/terms"
          className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors group"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground">용어학습</p>
            <p className="text-sm text-muted-foreground">핵심 용어 플래시카드로 암기</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Link>
      </div>

      {/* 최근 진단 기록 */}
      <RecentDiagnostics />
    </div>
  );
}
