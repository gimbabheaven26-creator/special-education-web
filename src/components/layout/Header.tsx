'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Sun, Moon, BookOpen, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef } from 'react';
import { UserMenu } from '@/components/auth/UserMenu';
import { NAV_GROUPS, getActiveGroupId } from '@/lib/nav-config';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-11 w-11 sm:h-10 sm:w-10" aria-label="테마 전환">
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-11 w-11 sm:h-10 sm:w-10"
      aria-label="테마 전환"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}

function NavDropdown({ group, isActive }: { group: (typeof NAV_GROUPS)[0]; isActive: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const Icon = group.icon;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(e) => {
        if (!ref.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      {/* 상위 메뉴 — Link로 첫 번째 항목으로 이동 */}
      <Link
        href={group.items[0].href}
        className={`flex items-center gap-1 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
          isActive
            ? 'text-primary bg-primary/10'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        }`}
        aria-haspopup="menu"
        aria-expanded={open}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false);
        }}
        onClick={() => setOpen(false)}
      >
        <Icon className="h-4 w-4" />
        {group.label}
        <span className="text-[10px] opacity-60">▾</span>
      </Link>

      {open && (
        /* pt-2: 버튼 하단~드롭다운 사이 투명 브리지 — mouseLeave 방지 */
        <div className="absolute top-full left-0 w-44 pt-2 z-50">
          <div className="rounded-xl border border-border bg-background/95 backdrop-blur shadow-lg py-1">
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const activeGroupId = getActiveGroupId(pathname);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 print:hidden">
      <div className="max-w-6xl mx-auto px-4 md:px-8 flex h-14 md:h-16 items-center justify-between">
        {/* 로고 = 홈 */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-foreground hover:text-primary transition-colors"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
            <BookOpen className="h-4.5 w-4.5" />
          </div>
          <span className="text-base md:text-lg">특수교육 공부방</span>
        </Link>

        {/* 데스크탑 네비게이션 */}
        <nav className="hidden md:flex items-center gap-1" aria-label="주 메뉴">
          {NAV_GROUPS.map((group) => (
            <NavDropdown
              key={group.id}
              group={group}
              isActive={activeGroupId === group.id}
            />
          ))}
        </nav>

        {/* 우측 액션 */}
        <div className="flex items-center gap-1">
          <Link href="/search">
            <Button variant="ghost" size="icon" className="h-11 w-11 sm:h-10 sm:w-10" aria-label="검색">
              <Search className="h-5 w-5" />
            </Button>
          </Link>
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
