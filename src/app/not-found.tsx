import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
      <div className="text-5xl" aria-hidden="true">
        🔍
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">
          페이지를 찾을 수 없어요
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          주소가 변경되었거나, 잘못된 경로일 수 있어요.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-medium text-sm px-6 py-2.5 min-h-[44px] hover:bg-primary/90 transition-colors"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
