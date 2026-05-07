'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';

interface RouteErrorPageProps {
  emoji: string;
  title: string;
  description: string;
  resetLabel: string;
  backHref: string;
  backLabel: string;
  reset: () => void;
  error?: Error & { digest?: string };
}

export function RouteErrorPage({
  emoji,
  title,
  description,
  resetLabel,
  backHref,
  backLabel,
  reset,
  error,
}: RouteErrorPageProps) {
  useEffect(() => {
    if (error) Sentry.captureException(error);
  }, [error]);
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6" role="alert">
      <div className="text-5xl" aria-hidden="true">{emoji}</div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-medium text-sm px-6 py-2.5 min-h-[44px] hover:bg-primary/90 transition-colors"
          aria-label={resetLabel}
        >
          다시 시도
        </button>
        <Link
          href={backHref}
          className="inline-flex items-center justify-center rounded-lg border border-border text-foreground font-medium text-sm px-6 py-2.5 min-h-[44px] hover:bg-muted transition-colors"
        >
          {backLabel}
        </Link>
      </div>
    </div>
  );
}
