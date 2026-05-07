'use client';

import { RouteErrorPage } from '@/components/ui/RouteErrorPage';

export default function StatsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <RouteErrorPage
      emoji="📊"
      title="학습 통계를 불러오는 데 잠시 문제가 생겼어요"
      description="학습 기록은 안전합니다. 다시 시도해주세요."
      resetLabel="통계 다시 불러오기"
      backHref="/"
      backLabel="홈으로"
      reset={reset}
      error={error}
    />
  );
}
