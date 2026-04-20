'use client';

import { useState, useEffect, useCallback } from 'react';
import { Trophy } from 'lucide-react';

export function RankingOptIn() {
  const [optedIn, setOptedIn] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.profile?.show_in_ranking != null) {
          setOptedIn(data.profile.show_in_ranking);
        } else {
          setOptedIn(false);
        }
      })
      .catch(() => setOptedIn(false));
  }, []);

  const toggle = useCallback(async () => {
    if (optedIn === null || loading) return;
    setLoading(true);
    const newValue = !optedIn;
    try {
      const res = await fetch('/api/ranking/opt-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ show: newValue }),
      });
      if (res.ok) {
        setOptedIn(newValue);
      }
    } finally {
      setLoading(false);
    }
  }, [optedIn, loading]);

  if (optedIn === null) return null;

  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg text-amber-500 bg-amber-50 dark:bg-amber-950/30">
          <Trophy className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">주간 학습 랭킹 참여</p>
          <p className="text-xs text-muted-foreground">
            {optedIn ? '커뮤니티에 닉네임과 XP가 공개돼요' : '참여하면 커뮤니티 랭킹에 표시돼요'}
          </p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={optedIn}
        aria-label="주간 학습 랭킹 참여 토글"
        disabled={loading}
        onClick={toggle}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 ${
          optedIn ? 'bg-primary' : 'bg-muted'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ${
            optedIn ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
