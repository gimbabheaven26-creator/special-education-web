'use client';

import type { ErrorPattern } from '@/lib/error-patterns';
import { getPatternInfo } from '@/lib/error-patterns';

interface ErrorPatternBadgeProps {
  patterns: ErrorPattern[];
}

export function ErrorPatternBadge({ patterns }: ErrorPatternBadgeProps) {
  if (patterns.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {patterns.map((pattern) => {
        const info = getPatternInfo(pattern);
        return (
          <span
            key={pattern}
            title={info.description}
            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${info.color}`}
          >
            {info.label}
          </span>
        );
      })}
    </div>
  );
}
