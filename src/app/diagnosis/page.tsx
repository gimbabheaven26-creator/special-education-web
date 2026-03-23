import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RecentDiagnostics } from './RecentDiagnostics';

export const metadata: Metadata = {
  title: '진단평가',
  description: '실력을 진단하고 약점을 파악하세요. OX 진단, 단답형 진단, 용어학습을 제공합니다.',
};

const DIAGNOSIS_CARDS = [
  {
    href: '/quiz/ox',
    icon: '\u2B55',
    title: 'OX 진단',
    description: '전 과목 OX 문제로 실력 진단',
  },
  {
    href: '/quiz/short',
    icon: '\u270F\uFE0F',
    title: '단답형 진단',
    description: '전 과목 단답형으로 실력 진단',
  },
] as const;

export default function DiagnosisPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-2">진단평가</h1>
      <p className="text-muted-foreground mb-8">
        실력을 진단하고 약점을 파악하세요.
      </p>

      {/* 진단 카드 — 2열 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {DIAGNOSIS_CARDS.map((card) => (
          <Link key={card.href} href={card.href} className="block group">
            <Card className="h-full transition-shadow duration-200 hover:shadow-md cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden="true">
                    {card.icon}
                  </span>
                  <CardTitle className="text-base font-semibold">
                    {card.title}
                  </CardTitle>
                </div>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* 용어학습 — 전체 너비 */}
      <Link href="/terms" className="block group mt-4">
        <Card className="transition-shadow duration-200 hover:shadow-md cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">
                &#128218;
              </span>
              <CardTitle className="text-base font-semibold">
                용어학습
              </CardTitle>
            </div>
            <CardDescription>핵심 용어 플래시카드</CardDescription>
          </CardHeader>
        </Card>
      </Link>

      {/* 최근 진단 기록 (클라이언트 컴포넌트) */}
      <RecentDiagnostics />
    </div>
  );
}
