import type { Metadata } from 'next';
import RecordDashboard from './RecordDashboard';

export const metadata: Metadata = {
  title: '내 기록',
  description: '학습 진도, 정답률, 오답 현황을 한눈에 확인하세요.',
};

export default function RecordPage() {
  return <RecordDashboard />;
}
