'use client';

import { useMemo, useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { useQuizStore } from '@/stores/useQuizStore';

export function AiBriefingCard() {
  const wrongNotes = useQuizStore((s) => s.wrongNotes);
  const [briefing, setBriefing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const weakChapters = useMemo(() => {
    const map = new Map<string, { chapter: string; subject: string; wrongCount: number }>();
    for (const note of wrongNotes.filter((n) => !n.mastered)) {
      const key = `${note.question.subject}::${note.question.chapter}`;
      const existing = map.get(key);
      if (existing) {
        existing.wrongCount += note.attempts;
      } else {
        map.set(key, {
          chapter: note.question.chapter,
          subject: note.question.subject,
          wrongCount: note.attempts,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.wrongCount - a.wrongCount).slice(0, 5);
  }, [wrongNotes]);

  async function fetchBriefing() {
    if (weakChapters.length === 0) {
      setBriefing('아직 오답이 없어요. 퀴즈를 풀면 AI가 오늘의 학습 포인트를 알려드려요!');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/ai/weakness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weakChapters }),
      });
      const data = await res.json();
      setBriefing(data.analysis ?? '분석 결과를 가져오지 못했습니다.');
    } catch {
      setBriefing('AI 브리핑을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">오늘의 AI 브리핑</span>
        </div>
        <button
          onClick={fetchBriefing}
          disabled={loading}
          className="px-3 py-1.5 text-xs rounded-lg bg-primary text-primary-foreground disabled:opacity-50 flex items-center gap-1"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
          {loading ? '분석 중...' : '브리핑 받기'}
        </button>
      </div>
      {briefing ? (
        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{briefing}</p>
      ) : (
        <p className="text-xs text-muted-foreground">
          오늘 집중해야 할 챕터와 학습 전략을 AI가 알려드려요.
        </p>
      )}
    </div>
  );
}
