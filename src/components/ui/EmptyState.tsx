import type { ReactNode } from 'react';
import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: { label: string; href: string; ariaLabel?: string };
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center justify-center py-20 text-center space-y-4">
      <div className="text-5xl" aria-hidden="true">
        {icon ?? '📚'}
      </div>
      <p className="text-lg font-semibold text-foreground">{title}</p>
      {description && (
        <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-medium text-sm px-6 py-2.5 min-h-[44px] hover:bg-primary/90 transition-colors"
          aria-label={action.ariaLabel}
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
