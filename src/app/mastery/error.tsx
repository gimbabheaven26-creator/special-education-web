'use client';

import Link from 'next/link';

export default function MasteryError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <h2 className="text-xl font-bold text-foreground mb-4">
        마스터리 트리를 불러올 수 없습니다
      </h2>
      <p className="text-muted-foreground mb-6 text-sm">
        숙달도 데이터를 가져오는 중 오류가 발생했습니다.
      </p>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-medium text-sm px-6 py-2.5 hover:bg-primary/90 transition-colors"
        >
          다시 시도
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg border border-border text-foreground font-medium text-sm px-6 py-2.5 hover:bg-muted transition-colors"
        >
          홈으로
        </Link>
      </div>
    </div>
  );
}
