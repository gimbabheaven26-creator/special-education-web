import Link from 'next/link';
import { Brain, FileText, Layers, ClipboardX, BarChart3 } from 'lucide-react';
import { getSubjects } from '@/lib/db';
import { StreakBanner } from '@/components/dashboard/StreakBanner';
import { DailyGoalCard } from '@/components/dashboard/DailyGoalCard';
import { ContinueLearning } from '@/components/dashboard/ContinueLearning';
import { SubjectGrid } from '@/components/dashboard/SubjectGrid';

const quickActions = [
  { href: '/quiz', icon: Brain, label: '퀴즈', color: 'bg-xp/10 text-xp' },
  { href: '/worksheets', icon: FileText, label: '문제지', color: 'bg-primary/10 text-primary' },
  { href: '/flashcards', icon: Layers, label: '플래시카드', color: 'bg-streak/10 text-streak' },
  { href: '/wrong-notes', icon: ClipboardX, label: '오답노트', color: 'bg-red-500/10 text-red-600 dark:text-red-400' },
  { href: '/stats', icon: BarChart3, label: '통계', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
];

export default async function HomePage() {
  const subjects = await getSubjects();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* 스트릭 배너 */}
      <StreakBanner />

      {/* 빠른 액션 */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} hover:opacity-80 transition-opacity`}
          >
            <action.icon className="h-6 w-6" />
            <span className="text-xs font-semibold">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* 오늘의 목표 + 이어서 학습하기 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DailyGoalCard />
        <ContinueLearning />
      </div>

      {/* 전체 과목 */}
      <SubjectGrid subjects={subjects} />
    </div>
  );
}
