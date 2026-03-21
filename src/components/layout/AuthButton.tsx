'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/browser';
import { MigrationModal, shouldShowMigration } from '@/components/auth/MigrationModal';

export function AuthButton() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [showMigration, setShowMigration] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      // SIGNED_IN 이벤트: 마이그레이션 필요 여부 체크
      if (event === 'SIGNED_IN' && session?.user) {
        if (shouldShowMigration()) {
          setShowMigration(true);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push('/');
    router.refresh();
  }

  if (loading) {
    return <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />;
  }

  if (user) {
    const meta = user.user_metadata ?? {};
    const name: string = meta.full_name ?? meta.name ?? user.email ?? '';
    const avatarUrl: string | undefined = meta.avatar_url;
    const initial = (user.email ?? '?')[0].toUpperCase();

    return (
      <>
        {showMigration && (
          <MigrationModal userId={user.id} onClose={() => setShowMigration(false)} />
        )}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center justify-center w-8 h-8 rounded-full overflow-hidden bg-primary text-primary-foreground text-sm font-bold hover:ring-2 hover:ring-primary/50 transition-all"
            aria-label="계정 메뉴"
          >
            {avatarUrl ? (
              <Image src={avatarUrl} alt={name} width={32} height={32} className="object-cover" />
            ) : (
              initial
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-background shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                {name && name !== user.email && (
                  <p className="text-sm font-semibold text-foreground truncate">{name}</p>
                )}
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <div className="p-1">
                <Link
                  href="/my"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg text-foreground hover:bg-muted transition-colors"
                >
                  <UserIcon className="h-4 w-4" />
                  마이페이지
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left text-sm px-3 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                >
                  로그아웃
                </button>
              </div>
            </div>
          )}
        </div>
      </>
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
