'use client';

import type { Confidence } from '@/app/quiz/[subject]/QuizResultScreen';

interface ConfidenceToggleProps {
  value: Confidence;
  onChange: (value: Confidence) => void;
}

export function ConfidenceToggle({ value, onChange }: ConfidenceToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">확신도:</span>
      <div className="flex rounded-lg bg-muted p-0.5 gap-0.5">
        <button
          type="button"
          onClick={() => onChange('sure')}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
            value === 'sure'
              ? 'bg-emerald-500 text-white'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          확실
        </button>
        <button
          type="button"
          onClick={() => onChange('unsure')}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
            value === 'unsure'
              ? 'bg-amber-500 text-white'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          불확실
        </button>
      </div>
    </div>
  );
}
