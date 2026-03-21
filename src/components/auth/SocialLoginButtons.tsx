'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/browser';

interface SocialLoginButtonsProps {
  redirectTo?: string;
}

export function SocialLoginButtons({ redirectTo = '/' }: SocialLoginButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<'google' | null>(null);

  async function handleGoogleLogin() {
    setLoadingProvider('google');
    const supabase = createClient();
    const origin = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });
    setLoadingProvider(null);
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Google 버튼 */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loadingProvider === 'google'}
        className="flex items-center justify-center gap-3 w-full px-4 py-2.5 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors text-sm font-medium text-foreground disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
          <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
          <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
        {loadingProvider === 'google' ? '연결 중...' : 'Google로 계속하기'}
      </button>

      {/* Kakao 버튼 — 준비 중 */}
      <div className="relative group">
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="flex items-center justify-center gap-3 w-full px-4 py-2.5 rounded-xl border border-border bg-[#FEE500]/30 text-sm font-medium text-[#3C1E1E]/50 cursor-not-allowed"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M9 1.5C4.858 1.5 1.5 4.134 1.5 7.374c0 2.05 1.292 3.848 3.24 4.89l-.826 3.08a.187.187 0 0 0 .287.2l3.603-2.37A8.97 8.97 0 0 0 9 13.248c4.142 0 7.5-2.634 7.5-5.874S13.142 1.5 9 1.5z"
              fill="#3C1E1E"
              opacity="0.4"
            />
          </svg>
          카카오로 계속하기
        </button>
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded-lg bg-foreground/90 px-2.5 py-1 text-[11px] text-background opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          준비 중
        </span>
      </div>
    </div>
  );
}
