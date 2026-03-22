import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '마스터리 트리',
  description: '과목별 숙달도를 확인하고 취약 영역을 집중 공략하세요.',
};

export default function MasteryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
