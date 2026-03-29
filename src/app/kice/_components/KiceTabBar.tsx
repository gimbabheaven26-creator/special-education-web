'use client';

import Link from 'next/link';

export type KiceTab = 'by-year' | 'analytics';

const TABS: { key: KiceTab; label: string; href: string }[] = [
  { key: 'by-year', label: '기출문제', href: '/kice?tab=by-year' },
  { key: 'analytics', label: '출제분석', href: '/kice?tab=analytics' },
];

const INACTIVE =
  'px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-muted-foreground/30 border-b-2 border-transparent transition-colors min-h-[44px] flex items-center';
const ACTIVE =
  'px-4 py-2.5 text-sm font-semibold border-b-2 border-primary text-primary min-h-[44px] flex items-center';

export default function KiceTabBar({ activeTab }: { activeTab: KiceTab }) {
  return (
    <div className="flex border-b border-border" role="tablist" aria-label="기출문제 보기 방식">
      {TABS.map((tab) =>
        tab.key === activeTab ? (
          <span key={tab.key} role="tab" aria-selected="true" className={ACTIVE}>
            {tab.label}
          </span>
        ) : (
          <Link key={tab.key} href={tab.href} role="tab" aria-selected="false" className={INACTIVE}>
            {tab.label}
          </Link>
        ),
      )}
    </div>
  );
}
