import Link from 'next/link';
import { BookOpen, ClipboardList, Gamepad2, Drama, ArrowRight } from 'lucide-react';
import { PracticeProgress } from './PracticeProgress';

export const metadata = {
  title: '실력쌓기 | 특수교육 공부방',
  description: '개념부터 실전까지, 체계적으로 실력을 쌓으세요.',
};

const CARDS = [
  {
    href: '/concepts',
    icon: BookOpen,
    title: '개념학습',
    description: '과목별 핵심 개념 정리',
    color: 'bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
  },
  {
    href: '/practice',
    icon: ClipboardList,
    title: '문제풀기',
    description: '모의고사·워크시트 실전 대비',
    color: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
  },
  {
    href: '/interactive',
    icon: Gamepad2,
    title: '인터랙티브',
    description: '매칭·빈칸·절차 연습',
    color: 'bg-purple-100 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400',
  },
  {
    href: '/scenarios',
    icon: Drama,
    title: '상황 시뮬레이션',
    description: '교실 상황 분기형 의사결정',
    color: 'bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
  },
] as const;

export default function PracticeHubPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">실력쌓기</h1>
        <p className="text-sm text-muted-foreground mt-1">
          개념부터 실전까지, 체계적으로 실력을 쌓으세요
        </p>
      </div>

      {/* 학습 현황 + 이어서 학습 */}
      <PracticeProgress />

      {/* 학습 메뉴 */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground px-1">학습 메뉴</h2>
        {CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors group"
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{card.title}</p>
                <p className="text-sm text-muted-foreground">{card.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
