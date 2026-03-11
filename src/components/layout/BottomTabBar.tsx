'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  BookOpen,
  Brain,
  Layers,
  MoreHorizontal,
  FileText,
  Bookmark,
  Search,
  X,
} from 'lucide-react';
import { useState } from 'react';

const tabs = [
  { href: '/', icon: Home, label: '홈' },
  { href: '/subjects', icon: BookOpen, label: '학습' },
  { href: '/quiz', icon: Brain, label: '퀴즈' },
  { href: '/flashcards', icon: Layers, label: '카드' },
];

const moreLinks = [
  { href: '/worksheets', icon: FileText, label: '문제지' },
  { href: '/bookmarks', icon: Bookmark, label: '북마크' },
  { href: '/search', icon: Search, label: '검색' },
];

export function BottomTabBar() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const isMoreActive = moreLinks.some((l) => isActive(l.href));

  return (
    <>
      {/* 더보기 시트 */}
      {showMore && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
            onClick={() => setShowMore(false)}
          />
          <div className="fixed bottom-[4.5rem] left-4 right-4 z-50 md:hidden rounded-2xl bg-card border border-border shadow-xl p-3 animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-semibold text-muted-foreground">더보기</span>
              <button
                onClick={() => setShowMore(false)}
                className="p-1 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {moreLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setShowMore(false)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl transition-colors ${
                    isActive(link.href)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <link.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 탭바 */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 print:hidden">
        <div className="flex items-center justify-around h-[4.25rem] px-2 pb-safe">
          {tabs.map((tab) => {
            const active = isActive(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center justify-center gap-0.5 min-w-[3.5rem] py-2 rounded-xl transition-colors ${
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <tab.icon className={`h-5 w-5 ${active ? 'stroke-[2.5]' : ''}`} />
                <span className={`text-[10px] ${active ? 'font-bold' : 'font-medium'}`}>
                  {tab.label}
                </span>
                {active && (
                  <span className="absolute top-1 w-1 h-1 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
          <button
            onClick={() => setShowMore(!showMore)}
            className={`flex flex-col items-center justify-center gap-0.5 min-w-[3.5rem] py-2 rounded-xl transition-colors ${
              isMoreActive || showMore
                ? 'text-primary'
                : 'text-muted-foreground'
            }`}
          >
            <MoreHorizontal className={`h-5 w-5 ${isMoreActive ? 'stroke-[2.5]' : ''}`} />
            <span className={`text-[10px] ${isMoreActive ? 'font-bold' : 'font-medium'}`}>
              더보기
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
