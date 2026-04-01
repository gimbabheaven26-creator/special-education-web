'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { BDS_SCENARIOS, SCENARIO_GROUPS } from '@/data/scenarios';
import { useStudyStore } from '@/stores/useStudyStore';

const DIFFICULTY_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: '기초', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  2: { label: '중급', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  3: { label: '심화', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
};

const SUBJECT_LABELS: Record<string, string> = {
  'behavior-support': '행동지원',
  'inclusive-education': '통합교육',
  assessment: '진단·평가',
  curriculum: '교육과정',
  introduction: '특수교육개론',
  transition: '전환교육',
  laws: '관련 법령',
};

export default function ScenariosClient() {
  const scenarioProgress = useStudyStore((s) => s.scenarioProgress);

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">행동 의사결정 시뮬레이터</h1>
        <p className="text-muted-foreground text-sm">
          실제 교실 상황을 분기형 시나리오로 체험하세요.
          FBA, PBS, 통합교육 등 핵심 의사결정을 연습합니다.
        </p>
      </div>

      {/* Spaced Scenarios Section */}
      {SCENARIO_GROUPS.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">스페이스드 시나리오</h2>
          <p className="text-muted-foreground text-xs">
            같은 원리를 다른 맥락에서 간격을 두고 반복 연습합니다.
          </p>
          {SCENARIO_GROUPS.map((group) => (
            <Link key={group.groupId} href={`/scenarios/spaced/${group.groupId}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🔄</span>
                    <h3 className="text-base font-semibold">{group.principle}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{group.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{group.scenarioIds.length}개 시나리오</span>
                    <span>·</span>
                    <span>간격반복 학습</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* BDS Scenarios Section */}
      <h2 className="text-lg font-semibold tracking-tight">단일 시나리오</h2>
      <div className="space-y-4">
        {BDS_SCENARIOS.map((scenario) => {
          const diff = DIFFICULTY_LABELS[scenario.difficulty];
          const progress = scenarioProgress?.[scenario.id];
          const isCompleted = progress?.completedAt != null;
          const bestScore = progress
            ? Math.round((progress.optimalCount / Math.max(progress.totalChoices, 1)) * 100)
            : null;

          return (
            <Link key={scenario.id} href={`/scenarios/${scenario.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-base font-semibold leading-snug">{scenario.title}</h2>
                    {isCompleted && (
                      <Badge variant="secondary" className="shrink-0 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        완료
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {scenario.description}
                  </p>

                  <div className="flex flex-wrap gap-2 items-center">
                    <Badge variant="outline" className="text-xs">
                      {SUBJECT_LABELS[scenario.subject] ?? scenario.subject}
                    </Badge>
                    <Badge className={`text-xs ${diff.color} border-0`}>
                      {diff.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      약 {scenario.estimatedMinutes}분
                    </span>
                    {bestScore !== null && (
                      <span className="text-xs text-muted-foreground ml-auto">
                        최고 점수: {bestScore}%
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {scenario.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
