'use client';

import Link from 'next/link';

export type KiceTab = 'by-year' | 'by-area' | 'analytics' | 'search';

const TABS: { key: KiceTab; label: string; href: string }[] = [
  { key: 'by-year', label: '연도별 기출', href: '/kice?tab=by-year' },
  { key: 'by-area', label: '영역별 기출', href: '/kice?tab=by-area' },
  { key: 'analytics', label: '빈도분석', href: '/kice?tab=analytics' },
  { key: 'search', label: '키워드 검색', href: '/kice?tab=search' },
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
