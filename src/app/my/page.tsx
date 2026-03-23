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
  LogIn,
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
import type { WrongNote } from '@/types/study';

type MyTab = 'progress' | 'wrong';

// ─── Guest view ───────────────────────────────────────────────────────────────

function GuestBanner() {
  return (
    <div className="flex flex-col items-center gap-4 py-10 px-4 text-center rounded-2xl border border-dashed border-border bg-muted/20">
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary text-2xl font-bold">
        ?
      </div>
      <div>
        <p className="font-semibold text-foreground">로그인하면 기기 간 동기화됩니다</p>
        <p className="text-sm text-muted-foreground mt-1">
          학습 기록, 오답노트, 플래시카드가 모든 기기에서 유지됩니다.
        </p>
      </div>
      <Link
        href="/login"
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        <LogIn className="h-4 w-4" />
        로그인 / 회원가입
      </Link>
    </div>
  );
}

// ─── Subject progress tab ─────────────────────────────────────────────────────

function SubjectProgressTab() {
  const { recentActivities } = useStudyStore();
  const wrongNotes = useQuizStore((s) => s.wrongNotes);

  // Group recent activities by subject
  type SubjectEntry = { slug: string; title: string; chapters: string[] };
  const subjectMap: Record<string, SubjectEntry> = {};
  for (const act of recentActivities) {
    if (!subjectMap[act.subjectSlug]) {
      subjectMap[act.subjectSlug] = { slug: act.subjectSlug, title: act.subjectTitle, chapters: [] };
    }
    if (!subjectMap[act.subjectSlug].chapters.includes(act.chapterSlug)) {
      subjectMap[act.subjectSlug].chapters.push(act.chapterSlug);
    }
  }

  // Wrong note counts by subject
  const wrongBySubject: Record<string, number> = {};
  for (const n of wrongNotes) {
    const subj = n.subject;
    wrongBySubject[subj] = (wrongBySubject[subj] ?? 0) + 1;
  }

  const subjects = Object.values(subjectMap);

  if (subjects.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center">
        <BookOpen className="h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">아직 학습한 과목이 없어요</p>
        <Link href="/subjects" className="text-xs text-primary hover:underline">
          과목 학습 시작하기
        </Link>
      </div>
    );
  }

  const maxChapters = Math.max(...subjects.map((s) => s.chapters.length), 1);

  return (
    <div className="space-y-3">
      {subjects.slice(0, 11).map(({ slug, title, chapters }) => {
        const pct = Math.round((chapters.length / Math.max(maxChapters, 1)) * 100);
        const wrongs = wrongBySubject[slug] ?? 0;
        return (
          <div key={slug}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-foreground truncate">{title}</span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                {wrongs > 0 && (
                  <span className="text-red-500">오답 {wrongs}</span>
                )}
                <span>{chapters.length}챕터</span>
              </div>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Recent wrong notes tab ───────────────────────────────────────────────────

function RecentWrongTab() {
  const wrongNotes = useQuizStore((s) => s.wrongNotes);

  const recent: WrongNote[] = [...wrongNotes]
    .filter((n) => !n.mastered)
    .sort((a, b) => b.lastAttempt - a.lastAttempt)
    .slice(0, 5);

  if (recent.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center">
        <CheckCircle2 className="h-8 w-8 text-green-500/40" />
        <p className="text-sm text-muted-foreground">오답이 없어요! 훌륭해요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {recent.map((note) => (
        <Link
          key={note.questionId}
          href="/wrong-notes"
          className="block p-3 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              {note.subject}
            </span>
            {note.attempts >= 3 && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400">
                {note.attempts}회 연속
              </span>
            )}
          </div>
          <p className="text-sm line-clamp-2 text-foreground text-muted-foreground">{note.questionId}</p>
        </Link>
      ))}
      <Link
        href="/wrong-notes"
        className="flex items-center justify-center gap-1 py-2 text-sm text-primary hover:underline"
      >
        전체 오답노트 보기
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

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
