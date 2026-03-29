'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Scenario, ScenarioNode, ScenarioChoice, ScenarioProgress } from '@/types/scenario';
import { useStudyStore } from '@/stores/useStudyStore';
import { getGroupByScenarioId } from '@/data/scenarios';
import { advanceSchedule, createSchedule } from '@/lib/study/spaced-scenario';

interface ScenarioClientProps {
  readonly scenario: Scenario;
}

export default function ScenarioClient({ scenario }: ScenarioClientProps) {
  const saveScenarioProgress = useStudyStore((s) => s.saveScenarioProgress);
  const recordQuizResult = useStudyStore((s) => s.recordQuizResult);
  const saveSpacedSchedule = useStudyStore((s) => s.saveSpacedSchedule);
  const spacedSchedules = useStudyStore((s) => s.spacedScenarioSchedules);

  const [currentNodeId, setCurrentNodeId] = useState(scenario.startNodeId);
  const [visitedIds, setVisitedIds] = useState<string[]>([scenario.startNodeId]);
  const [optimalCount, setOptimalCount] = useState(0);
  const [totalChoices, setTotalChoices] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<ScenarioChoice | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const currentNode: ScenarioNode | undefined = scenario.nodes[currentNodeId];
  const isAssessment = currentNode?.type === 'assessment';

  const progressPercent = useMemo(() => {
    const totalNodes = Object.keys(scenario.nodes).length;
    return Math.round((visitedIds.length / totalNodes) * 100);
  }, [visitedIds.length, scenario.nodes]);

  const handleChoiceSelect = useCallback(
    (choice: ScenarioChoice) => {
      if (showFeedback) return;
      setSelectedChoice(choice);
      setShowFeedback(true);

      const newTotal = totalChoices + 1;
      const newOptimal = choice.isOptimal ? optimalCount + 1 : optimalCount;
      const newXp = xpEarned + choice.xpBonus;

      setTotalChoices(newTotal);
      setOptimalCount(newOptimal);
      setXpEarned(newXp);

      // Record as quiz result for XP/streak
      if (choice.xpBonus > 0) {
        recordQuizResult(choice.isOptimal);
      }
    },
    [showFeedback, totalChoices, optimalCount, xpEarned, recordQuizResult],
  );

  const handleContinue = useCallback(() => {
    if (!selectedChoice) return;

    const nextId = selectedChoice.nextNodeId;
    const nextNode = scenario.nodes[nextId];

    setVisitedIds((prev) => [...prev, nextId]);
    setCurrentNodeId(nextId);
    setSelectedChoice(null);
    setShowFeedback(false);

    // Check if next node is assessment (end)
    if (nextNode?.type === 'assessment') {
      const progress: ScenarioProgress = {
        scenarioId: scenario.id,
        visitedNodeIds: [...visitedIds, nextId],
        optimalCount: optimalCount,
        totalChoices: totalChoices,
        xpEarned: xpEarned,
        completedAt: Date.now(),
        startedAt: Date.now(),
      };
      saveScenarioProgress(progress);
      setIsFinished(true);

      // Advance spaced scenario schedule if this scenario belongs to a group
      const group = getGroupByScenarioId(scenario.id);
      if (group) {
        const currentSchedule = spacedSchedules[group.groupId] ?? createSchedule(group.groupId);
        const score = totalChoices > 0 ? optimalCount / totalChoices : 0;
        const updated = advanceSchedule(currentSchedule, group, scenario.id, score);
        saveSpacedSchedule(updated);
      }
    }
  }, [selectedChoice, scenario, visitedIds, optimalCount, totalChoices, xpEarned, saveScenarioProgress, spacedSchedules, saveSpacedSchedule]);

  if (!currentNode) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <p className="text-muted-foreground">시나리오 데이터 오류</p>
      </main>
    );
  }

  // Assessment / Result screen
  if (isAssessment || isFinished) {
    const score = totalChoices > 0 ? Math.round((optimalCount / totalChoices) * 100) : 0;

    return (
      <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {score >= 80 ? '🎉' : score >= 50 ? '👍' : '💪'} 시뮬레이션 완료!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score */}
            <div className="flex justify-center gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{score}%</p>
                <p className="text-sm text-muted-foreground">최적 선택률</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{optimalCount}</p>
                <p className="text-sm text-muted-foreground">최적 선택</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{totalChoices}</p>
                <p className="text-sm text-muted-foreground">총 선택</p>
              </div>
            </div>

            {xpEarned > 0 && (
              <p className="text-center text-sm text-primary font-medium">
                +{xpEarned} XP 획득!
              </p>
            )}

            {/* Assessment content */}
            {currentNode.type === 'assessment' && (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {currentNode.content.split('\n').map((line, i) => {
                  if (line.startsWith('## ')) {
                    return <h2 key={i} className="text-lg font-bold mt-4 mb-2">{line.slice(3)}</h2>;
                  }
                  if (line.startsWith('### ')) {
                    return <h3 key={i} className="text-base font-semibold mt-3 mb-1">{line.slice(4)}</h3>;
                  }
                  if (line.match(/^\d+\./)) {
                    return <p key={i} className="ml-4 text-sm">{line}</p>;
                  }
                  if (line.trim() === '') return null;
                  return <p key={i} className="text-sm">{line}</p>;
                })}
              </div>
            )}

            {/* Related concepts */}
            {currentNode.relatedConcepts.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {currentNode.relatedConcepts.map((concept) => (
                  <Badge key={concept} variant="secondary" className="text-xs">
                    {concept}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            render={<Link href="/scenarios" />}
            variant="outline"
            size="lg"
            className="flex-1 min-h-[44px]"
          >
            시뮬레이터 목록
          </Button>
          <Button
            render={<Link href={`/scenarios/${scenario.id}`} />}
            size="lg"
            className="flex-1 min-h-[44px]"
            onClick={() => {
              setCurrentNodeId(scenario.startNodeId);
              setVisitedIds([scenario.startNodeId]);
              setOptimalCount(0);
              setTotalChoices(0);
              setXpEarned(0);
              setSelectedChoice(null);
              setShowFeedback(false);
              setIsFinished(false);
            }}
          >
            다시 도전하기
          </Button>
        </div>
      </main>
    );
  }

  // Active scenario node
  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-tight line-clamp-1">{scenario.title}</h1>
        <Badge variant="outline" className="shrink-0">
          {progressPercent}%
        </Badge>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Situation card */}
      <Card>
        <CardContent className="space-y-4">
          {/* Node type badge */}
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-xs">
              {currentNode.type === 'situation' ? '📋 상황' : currentNode.type === 'feedback' ? '💡 피드백' : '❓ 선택'}
            </Badge>
          </div>

          {/* Content */}
          <div className="text-sm leading-relaxed whitespace-pre-line">
            {currentNode.content.split('\n').map((line, i) => {
              if (line.startsWith('📋') || line.startsWith('📊') || line.startsWith('🚨')) {
                return <p key={i} className="font-semibold mt-2">{line}</p>;
              }
              if (line.startsWith('•') || line.startsWith('-')) {
                return <p key={i} className="ml-4">{line}</p>;
              }
              if (line.startsWith('**') && line.endsWith('**')) {
                return <p key={i} className="font-semibold">{line.replace(/\*\*/g, '')}</p>;
              }
              return <p key={i}>{line}</p>;
            })}
          </div>

          {/* Legal basis */}
          {currentNode.legalBasis && (
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                📜 {currentNode.legalBasis}
              </p>
            </div>
          )}

          {/* Related concepts */}
          {currentNode.relatedConcepts.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {currentNode.relatedConcepts.map((concept) => (
                <span
                  key={concept}
                  className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                >
                  {concept}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Choices */}
      {currentNode.choices && currentNode.choices.length > 0 && (
        <div className="space-y-3">
          {currentNode.choices.map((choice, index) => {
            const isSelected = selectedChoice === choice;
            const showResult = showFeedback;
            let borderClass = 'border-border hover:border-primary/50';
            if (showResult && isSelected) {
              borderClass = choice.isOptimal
                ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                : 'border-red-500 bg-red-50 dark:bg-red-950/20';
            } else if (showResult && choice.isOptimal) {
              borderClass = 'border-green-300 bg-green-50/50 dark:bg-green-950/10';
            }

            return (
              <button
                key={index}
                onClick={() => handleChoiceSelect(choice)}
                disabled={showFeedback}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${borderClass} disabled:cursor-default`}
              >
                <div className="flex items-start gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                    {index + 1}
                  </span>
                  <span className="text-sm leading-relaxed">{choice.label}</span>
                </div>

                {/* Feedback */}
                {showResult && isSelected && (
                  <div className="mt-3 ml-9">
                    <p className={`text-sm ${choice.isOptimal ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                      {choice.isOptimal ? '✅ ' : '❌ '}
                      {choice.feedback}
                    </p>
                    {choice.xpBonus > 0 && (
                      <p className="text-xs text-primary font-medium mt-1">
                        +{choice.xpBonus} XP
                      </p>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Continue button */}
      {showFeedback && (
        <Button
          onClick={handleContinue}
          size="lg"
          className="w-full min-h-[44px]"
        >
          다음으로
        </Button>
      )}

      {/* Back link */}
      <div className="flex justify-end">
        <Button
          render={<Link href="/scenarios" />}
          variant="ghost"
          size="sm"
          className="min-h-[44px]"
        >
          시뮬레이터 목록
        </Button>
      </div>
    </main>
  );
}
