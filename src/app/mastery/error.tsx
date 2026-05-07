'use client';

import { RouteErrorPage } from '@/components/ui/RouteErrorPage';

export default function MasteryError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <RouteErrorPage
      emoji="🌳"
      title="숙달도 분석을 잠시 불러올 수 없어요"
      description="학습 기록은 안전합니다. 다시 시도해주세요."
      resetLabel="숙달도 다시 불러오기"
      backHref="/"
      backLabel="홈으로"
      reset={reset}
      error={error}
    />
  );
}
