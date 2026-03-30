import type { Metadata } from 'next';
import { HomeDashboard } from '@/components/dashboard/HomeDashboard';
import { AdminQuickAccess } from '@/components/dashboard/AdminQuickAccess';
import { KiceRecommendCard } from '@/components/dashboard/KiceRecommendCard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '홈',
  description:
    '특수교육 임용시험 대비 — 오늘의 미션을 완료하세요.',
};

export default function HomePage() {
  return (
    <HomeDashboard>
      <KiceRecommendCard />
      <AdminQuickAccess />
    </HomeDashboard>
  );
}
