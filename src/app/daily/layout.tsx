import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '오늘의 학습',
  description: 'OX·단답·서술형 문제로 매일 실력을 점검하세요.',
};

export default function DailyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
