import { Suspense } from 'react';
import { LoginClient } from './LoginClient';

export const metadata = {
  title: '로그인 | 특수교육 공부방',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm">
        <Suspense>
          <LoginClient />
        </Suspense>
      </div>
    </div>
  );
}
