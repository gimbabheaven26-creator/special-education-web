'use client';

import { useState, useEffect } from 'react';

/**
 * Hydration 방지용 훅. 클라이언트 마운트 여부를 반환.
 * SSR에서는 false, 클라이언트 마운트 후 true.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  return mounted;
}
