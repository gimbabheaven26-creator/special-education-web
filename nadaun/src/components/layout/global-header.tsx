import Link from 'next/link'

export function GlobalHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav
        className="mx-auto flex h-12 max-w-3xl items-center justify-between px-4"
        aria-label="글로벌 네비게이션"
      >
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-primary hover:opacity-80"
          aria-label="나다운 홈으로 이동"
        >
          나다운
        </Link>
        <div className="flex gap-4">
          <Link
            href="/students"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            키움이들
          </Link>
          <Link
            href="/standards"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            성취기준
          </Link>
        </div>
      </nav>
    </header>
  )
}
