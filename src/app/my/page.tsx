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
import { GuestBanner, SubjectProgressTab, RecentWrongTab } from './MySubComponents';

type MyTab = 'progress' | 'wrong';

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState<string | null>(null);
  const [nicknameLoaded, setNicknameLoaded] = useState(false);
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [activeTab, setActiveTab] = useState<MyTab>('progress');

  const { currentStreak, totalXP, totalQuizzes, dailyProgress } = useStudyStore();
  const wrongNotesCount = useQuizStore((s) => s.wrongNotes.length);
  const bookmarkCount = useBookmarkStore((s) => s.bookmarks.length);
  const leitnerCount = useLeitnerStore((s) => s.cards.length);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        // 게스트: 로그인 강제 안 함, 게스트 뷰 표시
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

        {/* 비로그인 상태에서도 로컬 데이터 표시 */}
        {(totalQuizzes > 0 || wrongNotesCount > 0) && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground px-1 flex items-center gap-2">
              <RefreshCw className="h-3.5 w-3.5" />
              현재 기기 데이터
            </h2>
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
          </div>
        )}
      </div>
    );
  }

  // ─── Authenticated view ───────────────────────────────────────────────────────

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
      desc: wrongNotesCount > 0 ? `${wrongNotesCount}개 복습 대기` : '퀴즈를 풀면 자동 기록돼요',
      color: 'text-red-500 bg-red-50 dark:bg-red-950/30',
    },
    {
      href: '/bookmarks',
      icon: Bookmark,
      label: '북마크',
      desc: bookmarkCount > 0 ? `${bookmarkCount}개 저장됨` : '퀴즈에서 ⭐ 눌러 저장하세요',
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30',
    },
    {
      href: '/flashcards',
      icon: Layers,
      label: '플래시카드',
      desc: leitnerCount > 0 ? `${leitnerCount}장 학습 중` : '오답노트에서 카드를 추가해보세요',
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
          <p className="text-xs text-muted-foreground mt-0.5">데이터 자동 동기화 중</p>
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

      {/* 배지 */}
      <BadgeDisplay />

      {/* 학습 데이터 탭 */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex border-b border-border">
          {(['progress', 'wrong'] as MyTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'progress' ? '과목별 진도' : '최근 오답'}
            </button>
          ))}
        </div>
        <div className="p-4">
          {activeTab === 'progress' ? <SubjectProgressTab /> : <RecentWrongTab />}
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
