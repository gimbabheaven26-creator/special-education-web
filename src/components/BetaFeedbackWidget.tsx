'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';

type FeedbackType = 'bug' | 'suggestion' | 'compliment';

const TYPES: { value: FeedbackType; label: string; emoji: string }[] = [
  { value: 'bug', label: '버그', emoji: '🐛' },
  { value: 'suggestion', label: '개선', emoji: '💡' },
  { value: 'compliment', label: '칭찬', emoji: '🎉' },
];

export function BetaFeedbackWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType | null>(null);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  function reset() {
    setType(null);
    setMessage('');
    setStatus('idle');
  }

  function close() {
    setOpen(false);
    reset();
  }

  async function submit() {
    if (!type || message.length < 5) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message, page: pathname }),
      });
      if (!res.ok) throw new Error();
      setStatus('success');
      closeTimerRef.current = setTimeout(() => {
        close();
      }, 2000);
    } catch {
      setStatus('error');
    }
  }

  const canSubmit = type !== null && message.length >= 5 && status === 'idle';

  return (
    <>
      {/* 고정 버튼 */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-32 right-4 md:bottom-16 md:right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg px-3 py-2 text-sm transition-colors"
        aria-label="피드백 보내기"
      >
        💬 피드백
      </button>

      {/* 모달 */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={close}
            aria-hidden="true"
          />

          {/* 모달 본체 */}
          <div className="fixed bottom-32 right-4 md:bottom-20 md:right-6 z-40 w-80 bg-background border border-border rounded-2xl shadow-xl p-4 flex flex-col gap-3">
            <h2 className="font-semibold text-foreground text-base">베타 피드백 보내기</h2>

            {/* 유형 선택 */}
            <div className="flex gap-2">
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={`flex-1 py-1.5 rounded-lg border text-sm transition-colors ${
                    type === t.value
                      ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      : 'border-border text-muted-foreground hover:border-blue-400'
                  }`}
                >
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>

            {/* 메시지 */}
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="불편한 점이나 개선 아이디어를 적어주세요 (5~500자)"
              maxLength={500}
              className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* 상태 메시지 */}
            {status === 'success' && (
              <p className="text-sm text-green-600 dark:text-green-400 text-center">
                감사합니다! 피드백이 전달됐어요 🙏
              </p>
            )}
            {status === 'error' && (
              <p className="text-sm text-red-500 text-center">전송 실패. 다시 시도해주세요.</p>
            )}

            {/* 보내기 버튼 */}
            <button
              onClick={submit}
              disabled={!canSubmit}
              className="w-full py-2 rounded-lg bg-blue-600 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 disabled:hover:bg-blue-600"
            >
              {status === 'sending' ? '전송 중...' : '보내기'}
            </button>
          </div>
        </>
      )}
    </>
  );
}
