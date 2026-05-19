import type { Metadata } from 'next';

import { SewNextLab } from './SewNextLab';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'SEW Next',
  description: '특수교육 임용 준비도를 중심으로 재설계한 차세대 학습 프로토타입입니다.',
};

export default function SewNextPage() {
  return <SewNextLab />;
}
