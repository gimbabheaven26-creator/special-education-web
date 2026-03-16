'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  GraduationCap,
  TrendingUp,
  Network,
  BookX,
  BarChart3,
} from 'lucide-react';

const tabs = [
  { href: '/', icon: Home, label: '홈' },
  { href: '/kice', icon: GraduationCap, label: '기출' },
  { href: '/analytics', icon: TrendingUp, label: '출제경향' },
  { href: '/structure', icon: Network, label: '구조도' },
  { href: '/wrong-notes', icon: BookX, label: '오답노트' },
  { href: '/stats', icon: BarChart3, label: '통계' },
];

export function BottomTabBar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 print:hidden">
      <div className="flex items-center justify-around h-[4.25rem] px-1 pb-safe">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 py-2 rounded-xl transition-colors ${
                active
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              <tab.icon className={`h-5 w-5 ${active ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-[10px] leading-tight ${active ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
              {active && (
                <span className="absolute top-1 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
