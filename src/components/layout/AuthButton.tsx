'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/browser';

export function AuthButton() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  if (loading) {
    return <div className="h-8 w-16 rounded-md bg-muted animate-pulse" />;
  }

  if (user) {
    const initial = (user.email ?? '?')[0].toUpperCase();
    return (
      <div className="flex items-center gap-1">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold cursor-default"
          title={user.email}
        >
          {initial}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground h-8 px-2"
          onClick={handleSignOut}
        >
          로그아웃
        </Button>
      </div>
    );
  }

  return (
    <Link href="/login">
      <Button variant="outline" size="sm" className="h-8 text-xs px-3">
        로그인
      </Button>
    </Link>
  );
}
