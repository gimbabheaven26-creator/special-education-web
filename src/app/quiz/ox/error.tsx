'use client';

import Link from 'next/link';

export default function OxQuizError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <h2 className="text-xl font-bold text-foreground mb-2">
        OX 진단 로드 실패
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        {error.message || '문제를 불러오는 중 오류가 발생했습니다.'}
      </p>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90"
        >
          다시 시도
        </button>
        <Link
          href="/"
          className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted"
        >
          홈으로
        </Link>
      </div>
    </div>
  );
}
