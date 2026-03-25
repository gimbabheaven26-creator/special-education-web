'use client';

import { RouteErrorPage } from '@/components/ui/RouteErrorPage';

export default function WrongNotesError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <RouteErrorPage
      emoji="📋"
      title="오답 노트를 불러오는 데 잠시 문제가 생겼어요"
      description="오답 기록은 안전합니다. 다시 시도해주세요."
      resetLabel="오답 노트 다시 불러오기"
      backHref="/wrong-notes"
      backLabel="오답노트로"
      reset={reset}
    />
  );
}
