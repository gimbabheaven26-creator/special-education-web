'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import {
  Flame,
  Star,
  AlertCircle,
  Bookmark,
  BarChart2,
  Brain,
  BookOpen,
  Layers,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/browser';
import { useStudyStore } from '@/stores/useStudyStore';
import { useQuizStore } from '@/stores/useQuizStore';
import { useBookmarkStore } from '@/stores/useBookmarkStore';
import { useLeitnerStore } from '@/stores/useLeitnerStore';

export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const { currentStreak, totalXP, totalQuizzes, dailyProgress } = useStudyStore();
  const wrongNotesCount = useQuizStore((s) => s.wrongNotes.length);
  const bookmarkCount = useBookmarkStore((s) => s.bookmarks.length);
  const leitnerCount = useLeitnerStore((s) => s.cards.length);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/login');
      } else {
        setUser(data.user);
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
  if (!user) return null;

  const meta = user.user_metadata ?? {};
  const name: string = meta.full_name ?? meta.name ?? '';
  const avatarUrl: string | undefined = meta.avatar_url;
  const initial = (user.email ?? '?')[0].toUpperCase();

  const streakMessage =
    currentStreak >= 7
      ? `${currentStreak}일 연속 학습 중! 대단해요 🔥`
      : currentStreak >= 3
      ? `${currentStreak}일 연속 학습 중! 계속 가요!`
      : currentStreak === 1
      ? '오늘 학습을 시작했어요!'
      : null;

  const todayQuizzes = dailyProgress.quizzesCompleted ?? 0;
  const todayCorrect = dailyProgress.quizzesCorrect ?? 0;
  const todayAccuracy = todayQuizzes > 0 ? Math.round((todayCorrect / todayQuizzes) * 100) : null;

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
      icon: AlertCircle,
      label: '오답노트',
      desc: wrongNotesCount > 0 ? `${wrongNotesCount}개 복습 대기` : '오답이 없어요',
      color: 'text-red-500 bg-red-50 dark:bg-red-950/30',
    },
    {
      href: '/bookmarks',
      icon: Bookmark,
      label: '북마크',
      desc: bookmarkCount > 0 ? `${bookmarkCount}개 저장됨` : '저장된 항목 없음',
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30',
    },
    {
      href: '/flashcards',
      icon: Layers,
      label: '플래시카드',
      desc: leitnerCount > 0 ? `${leitnerCount}장 학습 중` : '카드 없음',
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30',
    },
    {
      href: '/mastery',
      icon: Brain,
      label: '마스터리 트리',
      desc: '챕터별 숙련도 확인',
      color: 'text-green-500 bg-green-50 dark:bg-green-950/30',
    },
    {
      href: '/subjects',
      icon: BookOpen,
      label: '과목 학습',
      desc: '퀴즈·플래시카드·워크시트',
      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30',
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
          <p className="text-xs text-muted-foreground mt-0.5">데이터 자동 동기화 중</p>
        </div>
      </div>

      {/* 스트릭 알림 */}
      {currentStreak > 0 && streakMessage && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900">
          <Flame className="h-5 w-5 text-orange-500 flex-shrink-0" />
          <p className="text-sm font-medium text-orange-700 dark:text-orange-300">{streakMessage}</p>
        </div>
      )}

      {/* 오늘 성과 */}
      {todayQuizzes > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
          <p className="text-sm font-medium text-green-700 dark:text-green-300">
            오늘 {todayQuizzes}문제 풀었어요
            {todayAccuracy !== null && ` · 정답률 ${todayAccuracy}%`}
          </p>
        </div>
      )}

      {/* 핵심 수치 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center p-3 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-1 text-orange-500">
            <Flame className="h-4 w-4" />
            <span className="text-lg font-bold">{currentStreak}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">연속 학습</p>
        </div>
        <div className="flex flex-col items-center p-3 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="h-4 w-4" />
            <span className="text-lg font-bold">{totalXP.toLocaleString()}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">총 XP</p>
        </div>
        <div className="flex flex-col items-center p-3 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-1 text-primary">
            <BookOpen className="h-4 w-4" />
            <span className="text-lg font-bold">{totalQuizzes}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">총 문제</p>
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
    </div>
  );
}
