import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons';
import { safeRedirectPath } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: '로그인 | 특수교육 공부방',
};

interface Props {
  searchParams: { next?: string; error?: string };
}

export default function LoginPage({ searchParams }: Props) {
  const redirectTo = safeRedirectPath(searchParams.next);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm space-y-6">
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

        {/* OAuth 콜백 에러 */}
        {searchParams.error && (
          <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg text-center">
            로그인 중 오류가 발생했습니다. 다시 시도해주세요.
          </p>
        )}

        <LoginForm redirectTo={redirectTo} />

        {/* 구분선 */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-3 text-xs text-muted-foreground">또는</span>
          </div>
        </div>

        <SocialLoginButtons redirectTo={redirectTo} />

        {/* 게스트로 계속 */}
        <p className="text-center text-sm text-muted-foreground">
          <Link
            href="/"
            className="underline underline-offset-4 hover:text-foreground transition-colors"
          >
            로그인 없이 계속하기
          </Link>
        </p>
      </div>
    </div>
  );
}
