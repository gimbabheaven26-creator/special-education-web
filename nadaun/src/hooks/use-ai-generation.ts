'use client';

import { useState, useCallback, useRef } from 'react';
import type { GenerationResult } from '@/lib/ai/prompts';

type Status = 'idle' | 'generating' | 'complete' | 'error';

interface UseAiGenerationReturn {
  status: Status;
  streamText: string;
  result: GenerationResult | null;
  remaining: number | null;
  error: string | null;
  generate: (planId: string) => Promise<void>;
  reset: () => void;
}

export function useAiGeneration(): UseAiGenerationReturn {
  const [status, setStatus] = useState<Status>('idle');
  const [streamText, setStreamText] = useState('');
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setStatus('idle');
    setStreamText('');
    setResult(null);
    setError(null);
  }, []);

  const generate = useCallback(async (planId: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus('generating');
    setStreamText('');
    setResult(null);
    setError(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg =
          (body as { error?: string }).error ??
          `서버 오류 (${res.status})`;
        setError(msg);
        setStatus('error');
        if (typeof (body as { remaining?: number }).remaining === 'number') {
          setRemaining((body as { remaining: number }).remaining);
        }
        return;
      }

      const remainingHeader = res.headers.get('X-Rate-Remaining');
      if (remainingHeader) {
        setRemaining(Number(remainingHeader));
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setError('스트리밍을 시작할 수 없습니다');
        setStatus('error');
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6);

          try {
            const event = JSON.parse(json) as
              | { type: 'delta'; text: string }
              | { type: 'complete'; data: GenerationResult; remaining: number }
              | { type: 'error'; message: string };

            if (event.type === 'delta') {
              setStreamText((prev) => prev + event.text);
            } else if (event.type === 'complete') {
              setResult(event.data);
              setRemaining(event.remaining);
              setStatus('complete');
            } else if (event.type === 'error') {
              setError(event.message);
              setStatus('error');
            }
          } catch {
            // skip malformed SSE lines
          }
        }
      }

      // stream ended without explicit complete/error
      setStatus((prev) => {
        if (prev === 'generating') {
          setError('생성이 예상치 못하게 종료되었습니다');
          return 'error';
        }
        return prev;
      });
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setError(
        err instanceof Error ? err.message : 'AI 서비스에 연결할 수 없습니다'
      );
      setStatus('error');
    }
  }, []);

  return { status, streamText, result, remaining, error, generate, reset };
}
