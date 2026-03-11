'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function SubjectError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Subject error:', error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <h2 className="text-xl font-bold text-foreground mb-4">
        과목을 불러올 수 없습니다
      </h2>
      <p className="text-muted-foreground mb-6 text-sm">
        과목 정보를 가져오는 중 오류가 발생했습니다.
      </p>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-medium text-sm px-6 py-2.5 hover:bg-primary/90 transition-colors"
        >
          다시 시도
        </button>
        <Link
          href="/subjects"
          className="inline-flex items-center justify-center rounded-lg border border-border text-foreground font-medium text-sm px-6 py-2.5 hover:bg-muted transition-colors"
        >
          돌아가기
        </Link>
      </div>
    </div>
  );
}
