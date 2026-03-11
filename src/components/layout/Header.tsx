'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Sun, Moon, Menu, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useState, useEffect } from 'react';

const navLinks = [
  { href: '/subjects', label: '과목' },
  { href: '/quiz', label: '퀴즈' },
  { href: '/worksheets', label: '문제지' },
  { href: '/flashcards', label: '플래시카드' },
  { href: '/bookmarks', label: '북마크' },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label="테마 전환">
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
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

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-6xl mx-auto px-4 md:px-8 flex h-16 items-center justify-between">
        {/* 좌측: 사이트명 */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg text-foreground hover:text-primary transition-colors"
        >
          <BookOpen className="h-6 w-6" />
          <span>특수교육 공부방</span>
        </Link>

        {/* 중앙: 네비게이션 (데스크탑) */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* 우측: 다크모드 토글 + 햄버거 */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* 모바일 햄버거 메뉴 */}
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="메뉴 열기">
                  <Menu className="h-5 w-5" />
                </Button>
              }
            />
            <SheetContent side="right" className="w-64">
              <nav className="flex flex-col gap-4 mt-8">
                <Link
                  href="/"
                  className="flex items-center gap-2 font-bold text-lg text-foreground"
                >
                  <BookOpen className="h-5 w-5" />
                  <span>특수교육 공부방</span>
                </Link>
                <div className="border-t border-border pt-4 flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
