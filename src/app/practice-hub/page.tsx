import Link from 'next/link';
import { Dumbbell, BookOpen, ClipboardList, Gamepad2, ChevronRight } from 'lucide-react';
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
    span: 1,
  },
  {
    href: '/practice',
    icon: ClipboardList,
    title: '문제풀기',
    description: '모의고사·워크시트 실전 대비',
    span: 1,
  },
  {
    href: '/interactive',
    icon: Gamepad2,
    title: '인터랙티브',
    description: '참여형 학습 활동',
    span: 2,
  },
] as const;

export default function PracticeHubPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-primary-foreground">
            <Dumbbell className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">실력쌓기</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          개념부터 실전까지, 체계적으로 실력을 쌓으세요.
        </p>
      </div>

      {/* 카드 그리드 */}
      <div className="grid grid-cols-2 gap-3 mb-10">
        {CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className={`group flex items-center justify-between p-5 rounded-xl border border-border hover:border-primary/40 hover:bg-muted/40 transition-all ${
                card.span === 2 ? 'col-span-2' : ''
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors shrink-0">
                  <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                    {card.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {card.description}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
            </Link>
          );
        })}
      </div>

      {/* 학습 현황 */}
      <PracticeProgress />
    </div>
  );
}
