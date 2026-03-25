'use client';

import { RouteErrorPage } from '@/components/ui/RouteErrorPage';

export default function DailyError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <RouteErrorPage
      emoji="☀️"
      title="오늘의 학습을 준비하는 중 잠시 문제가 생겼어요"
      description="학습 기록은 안전합니다. 다시 시도하면 바로 시작할 수 있어요."
      resetLabel="오늘의 학습 다시 불러오기"
      backHref="/"
      backLabel="홈으로"
      reset={reset}
    />
  );
}
