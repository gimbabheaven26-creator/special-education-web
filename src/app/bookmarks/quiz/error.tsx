'use client';

import { RouteErrorPage } from '@/components/ui/RouteErrorPage';

export default function BookmarkQuizError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <RouteErrorPage
      emoji="🔖"
      title="북마크 퀴즈를 불러오는 중 문제가 생겼어요"
      description="다시 시도하면 퀴즈를 이어서 풀 수 있어요."
      resetLabel="다시 시도하기"
      backHref="/bookmarks"
      backLabel="북마크로 돌아가기"
      reset={reset}
    />
  );
}
