'use client';

import { RouteErrorPage } from '@/components/ui/RouteErrorPage';

export default function InteractiveError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <RouteErrorPage
      emoji="🎯"
      title="인터랙티브 학습을 잠시 불러올 수 없어요"
      description="학습 데이터는 안전합니다. 다시 시도하면 대부분 해결돼요."
      resetLabel="학습 다시 불러오기"
      backHref="/"
      backLabel="홈으로"
      reset={reset}
    />
  );
}
