'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import {
  ChevronRight,
  BarChart2,
  RefreshCw,
  Map,
  Settings,
} from 'lucide-react';
import { NicknamePrompt } from '@/components/NicknamePrompt';
import { createClient } from '@/lib/supabase/browser';
import { GuestBanner } from './MySubComponents';

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState<string | null>(null);
  const [nicknameLoaded, setNicknameLoaded] = useState(false);
  const [role, setRole] = useState<'admin' | 'user'>('user');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        setUser(null);
      } else {
        setUser(data.user);
        const res = await fetch('/api/profile');
        if (res.ok) {
          const { profile } = await res.json();
          setNickname(profile?.nickname ?? '');
          setRole(profile?.role ?? 'user');
        } else {
          setNickname('');
        }
        setNicknameLoaded(true);
      }
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
      </div>
    );
  }

  // ─── Guest view ──────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        <GuestBanner />
      </div>
    );
  }

  // ─── Authenticated view ───────────────────────────────────────────────────────

  const meta = user.user_metadata ?? {};
  const name: string = meta.full_name ?? meta.name ?? '';
  const avatarUrl: string | undefined = meta.avatar_url;
  const initial = (user.email ?? '?')[0].toUpperCase();

  const links = [
    {
      href: '/record',
      icon: BarChart2,
      label: '학습 기록 보기',
      desc: '진도, 정답률, 약점 분석, 추천',
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30',
    },
    {
      href: '/onboarding',
      icon: RefreshCw,
      label: '학습 계획 다시 설정',
      desc: '시험일·목표 재설정',
      color: 'text-slate-500 bg-slate-50 dark:bg-slate-950/30',
    },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      {/* 프로필 헤더 */}
      <div className="flex items-center gap-4 p-5 rounded-2xl border border-border bg-card">
        <div className="flex-shrink-0 w-14 h-14 rounded-full overflow-hidden bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
          {avatarUrl ? (
            <Image src={avatarUrl} alt={name} width={56} height={56} className="object-cover" />
          ) : (
            initial
          )}
        </div>
        <div className="min-w-0">
          {name && <p className="font-semibold text-foreground truncate">{name}</p>}
          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
        </div>
      </div>

      {/* 닉네임 프롬프트 */}
      {nicknameLoaded && nickname === '' && (
        <NicknamePrompt onComplete={(n) => setNickname(n)} />
      )}

      {/* 닉네임 표시 */}
      {nicknameLoaded && nickname && nickname !== '' && (
        <div className="flex items-center gap-2 px-1">
          <span className="text-xs text-muted-foreground">닉네임</span>
          <span className="text-sm font-medium text-foreground">{nickname}</span>
        </div>
      )}

      {/* 바로가기 */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1">바로가기</h2>
        <div className="space-y-2">
          {links.map(({ href, icon: Icon, label, desc, color }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground truncate">{desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* 관리자 메뉴 */}
      {role === 'admin' && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1">관리자</h2>
          <div className="space-y-2">
            <Link
              href="/admin"
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-lg text-amber-500 bg-amber-50 dark:bg-amber-950/30">
                <Settings className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">문제 관리</p>
                <p className="text-xs text-muted-foreground">문제 편집·추가·삭제·내보내기</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </Link>
            <Link
              href="/structure"
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 bg-slate-50 dark:bg-slate-950/30">
                <Map className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">사이트 구조도</p>
                <p className="text-xs text-muted-foreground">과목·챕터·문제 현황</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
