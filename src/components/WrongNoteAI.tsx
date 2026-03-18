'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface WeakChapter {
  chapter: string;
  subject: string;
  wrongCount: number;
}

interface WrongNoteAIProps {
  weakChapters: WeakChapter[];
}

export function WrongNoteAI({ weakChapters }: WrongNoteAIProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/weakness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weakChapters }),
      });
      const data = await res.json();
      setAnalysis(data.analysis ?? '분석 실패');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">AI 약점 분석</span>
        </div>
        <button
          onClick={analyze}
          disabled={loading || weakChapters.length === 0}
          className="px-3 py-1.5 text-xs rounded-lg bg-primary text-primary-foreground disabled:opacity-50 flex items-center gap-1"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
          {loading ? '분석 중...' : '분석하기'}
        </button>
      </div>
      {analysis && (
        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{analysis}</p>
      )}
      {!analysis && !loading && (
        <p className="text-xs text-muted-foreground">&ldquo;분석하기&rdquo;를 누르면 취약 챕터와 학습 전략을 알려드립니다.</p>
      )}
    </div>
  );
}
