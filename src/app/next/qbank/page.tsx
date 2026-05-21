import type { Metadata } from 'next';

import { QbankBuilder } from './QbankBuilder';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'SEW Next Qbank',
  description: '영역, 난도, 문항 형식으로 SEW Next 커스텀 문제은행 세션을 구성합니다.',
};

export default function NextQbankPage() {
  return <QbankBuilder />;
}
