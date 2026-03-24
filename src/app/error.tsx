'use client';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <h2 className="text-xl font-bold text-foreground mb-4">
        문제가 발생했습니다
      </h2>
      <p className="text-muted-foreground mb-6 text-sm">
        페이지를 불러오는 중 오류가 발생했습니다.
      </p>
      <p className="text-muted-foreground mb-6 text-xs">
        🔒 학습 기록은 안전하게 보관되어 있습니다.
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-medium text-sm px-6 py-2.5 hover:bg-primary/90 transition-colors"
      >
        다시 시도
      </button>
    </div>
  );
}
