'use client';

import { RouteErrorPage } from '@/components/ui/RouteErrorPage';

export default function FlashcardsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <RouteErrorPage
      emoji="🃏"
      title="플래시카드를 불러오는 중 잠시 문제가 생겼어요"
      description="다시 시도하면 바로 복습할 수 있어요."
      resetLabel="플래시카드 다시 불러오기"
      backHref="/"
      backLabel="홈으로"
      reset={reset}
    />
  );
}
