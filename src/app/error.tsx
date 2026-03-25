'use client';

import { RouteErrorPage } from '@/components/ui/RouteErrorPage';

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <RouteErrorPage
      emoji="🌱"
      title="잠시 문제가 생겼어요"
      description="학습 기록은 안전합니다. 잠시 후 다시 시도해주세요."
      resetLabel="페이지 다시 시도"
      backHref="/"
      backLabel="홈으로"
      reset={reset}
    />
  );
}
