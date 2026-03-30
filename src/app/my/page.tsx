'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import {
  Bookmark,
  BarChart2,
  Brain,
  BookOpen,
  Layers,
  ChevronRight,
  Map,
  Users,
  RefreshCw,
  Settings,
} from 'lucide-react';
import { NicknamePrompt } from '@/components/NicknamePrompt';
import { ExamCountdown } from '@/components/ExamCountdown';
import { BadgeDisplay } from '@/components/BadgeDisplay';
import { createClient } from '@/lib/supabase/browser';
import { useStudyStore } from '@/stores/useStudyStore';
import { useQuizStore } from '@/stores/useQuizStore';
import { useBookmarkStore } from '@/stores/useBookmarkStore';
import { useLeitnerStore } from '@/stores/useLeitnerStore';
import { GuestBanner, RecentWrongTab } from './MySubComponents';
import { LevelBadge } from './LevelBadge';
import { WeeklyActivityChart } from './WeeklyActivityChart';
import { SmartRecommendations } from './SmartRecommendations';
import { WeaknessInsight } from './WeaknessInsight';

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState<string | null>(null);
  const [nicknameLoaded, setNicknameLoaded] = useState(false);
  const [role, setRole] = useState<'admin' | 'user'>('user');

  const { totalQuizzes } = useStudyStore();
  const wrongNotes = useQuizStore((s) => s.wrongNotes);
  const wrongNotesCount = wrongNotes.length;
  const unmasteredCount = wrongNotes.filter((n) => !n.mastered).length;
  const bookmarkCount = useBookmarkStore((s) => s.bookmarks.length);
  const leitnerStats = useLeitnerStore((s) => s.getStats());
  const leitnerCount = leitnerStats.total;

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
        {totalQuizzes > 0 && <LevelBadge />}
        {totalQuizzes > 0 && <WeeklyActivityChart />}
      </div>
    );
  }

  // ─── Authenticated view ───────────────────────────────────────────────────────

  const meta = user.user_metadata ?? {};
  const name: string = meta.full_name ?? meta.name ?? '';
  const avatarUrl: string | undefined = meta.avatar_url;
  const initial = (user.email ?? '?')[0].toUpperCase();

  const features = [
    {
      href: '/stats',
      icon: BarChart2,
      label: '학습 통계',
      desc: `총 ${totalQuizzes.toLocaleString()}문제 풀었어요`,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30',
    },
    {
      href: '/wrong-notes',
      icon: Brain,
      label: '오답노트',
      desc: unmasteredCount > 0
        ? `${unmasteredCount}개 미해결 · 총 ${wrongNotesCount}개`
        : wrongNotesCount > 0
          ? `${wrongNotesCount}개 전부 해결!`
          : '퀴즈를 풀면 틀린 문제가 자동 기록돼요',
      color: 'text-red-500 bg-red-50 dark:bg-red-950/30',
    },
    {
      href: '/bookmarks',
      icon: Bookmark,
      label: '북마크',
      desc: bookmarkCount > 0
        ? `${bookmarkCount}개 저장 · 시험 전 복습용`
        : '개념학습에서 중요한 챕터를 저장하세요',
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30',
    },
    {
      href: '/flashcards',
      icon: Layers,
      label: '플래시카드',
      desc: leitnerStats.dueToday > 0
        ? `${leitnerStats.dueToday}장 복습 대기 · 총 ${leitnerCount}장`
        : leitnerCount > 0
          ? `${leitnerCount}장 보유 · 오늘 복습 완료`
          : '나만의 암기 카드를 만들어보세요',
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30',
    },
    {
      href: '/concepts',
      icon: BookOpen,
      label: '개념학습',
      desc: '과목별 핵심 개념 읽기·정리',
      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30',
    },
    {
      href: '/community/mine',
      icon: Users,
      label: '내 제출 문제',
      desc: '내가 만든 커뮤니티 문제',
      color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/30',
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
          <p className="text-xs text-muted-foreground mt-0.5">학습 기록은 이 기기에서만 유지돼요</p>
        </div>
      </div>

      {/* D-day 카운트다운 */}
      <ExamCountdown />

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

      {/* 레벨 + 스트릭 */}
      <LevelBadge />

      {/* 주간 활동 차트 */}
      <WeeklyActivityChart />

      {/* 추천 액션 */}
      <SmartRecommendations />

      {/* 약점 분석 */}
      <WeaknessInsight />

      {/* 배지 */}
      <BadgeDisplay />

      {/* 최근 오답 */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-4 pt-4 pb-2">
          <h3 className="text-sm font-semibold text-foreground">최근 오답</h3>
        </div>
        <div className="p-4 pt-0">
          <RecentWrongTab />
        </div>
      </div>

      {/* 기능 카드 */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1">학습 기능</h2>
        <div className="space-y-2">
          {features.map(({ href, icon: Icon, label, desc, color }) => (
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
