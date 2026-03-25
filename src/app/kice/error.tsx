'use client';

import Link from 'next/link';

export default function KiceError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
      <div className="text-5xl" aria-hidden="true">📝</div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">
          기출문제를 잠시 불러올 수 없어요
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          기출 데이터는 안전합니다. 다시 시도하면 대부분 해결돼요.
        </p>
      </div>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-medium text-sm px-6 py-2.5 min-h-[44px] hover:bg-primary/90 transition-colors"
          aria-label="기출문제 다시 불러오기"
        >
          다시 시도
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg border border-border text-foreground font-medium text-sm px-6 py-2.5 min-h-[44px] hover:bg-muted transition-colors"
        >
          홈으로
        </Link>
      </div>
    </div>
  );
}
