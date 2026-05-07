'use client';

import { RouteErrorPage } from '@/components/ui/RouteErrorPage';

export default function ShortQuizError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <RouteErrorPage
      emoji="✏️"
      title="단답형 퀴즈를 준비하는 중 잠시 문제가 생겼어요"
      description="다시 시도하면 바로 풀 수 있어요."
      resetLabel="단답형 퀴즈 다시 불러오기"
      backHref="/"
      backLabel="홈으로"
      reset={reset}
      error={error}
    />
  );
}
