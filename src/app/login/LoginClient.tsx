'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/browser';

type Tab = 'login' | 'signup';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackError = searchParams.get('error');

  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    callbackError ? '로그인 중 오류가 발생했습니다. 다시 시도해주세요.' : null,
  );
  const [signupDone, setSignupDone] = useState(false);

  const supabase = createClient();
  const redirectTo = `${window.location.origin}/auth/callback`;

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (tab === 'login') {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      } else {
        router.push('/');
        router.refresh();
      }
    } else {
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectTo },
      });
      if (err) {
        setError(err.message === 'User already registered' ? '이미 가입된 이메일입니다.' : err.message);
      } else {
        setSignupDone(true);
      }
    }
    setLoading(false);
  }

  async function handleOAuth(provider: 'google') {
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
    if (err) {
      setError('소셜 로그인 중 오류가 발생했습니다.');
      setLoading(false);
    }
  }

  if (signupDone) {
    return (
      <div className="text-center space-y-3">
        <div className="text-4xl">📧</div>
        <h2 className="text-xl font-bold text-foreground">이메일을 확인해주세요</h2>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{email}</span>로<br />
          인증 링크를 보냈습니다.
        </p>
        <Button variant="outline" className="w-full mt-4" onClick={() => setSignupDone(false)}>
          로그인 화면으로
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 로고 */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-foreground">특수교육 공부방</h1>
        <p className="text-sm text-muted-foreground">학습 데이터를 기기 간에 동기화하세요</p>
      </div>

      {/* 탭 */}
      <div className="flex rounded-lg border border-border bg-muted p-1">
        <button
          className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${
            tab === 'login' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
          }`}
          onClick={() => { setTab('login'); setError(null); }}
        >
          로그인
        </button>
        <button
          className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${
            tab === 'signup' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
          }`}
          onClick={() => { setTab('signup'); setError(null); }}
        >
          회원가입
        </button>
      </div>

      {/* 에러 */}
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
      )}

      {/* 이메일 폼 */}
      <form onSubmit={handleEmailAuth} className="space-y-3">
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="password"
          placeholder="비밀번호 (8자 이상)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? '처리 중...' : tab === 'login' ? '로그인' : '회원가입'}
        </Button>
      </form>

      {/* 구분선 */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-3 text-xs text-muted-foreground">또는</span>
        </div>
      </div>

      {/* 소셜 로그인 */}
      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          className="w-full gap-2"
          onClick={() => handleOAuth('google')}
          disabled={loading}
        >
          <GoogleIcon />
          Google로 계속하기
        </Button>
      </div>

      {/* 게스트 */}
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/" className="underline underline-offset-4 hover:text-foreground transition-colors">
          로그인 없이 계속하기
        </Link>
      </p>
    </div>
  );
}
