import type { Metadata } from 'next';
import { NextResultsClient } from './NextResultsClient';

export const metadata: Metadata = {
  title: 'SEW Next Results',
  description: 'SEW Next 학습 세션, 모의고사 추세, 다음 학습 처방을 확인합니다.',
};

export default function NextResultsPage() {
  return <NextResultsClient />;
}
