'use client';

import Link from 'next/link';

export default function WorksheetError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
      <div className="text-5xl" aria-hidden="true">📄</div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">
          학습지를 잠시 불러올 수 없어요
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          다시 시도하면 대부분 해결돼요. 학습지 데이터는 안전합니다.
        </p>
      </div>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-medium text-sm px-6 py-2.5 min-h-[44px] hover:bg-primary/90 transition-colors"
          aria-label="학습지 다시 불러오기"
        >
          다시 시도
        </button>
        <Link
          href="/worksheets"
          className="inline-flex items-center justify-center rounded-lg border border-border text-foreground font-medium text-sm px-6 py-2.5 min-h-[44px] hover:bg-muted transition-colors"
        >
          돌아가기
        </Link>
      </div>
    </div>
  );
}
