import type { Metadata } from 'next';
import { StreakBanner } from '@/components/dashboard/StreakBanner';
import { DailyReviewCard } from '@/components/dashboard/DailyReviewCard';
import { ExamCountdown } from '@/components/ExamCountdown';
import { TodayTermCard } from '@/components/TodayTermCard';
import { AiBriefingCard } from '@/components/AiBriefingCard';
import { AdminQuickAccess } from '@/components/dashboard/AdminQuickAccess';
import { OnboardingGate } from '@/components/OnboardingGate';
import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: '홈',
  description: '특수교육 임용시험 대비 — 오늘의 문제, 스트릭, 복습 현황을 한눈에 확인하세요.',
};

export default function HomePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <OnboardingGate />

      {/* D-day 카운트다운 */}
      <ExamCountdown />

      {/* 오늘 복습 — SRS + 오답 카운트 전면 배치 */}
      <DailyReviewCard />

      {/* 오늘 학습 시작 — /daily 진입점 */}
      <Link href="/daily" className="block group">
        <div className="flex items-center justify-between p-4 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold">오늘 학습 시작하기</p>
              <p className="text-xs opacity-80 mt-0.5">OX 10 · 단답 5 · 서술 3문제</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 opacity-70 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </Link>

      {/* 스트릭 배너 */}
      <StreakBanner />

      {/* 오늘의 단어 */}
      <TodayTermCard />

      {/* AI 브리핑 */}
      <AiBriefingCard />

      {/* 관리자 전용 — role='admin'인 경우만 표시 */}
      <AdminQuickAccess />
    </div>
  );
}
