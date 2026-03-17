'use client';

import { useState } from 'react';

interface NicknamePromptProps {
  onComplete: (nickname: string) => void;
}

export function NicknamePrompt({ onComplete }: NicknamePromptProps) {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: value.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? '저장 실패');
      } else {
        onComplete(value.trim());
      }
    } catch {
      setError('네트워크 오류');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-5 rounded-2xl border border-primary/30 bg-primary/5 space-y-3">
      <div>
        <p className="text-sm font-semibold text-foreground">닉네임을 설정해주세요</p>
        <p className="text-xs text-muted-foreground mt-0.5">다른 사용자에게 표시될 이름입니다 (20자 이하)</p>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="예: 예비교사김영희"
          maxLength={20}
          required
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50"
        >
          {loading ? '저장...' : '저장'}
        </button>
      </form>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
