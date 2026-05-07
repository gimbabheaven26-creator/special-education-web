'use client';

import { RouteErrorPage } from '@/components/ui/RouteErrorPage';

export default function BookmarksError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <RouteErrorPage
      emoji="🔖"
      title="북마크를 불러오는 중 잠시 문제가 생겼어요"
      description="다시 시도하면 저장한 항목을 확인할 수 있어요."
      resetLabel="북마크 다시 불러오기"
      backHref="/"
      backLabel="홈으로"
      reset={reset}
      error={error}
    />
  );
}
