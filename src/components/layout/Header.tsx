'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Sun, Moon, BookOpen, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { AuthButton } from './AuthButton';

const navLinks = [
  { href: '/kice', label: '기출' },
  { href: '/community', label: '커뮤니티' },
  { href: '/wrong-notes', label: '오답노트' },
  { href: '/stats', label: '통계' },
];

const adminNavLinks = [
  { href: '/reviews', label: '리뷰' },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      {theme === 'dark' ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
}

export function Header({ showAdminNav = false }: { showAdminNav?: boolean }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 print:hidden">
      <div className="max-w-6xl mx-auto px-4 md:px-8 flex h-14 md:h-16 items-center justify-between">
        {/* 로고 */}
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
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-muted transition-colors"
            >
              {link.label}
            </Link>
          ))}
          {showAdminNav && adminNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-muted transition-colors"
            >
              {link.label}
            </Link>
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
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
