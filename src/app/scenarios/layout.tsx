import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BDS 시나리오',
  description: '행동지원 시나리오를 통해 실전 문제 해결력을 키우세요.',
};

export default function ScenariosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
