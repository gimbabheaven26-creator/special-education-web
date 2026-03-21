'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuizStore } from '@/stores/useQuizStore';
import {
  calculateChapterMasteries,
  calculateSubjectMasteries,
  simulatePass,
  getMasteryInfo,
  type SubjectMastery,
  type PassSimulation,
} from '@/lib/mastery';
import examStructure from '@/data/exam-structure.json';

const subjectWeights = examStructure.subjectWeights as Record<
  string,
  { title: string; weight: number }
>;

function getSubjectTitle(slug: string): string {
  return subjectWeights[slug]?.title ?? slug;
}

// ─── Pass Simulation Card ───────────────────────────────────────────────────

function PassSimulationCard({ sim }: { sim: PassSimulation }) {
  const scorePercent = Math.round((sim.estimatedScore / 80) * 100);
  const passPercent = Math.round(sim.passRate * 100);

  let bgColor = 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800';
  let scoreColor = 'text-red-600 dark:text-red-400';
  if (sim.estimatedScore >= sim.passingScore) {
    bgColor = 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800';
    scoreColor = 'text-green-600 dark:text-green-400';
  } else if (sim.estimatedScore >= sim.passingScore * 0.85) {
    bgColor = 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800';
    scoreColor = 'text-amber-600 dark:text-amber-400';
  }

  return (
    <Card className={`border ${bgColor}`}>
      <CardHeader>
        <CardTitle className="text-center text-lg">합격 시뮬레이션</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score display */}
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <p className={`text-4xl font-bold ${scoreColor}`}>{sim.estimatedScore}</p>
            <p className="text-xs text-muted-foreground">예상 점수 / 80점</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold">{passPercent}%</p>
            <p className="text-xs text-muted-foreground">합격 가능성</p>
          </div>
        </div>

        {/* Score bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0점</span>
            <span className="text-primary font-semibold">합격선 ~{sim.passingScore}점</span>
            <span>80점</span>
          </div>
          <div className="relative w-full h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                sim.estimatedScore >= sim.passingScore ? 'bg-green-500' : 'bg-amber-500'
              }`}
              style={{ width: `${scorePercent}%` }}
            />
            {/* Passing score marker */}
            <div
              className="absolute top-0 h-full w-0.5 bg-primary"
              style={{ left: `${(sim.passingScore / 80) * 100}%` }}
            />
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-2 gap-3">
          {sim.strengths.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-green-600 dark:text-green-400">강점 과목</p>
              {sim.strengths.map((s) => (
                <p key={s} className="text-sm">{getSubjectTitle(s)}</p>
              ))}
            </div>
          )}
          {sim.weaknesses.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-red-600 dark:text-red-400">보강 필요</p>
              {sim.weaknesses.map((s) => (
                <p key={s} className="text-sm">{getSubjectTitle(s)}</p>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Subject Mastery Card ───────────────────────────────────────────────────

function SubjectMasteryCard({ mastery, passScore }: { mastery: SubjectMastery; passScore: { score: number; maxScore: number } }) {
  const title = getSubjectTitle(mastery.subject);
  const accuracyPercent = Math.round(mastery.overallAccuracy * 100);
  const coveragePercent = Math.round(mastery.coverage * 100);
  const scorePercent = mastery.chapters.length > 0 && passScore.maxScore > 0
    ? Math.round((passScore.score / passScore.maxScore) * 100)
    : 0;

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">{title}</h3>
          <Badge variant="outline" className="text-xs">
            배점 {mastery.weight}%
          </Badge>
        </div>

        {/* Stats row */}
        <div className="flex gap-4 text-xs">
          <div>
            <span className="text-muted-foreground">정답률</span>
            <span className={`ml-1 font-semibold ${accuracyPercent >= 70 ? 'text-green-600' : accuracyPercent >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
              {accuracyPercent}%
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">커버리지</span>
            <span className="ml-1 font-semibold">{coveragePercent}%</span>
          </div>
          <div>
            <span className="text-muted-foreground">예상 득점률</span>
            <span className={`ml-1 font-semibold ${scorePercent >= 70 ? 'text-green-600' : scorePercent >= 50 ? 'text-amber-600' : 'text-muted-foreground'}`}>
              {scorePercent}%
            </span>
          </div>
        </div>

        {/* Chapter mastery dots */}
        {mastery.chapters.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {mastery.chapters.map((ch) => {
              const info = getMasteryInfo(ch.level);
              return (
                <Link
                  key={ch.chapter}
                  href={`/quiz/${ch.subject}`}
                  className="group relative"
                  title={`${ch.chapter}: ${info.label} (${Math.round(ch.accuracy * 100)}%)`}
                >
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs ${info.color} group-hover:ring-2 ring-primary/30 transition-all`}>
                    {info.emoji}
                  </span>
                </Link>
              );
            })}
          </div>
        )}

        {mastery.chapters.length === 0 && (
          <p className="text-xs text-muted-foreground">아직 학습 기록이 없어요</p>
        )}

        {/* Mastery bar */}
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, scorePercent)}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Mastery Legend ──────────────────────────────────────────────────────────

function MasteryLegend() {
  const levels: Array<{ level: string; label: string; emoji: string }> = [
    { level: 'not_started', label: '미학습', emoji: '⬜' },
    { level: 'learning', label: '학습 중', emoji: '🟡' },
    { level: 'practicing', label: '연습 중', emoji: '🟠' },
    { level: 'proficient', label: '숙달', emoji: '🟢' },
    { level: 'mastered', label: '마스터', emoji: '🏆' },
  ];

  return (
    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
      {levels.map((l) => (
        <span key={l.level} className="flex items-center gap-1">
          {l.emoji} {l.label}
        </span>
      ))}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function MasteryPage() {
  const quizHistory = useQuizStore((s) => s.quizHistory);
  const wrongNotes = useQuizStore((s) => s.wrongNotes);

  const chapterMasteries = useMemo(
    () => calculateChapterMasteries(quizHistory, wrongNotes),
    [quizHistory, wrongNotes],
  );

  // Build allChaptersBySubject from quiz history (chapters we know about)
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

  const totalMastered = chapterMasteries.filter((c) => c.level === 'mastered' || c.level === 'proficient').length;
  const totalChapters = chapterMasteries.length;

  // Empty state
  if (quizHistory.length === 0) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">마스터리 트리</h1>
          <p className="text-muted-foreground text-sm">
            퀴즈를 풀면 과목별 숙련도와 합격 시뮬레이션을 볼 수 있어요.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-4xl mb-4">🌳</p>
          <p className="text-lg font-medium text-muted-foreground">
            아직 학습 기록이 없어요
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            퀴즈를 풀어보면 여기에 숙련도 트리가 표시됩니다.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">마스터리 트리</h1>
        <p className="text-muted-foreground text-sm">
          과목별 숙련도와 합격 가능성을 확인하세요.
        </p>
      </div>

      {/* Quick stats */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Badge variant="secondary" className="text-sm px-3 py-1.5">
          숙달 {totalMastered} / {totalChapters} 챕터
        </Badge>
        <Badge variant="secondary" className="text-sm px-3 py-1.5">
          예상 {passSimulation.estimatedScore} / 80점
        </Badge>
        <Badge variant="secondary" className="text-sm px-3 py-1.5">
          합격 가능성 {Math.round(passSimulation.passRate * 100)}%
        </Badge>
      </div>

      {/* Pass Simulation */}
      <PassSimulationCard sim={passSimulation} />

      {/* Legend */}
      <MasteryLegend />

      {/* Subject Mastery Cards */}
      <div className="space-y-4">
        {subjectMasteries.map((mastery) => {
          const passScore = passSimulation.subjectScores.find((s) => s.subject === mastery.subject)
            ?? { score: 0, maxScore: 0, subject: mastery.subject };
          return (
            <SubjectMasteryCard key={mastery.subject} mastery={mastery} passScore={passScore} />
          );
        })}
      </div>

      {/* 핵심 액션 */}
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
