'use client';

import { RouteErrorPage } from '@/components/ui/RouteErrorPage';

export default function CommunityError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <RouteErrorPage
      emoji="💬"
      title="커뮤니티를 불러오는 데 잠시 문제가 생겼어요"
      description="작성한 글은 안전합니다. 다시 시도해주세요."
      resetLabel="커뮤니티 다시 불러오기"
      backHref="/"
      backLabel="홈으로"
      reset={reset}
    />
  );
}
