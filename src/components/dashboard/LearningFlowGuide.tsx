'use client';

import Link from 'next/link';
import {
  GraduationCap,
  ClipboardX,
  BookOpen,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuizStore } from '@/stores/useQuizStore';
import { useLeitnerStore } from '@/stores/useLeitnerStore';
import { useEffect, useState } from 'react';

interface FlowStep {
  number: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href: string;
  badge?: string;
  color: string;
}

export function LearningFlowGuide() {
  const [mounted, setMounted] = useState(false);
  const wrongNotes = useQuizStore((s) => s.wrongNotes);
  const leitnerGetStats = useLeitnerStore((s) => s.getStats);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const wrongCount = wrongNotes.filter((n) => !n.mastered).length;
  const srsStats = leitnerGetStats();
  const dueCount = srsStats.dueToday;

  const steps: FlowStep[] = [
    {
      number: 1,
      icon: GraduationCap,
      title: '오늘의 문제 풀기',
      description: '기출문제로 실력 점검',
      href: '/kice',
      color: 'text-primary',
    },
    {
      number: 2,
      icon: ClipboardX,
      title: '오답노트 확인',
      description: '틀린 문제 분석하기',
      href: '/wrong-notes',
      badge: wrongCount > 0 ? `${wrongCount}건` : undefined,
      color: 'text-red-500',
    },
    {
      number: 3,
      icon: BookOpen,
      title: '부족한 부분 보충',
      description: '취약 영역 학습 콘텐츠',
      href: '/structure',
      color: 'text-emerald-500',
    },
    {
      number: 4,
      icon: RefreshCw,
      title: '틀린 문제 다시 풀기',
      description: 'SRS 간격 반복 복습',
      href: '/wrong-notes?tab=srs',
      badge: dueCount > 0 ? `${dueCount}개 복습` : undefined,
      color: 'text-violet-500',
    },
  ];

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground px-1">학습 흐름</h3>
      <div className="space-y-2">
        {steps.map((step) => (
          <Link key={step.number} href={step.href}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-3 py-3 px-4">
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg bg-muted ${step.color}`}>
                  <step.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{step.title}</span>
                    {step.badge && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        {step.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
