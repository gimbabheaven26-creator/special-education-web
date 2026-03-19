'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home } from 'lucide-react';
import { NAV_GROUPS, getActiveGroupId, isPathMatch } from '@/lib/nav-config';

export function BottomTabBar() {
  const pathname = usePathname();
  const activeGroupId = getActiveGroupId(pathname);

  // 활성 그룹의 서브 항목 (홈이면 빈 배열)
  const activeGroup = NAV_GROUPS.find((g) => g.id === activeGroupId);
  const subItems = activeGroup?.items ?? [];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 print:hidden" aria-label="모바일 하단 탭">
      {/* 서브메뉴 스트립 — 활성 탭의 서브 항목 수평 스크롤 */}
      {subItems.length > 0 && (
        <div className="flex items-center gap-1 px-3 h-10 border-b border-border overflow-x-auto scrollbar-hide">
          {subItems.map((item) => {
            const isSubActive = isPathMatch(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  isSubActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}

      {/* 메인 탭바 */}
      <div className="flex items-center justify-around h-[4.25rem] px-1 pb-safe">
        {/* 홈 탭 */}
        <Link
          href="/"
          className={`relative flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 py-2 rounded-xl transition-colors ${
            pathname === '/' ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <Home className={`h-5 w-5 ${pathname === '/' ? 'stroke-[2.5]' : ''}`} />
          <span className={`text-[10px] leading-tight ${pathname === '/' ? 'font-bold' : 'font-medium'}`}>
            홈
          </span>
          {pathname === '/' && (
            <span className="absolute top-1 w-1 h-1 rounded-full bg-primary" />
          )}
        </Link>

        {/* 그룹 탭 */}
        {NAV_GROUPS.map((group) => {
          const isActive = activeGroupId === group.id;
          const Icon = group.icon;
          const firstHref = group.items[0]?.href ?? '/';
          return (
            <Link
              key={group.id}
              href={firstHref}
              className={`relative flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 py-2 rounded-xl transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-[10px] leading-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                {group.label}
              </span>
              {isActive && (
                <span className="absolute top-1 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
