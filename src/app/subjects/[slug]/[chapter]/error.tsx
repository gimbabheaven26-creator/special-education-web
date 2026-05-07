'use client';

import { RouteErrorPage } from '@/components/ui/RouteErrorPage';

export default function ChapterError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <RouteErrorPage
      emoji="📖"
      title="학습 내용을 불러오는 데 잠시 문제가 생겼어요"
      description="다시 시도하면 대부분 해결돼요."
      resetLabel="챕터 다시 불러오기"
      backHref="/subjects"
      backLabel="돌아가기"
      reset={reset}
      error={error}
    />
  );
}
