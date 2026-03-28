import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '상황 시뮬레이션',
  description: '상황 시뮬레이션으로 실전 문제 해결력을 키우세요.',
};

export default function ScenariosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
