'use client';

import { RouteErrorPage } from '@/components/ui/RouteErrorPage';

export default function ConceptsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <RouteErrorPage
      emoji="📖"
      title="개념학습을 불러오는 중 잠시 문제가 생겼어요"
      description="다시 시도하면 바로 학습할 수 있어요."
      resetLabel="개념학습 다시 불러오기"
      backHref="/"
      backLabel="홈으로"
      reset={reset}
      error={error}
    />
  );
}
