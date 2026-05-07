'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="ko">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#fafafa' }}>
        <div
          role="alert"
          style={{ maxWidth: 400, margin: '0 auto', padding: '80px 16px', textAlign: 'center' }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }} aria-hidden="true">🌱</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>
            예상치 못한 문제가 생겼어요
          </h2>
          <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 24 }}>
            학습 기록은 안전합니다. 페이지를 새로고침해주세요.
          </p>
          <button
            onClick={reset}
            style={{
              padding: '10px 24px',
              fontSize: 14,
              fontWeight: 500,
              backgroundColor: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              minHeight: 44,
            }}
            aria-label="페이지 새로고침"
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
