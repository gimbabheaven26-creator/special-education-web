'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuizStore } from '@/stores/useQuizStore';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  calculateChapterMasteries,
  calculateSubjectMasteries,
  simulatePass,
  type SubjectMastery,
  type PassSimulation,
} from '@/lib/study/mastery';
import examStructure from '@/data/exam-structure.json';
import StatsClient from '../stats/StatsClient';

const subjectWeights = examStructure.subjectWeights as Record<
  string,
  { title: string; weight: number }
>;

function getSubjectTitle(slug: string): string {
  return subjectWeights[slug]?.title ?? slug;
}

interface SubjectLevel {
  label: string;
  barColor: string;
  badgeColor: string;
}

function getSubjectLevel(accuracyPct: number, coverage: number, attempts: number): SubjectLevel {
  if (attempts === 0) {
    return {
      label: '미학습',
      barColor: 'bg-gray-300 dark:bg-gray-600',
      badgeColor: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
    };
  }
  if (accuracyPct < 40 || coverage < 0.15) {
    return {
      label: '시작',
      barColor: 'bg-red-400',
      badgeColor: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300',
    };
  }
  if (accuracyPct < 60) {
    return {
      label: '연습 중',
      barColor: 'bg-amber-400',
      badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
    };
  }
  if (accuracyPct < 80) {
    return {
      label: '숙달',
      barColor: 'bg-blue-500',
      badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
    };
  }
  return {
    label: '완성',
    barColor: 'bg-green-500',
    badgeColor: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300',
  };
}

function OverallScoreSection({ sim }: { sim: PassSimulation }) {
  const gap = sim.passingScore - sim.estimatedScore;
  const scorePercent = Math.round((sim.estimatedScore / 80) * 100);
  const passLinePercent = Math.round((sim.passingScore / 80) * 100);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-3xl font-bold tabular-nums">{sim.estimatedScore}</span>
          <span className="text-lg text-muted-foreground"> / 80점</span>
        </div>
        {gap > 0 ? (
          <span className="text-sm text-muted-foreground">
            합격선까지{' '}
            <span className="text-amber-600 dark:text-amber-400 font-semibold">
              {Math.round(gap)}점
            </span>
          </span>
        ) : (
          <span className="text-sm text-green-600 dark:text-green-400 font-semibold">
            합격 예상
          </span>
        )}
      </div>

      <div className="relative w-full h-2.5 bg-muted rounded-full overflow-hidden">
        <div
          className={
            'h-full rounded-full transition-all duration-700 ' +
            (sim.estimatedScore >= sim.passingScore ? 'bg-green-500' : 'bg-amber-500')
          }
          style={{ width: scorePercent + '%' }}
        />
        <div
          className="absolute top-0 h-full w-0.5 bg-primary"
          style={{ left: passLinePercent + '%' }}
        />
      </div>

      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>0</span>
        <span>합격선 ~{sim.passingScore}점</span>
        <span>80</span>
      </div>
    </div>
  );
}

function SubjectRow({ mastery }: { mastery: SubjectMastery }) {
  const title = getSubjectTitle(mastery.subject);
  const accuracyPct = Math.round(mastery.overallAccuracy * 100);
  const totalAttempts = mastery.chapters.reduce((sum, c) => sum + c.totalAttempts, 0);
  const level = getSubjectLevel(accuracyPct, mastery.coverage, totalAttempts);

  return (
    <Link
      href={'/quiz/' + mastery.subject}
      className="block group"
      aria-label={
        title +
        ' ' +
        (totalAttempts > 0 ? '정답률 ' + accuracyPct + '%' : '미학습') +
        ' — 퀴즈 풀기'
      }
    >
      <div className="py-3 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium group-hover:text-primary transition-colors">
            {title}
          </span>
          <div className="flex items-center gap-2">
            {totalAttempts > 0 && (
              <span className="text-sm font-bold tabular-nums">{accuracyPct}%</span>
            )}
            <span
              className={
                'text-[10px] font-medium px-1.5 py-0.5 rounded-full ' + level.badgeColor
              }
            >
              {level.label}
            </span>
          </div>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={'h-full rounded-full transition-all duration-500 ' + level.barColor}
            style={{ width: (totalAttempts > 0 ? accuracyPct : 0) + '%' }}
          />
        </div>
        {totalAttempts > 0 && (
          <p className="text-[10px] text-muted-foreground">
            {totalAttempts}문제 · 배점 {mastery.weight}%
          </p>
        )}
      </div>
    </Link>
  );
}

type Tab = 'mastery' | 'stats';

function TabBar({
  active,
  onTabChange,
}: {
  active: Tab;
  onTabChange: (t: Tab) => void;
}) {
  return (
    <div className="flex border-b border-border" role="tablist">
      <button
        role="tab"
        aria-selected={active === 'mastery'}
        onClick={() => onTabChange('mastery')}
        className={
          'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ' +
          (active === 'mastery'
            ? 'border-primary text-primary font-semibold'
            : 'border-transparent text-muted-foreground hover:text-foreground')
        }
      >
        마스터리
      </button>
      <button
        role="tab"
        aria-selected={active === 'stats'}
        onClick={() => onTabChange('stats')}
        className={
          'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ' +
          (active === 'stats'
            ? 'border-primary text-primary font-semibold'
            : 'border-transparent text-muted-foreground hover:text-foreground')
        }
      >
        학습통계
      </button>
    </div>
  );
}

interface LearningDashboardProps {
  readonly subjectTitleMap: Readonly<Record<string, string>>;
  readonly chapterTitleMap: Readonly<Record<string, string>>;
}

export default function LearningDashboard({
  subjectTitleMap,
  chapterTitleMap,
}: LearningDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('mastery');
  const quizHistory = useQuizStore((s) => s.quizHistory);
  const wrongNotes = useQuizStore((s) => s.wrongNotes);

  const chapterMasteries = useMemo(
    () => calculateChapterMasteries(quizHistory, wrongNotes),
    [quizHistory, wrongNotes],
  );

  const allChaptersBySubject = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    for (const r of quizHistory) {
      if (!map[r.subject]) map[r.subject] = new Set();
      map[r.subject].add(r.chapter);
    }
    for (const m of chapterMasteries) {
      if (!map[m.subject]) map[m.subject] = new Set();
      map[m.subject].add(m.chapter);
    }
    const result: Record<string, string[]> = {};
    for (const [subject, chapters] of Object.entries(map)) {
      result[subject] = Array.from(chapters);
    }
    return result;
  }, [quizHistory, chapterMasteries]);

  const subjectMasteries = useMemo(
    () => calculateSubjectMasteries(chapterMasteries, allChaptersBySubject),
    [chapterMasteries, allChaptersBySubject],
  );

  const passSimulation = useMemo(
    () => simulatePass(subjectMasteries),
    [subjectMasteries],
  );

  if (quizHistory.length === 0) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">학습현황</h1>
          <p className="text-muted-foreground text-sm">
            퀴즈를 풀면 과목별 숙련도를 확인할 수 있어요.
          </p>
        </div>
        <TabBar active={activeTab} onTabChange={setActiveTab} />
        <EmptyState
          icon="🌳"
          title="아직 학습 기록이 없어요"
          description="첫 퀴즈를 풀면 과목별 숙련도가 여기에 나타나요. 임용시험까지 어떤 과목이 강하고 약한지 한눈에 파악할 수 있어요."
          action={{
            label: '퀴즈 시작하기',
            href: '/quiz',
            ariaLabel: '퀴즈 페이지로 이동',
          }}
        />
      </main>
    );
  }

  if (activeTab === 'stats') {
    return (
      <StatsClient
        subjectTitleMap={subjectTitleMap}
        chapterTitleMap={chapterTitleMap}
        tabBar={<TabBar active={activeTab} onTabChange={setActiveTab} />}
      />
    );
  }

  const sorted = [...subjectMasteries].sort((a, b) => {
    const aAttempts = a.chapters.reduce((s, c) => s + c.totalAttempts, 0);
    const bAttempts = b.chapters.reduce((s, c) => s + c.totalAttempts, 0);
    if (aAttempts > 0 && bAttempts === 0) return -1;
    if (aAttempts === 0 && bAttempts > 0) return 1;
    return b.overallAccuracy - a.overallAccuracy;
  });

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">학습현황</h1>
        <p className="text-muted-foreground text-sm">
          과목별 숙련도를 한눈에 확인하세요.
        </p>
      </div>

      <TabBar active={activeTab} onTabChange={setActiveTab} />

      <OverallScoreSection sim={passSimulation} />

      <div className="divide-y divide-border">
        {sorted.map((mastery) => (
          <SubjectRow key={mastery.subject} mastery={mastery} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 pb-6">
        <Link
          href="/daily"
          className="flex flex-col items-center gap-1 py-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-center"
        >
          <span className="text-2xl">📅</span>
          <span className="text-sm font-medium">오늘 학습</span>
        </Link>
        <Link
          href="/quiz"
          className="flex flex-col items-center gap-1 py-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-center"
        >
          <span className="text-2xl">🧠</span>
          <span className="text-sm font-medium">퀴즈 시작</span>
        </Link>
        <Link
          href="/wrong-notes"
          className="flex flex-col items-center gap-1 py-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-center"
        >
          <span className="text-2xl">📝</span>
          <span className="text-sm font-medium">오답 노트</span>
        </Link>
        <Link
          href="/kice/exam"
          className="flex flex-col items-center gap-1 py-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-center"
        >
          <span className="text-2xl">📋</span>
          <span className="text-sm font-medium">모의고사</span>
        </Link>
      </div>
    </main>
  );
}
