'use client';

import { RouteErrorPage } from '@/components/ui/RouteErrorPage';

export default function WorksheetError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <RouteErrorPage
      emoji="📄"
      title="학습지를 잠시 불러올 수 없어요"
      description="다시 시도하면 대부분 해결돼요. 학습지 데이터는 안전합니다."
      resetLabel="학습지 다시 불러오기"
      backHref="/worksheets"
      backLabel="돌아가기"
      reset={reset}
      error={error}
    />
  );
}
