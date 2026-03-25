'use client';

import { RouteErrorPage } from '@/components/ui/RouteErrorPage';

export default function QuizError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <RouteErrorPage
      emoji="🧩"
      title="퀴즈를 불러오는 데 잠시 문제가 생겼어요"
      description="학습 기록은 안전합니다. 다시 시도해주세요."
      resetLabel="퀴즈 다시 불러오기"
      backHref="/quiz"
      backLabel="돌아가기"
      reset={reset}
    />
  );
}
