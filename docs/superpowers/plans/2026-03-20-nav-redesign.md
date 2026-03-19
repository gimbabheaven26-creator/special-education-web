# 네비게이션 전면 재설계 구현 플랜

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 헤더(데스크탑 드롭다운) + 하단탭바(5탭 + 서브메뉴 스트립)를 5-그룹 계층 IA로 전면 교체한다.

**Architecture:** 중앙 `nav-config.ts`에 IA 데이터를 정의하고, Header와 BottomTabBar가 이를 import한다. 순수 함수(`isPathMatch`, `getActiveGroupId`)는 유닛 테스트(TDD)로 커버하고, 컴포넌트(Header, BottomTabBar)는 Next.js 14 App Router `usePathname`의 jsdom 모킹 비용이 높아 빌드 검증 + 수동 UI 검증으로 완료 확인한다. aria/키보드 요구사항은 수동 체크리스트로 검증.

**Tech Stack:** Next.js 14 App Router, Tailwind CSS v4, lucide-react, Vitest + jsdom

**Spec:** `docs/superpowers/specs/2026-03-20-nav-redesign-design.md`

---

## Chunk 1: nav-config.ts — 중앙 IA 설정 + 유닛 테스트

**Files:**
- Create: `src/lib/__tests__/nav-config.test.ts` (테스트 먼저)
- Create: `src/lib/nav-config.ts`

---

- [ ] **Step 1.1: 유닛 테스트 작성 (RED — nav-config.ts 아직 없음)**

```typescript
// src/lib/__tests__/nav-config.test.ts
import { describe, it, expect } from 'vitest';
import { isPathMatch, getActiveGroupId, NAV_GROUPS } from '../nav-config';

describe('isPathMatch', () => {
  it('정확 매칭', () => {
    expect(isPathMatch('/daily', '/daily')).toBe(true);
  });

  it('하위 경로 매칭', () => {
    expect(isPathMatch('/subjects/biology', '/subjects')).toBe(true);
  });

  it('trailing slash 없이 prefix 매칭 차단', () => {
    // /kice/exam 이 /kice/examfoo 를 매칭하면 안 됨
    expect(isPathMatch('/kice/examfoo', '/kice/exam')).toBe(false);
  });

  it('/kice/exam 과 /kice/analytics 혼동 없음', () => {
    expect(isPathMatch('/kice/analytics', '/kice/exam')).toBe(false);
    expect(isPathMatch('/kice/exam', '/kice/analytics')).toBe(false);
  });

  it('다른 경로는 false', () => {
    expect(isPathMatch('/wrong-notes', '/daily')).toBe(false);
  });
});

describe('getActiveGroupId', () => {
  it('홈은 null 반환', () => {
    expect(getActiveGroupId('/')).toBeNull();
  });

  it('/daily → diagnosis', () => {
    expect(getActiveGroupId('/daily')).toBe('diagnosis');
  });

  it('/terms → diagnosis', () => {
    expect(getActiveGroupId('/terms')).toBe('diagnosis');
  });

  it('/subjects → practice', () => {
    expect(getActiveGroupId('/subjects')).toBe('practice');
  });

  it('/kice/exam → practice', () => {
    expect(getActiveGroupId('/kice/exam')).toBe('practice');
  });

  it('/kice/analytics → metacognition', () => {
    expect(getActiveGroupId('/kice/analytics')).toBe('metacognition');
  });

  it('/wrong-notes → metacognition', () => {
    expect(getActiveGroupId('/wrong-notes')).toBe('metacognition');
  });

  it('/community → community', () => {
    expect(getActiveGroupId('/community')).toBe('community');
  });

  it('/community/create → community (하위 경로)', () => {
    expect(getActiveGroupId('/community/create')).toBe('community');
  });

  it('/reviews → community', () => {
    expect(getActiveGroupId('/reviews')).toBe('community');
  });

  it('알 수 없는 경로 → null', () => {
    expect(getActiveGroupId('/unknown')).toBeNull();
  });
});

describe('NAV_GROUPS 구조', () => {
  it('4개 그룹', () => {
    expect(NAV_GROUPS).toHaveLength(4);
  });

  it('각 그룹에 id, label, icon, items 존재', () => {
    for (const group of NAV_GROUPS) {
      expect(group.id).toBeTruthy();
      expect(group.label).toBeTruthy();
      expect(group.icon).toBeDefined();
      expect(group.items.length).toBeGreaterThan(0);
    }
  });

  it('총 서브 항목 수 (2+4+6+3 = 15)', () => {
    const total = NAV_GROUPS.reduce((sum, g) => sum + g.items.length, 0);
    expect(total).toBe(15);
  });
});
```

- [ ] **Step 1.2: 테스트 실행 → RED 확인**

```bash
cd ~/Projects/special-education-web
npx vitest run src/lib/__tests__/nav-config.test.ts
```

Expected: `Cannot find module '../nav-config'` 오류 또는 import 실패 — 파일이 없으므로 반드시 fail해야 함.

- [ ] **Step 1.3: nav-config.ts 생성**

```typescript
// src/lib/nav-config.ts
import {
  ClipboardCheck,
  Dumbbell,
  Brain,
  Users,
  type LucideIcon,
} from 'lucide-react';

export type NavItem = {
  href: string;
  label: string;
  description?: string;
};

export type NavGroup = {
  id: string;
  label: string;
  icon: LucideIcon;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'diagnosis',
    label: '진단평가',
    icon: ClipboardCheck,
    items: [
      { href: '/daily', label: '오늘학습', description: '오늘의 추천 문제' },
      { href: '/terms', label: '용어학습', description: '핵심 용어 플래시카드' },
    ],
  },
  {
    id: 'practice',
    label: '실력쌓기',
    icon: Dumbbell,
    items: [
      { href: '/subjects', label: '과목학습' },
      { href: '/kice/exam', label: '모의고사' },
      { href: '/worksheets', label: '워크시트' },
      { href: '/interactive', label: '인터랙티브' },
    ],
  },
  {
    id: 'metacognition',
    label: '메타인지',
    icon: Brain,
    items: [
      { href: '/mastery', label: '마스터리 트리' },
      { href: '/stats', label: '학습통계' },
      { href: '/bookmarks', label: '북마크' },
      { href: '/kice/analytics', label: '출제경향' },
      { href: '/wrong-notes', label: '오답노트' },
      { href: '/flashcards', label: '플래시카드' },
    ],
  },
  {
    id: 'community',
    label: '함께하기',
    icon: Users,
    items: [
      { href: '/community', label: '커뮤니티' },
      { href: '/reviews', label: '리뷰' },
      { href: '/scenarios', label: 'BDS 시나리오' },
    ],
  },
];

/** href 정확 매칭 또는 하위 경로 매칭 (trailing slash 보장) */
export function isPathMatch(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + '/');
}

/** 현재 pathname이 속한 그룹 id 반환. 홈('/')이거나 미매칭 시 null */
export function getActiveGroupId(pathname: string): string | null {
  if (pathname === '/') return null;
  for (const group of NAV_GROUPS) {
    if (group.items.some((item) => isPathMatch(pathname, item.href))) {
      return group.id;
    }
  }
  return null;
}
```

- [ ] **Step 1.4: 테스트 재실행 → GREEN 확인**

```bash
npx vitest run src/lib/__tests__/nav-config.test.ts
```

Expected: `15 tests passed`

- [ ] **Step 1.5: 커밋**

```bash
git add src/lib/nav-config.ts src/lib/__tests__/nav-config.test.ts
git commit -m "feat: nav-config.ts — 5-그룹 IA 중앙 설정 + 유닛 테스트 15개"
```

---

## Chunk 2: Header.tsx — 데스크탑 드롭다운 네비게이션

**Files:**
- Modify: `src/components/layout/Header.tsx` (전체 교체)
- Modify: `src/app/layout.tsx` (`isAdmin` import 제거, `showAdminNav` prop 제거, `async` 제거)

현재 Header.tsx는 105줄. 드롭다운 로직 추가로 약 120~140줄 예상.

---

- [ ] **Step 2.1: Header.tsx 교체**

```tsx
// src/components/layout/Header.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Sun, Moon, BookOpen, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef } from 'react';
import { AuthButton } from './AuthButton';
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

  // 외부 클릭 시 닫기
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
    >
      <button
        className={`flex items-center gap-1 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
          isActive
            ? 'text-primary bg-primary/10'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        }`}
        aria-haspopup="true"
        aria-expanded={open}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen((v) => !v); }
          if (e.key === 'Escape') setOpen(false);
        }}
      >
        <Icon className="h-4 w-4" />
        {group.label}
        <span className="text-[10px] opacity-60">▾</span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-44 rounded-xl border border-border bg-background/95 backdrop-blur shadow-lg py-1 z-50 transition-all duration-150">
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
        <nav className="hidden md:flex items-center gap-1">
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
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2.2: layout.tsx 수정 — isAdmin 제거 + async 제거 + Header prop 제거**

`src/app/layout.tsx` 변경사항 (3개):

```tsx
// ① isAdmin import 삭제 (파일 상단)
// Before: import { isAdmin } from "@/lib/profile";
// After: (줄 자체 삭제)

// ② async 제거 + adminUser 라인 삭제
// Before:
export default async function RootLayout({ children }: ...) {
  const adminUser = await isAdmin().catch(() => false);
  ...
}
// After:
export default function RootLayout({ children }: ...) {
  ...
}

// ③ Header prop 제거
// Before: <Header showAdminNav={adminUser} />
// After:  <Header />
```

> `isAdmin`을 제거하면 `async`가 필요한 await가 없으므로 `async`도 함께 제거한다.

- [ ] **Step 2.3: TypeScript 타입 체크**

```bash
cd ~/Projects/special-education-web
npx tsc --noEmit
```

Expected: 0 errors. `showAdminNav` 관련 잔류 오류 없어야 함.

- [ ] **Step 2.4: 빌드 확인**

```bash
npm run build
```

Expected: exit 0

- [ ] **Step 2.5: 수동 UI 검증 — 접근성 포함**

```bash
npm run dev
```

체크리스트:
- [ ] `http://localhost:3000` 접속 → 헤더에 4개 그룹 탭 표시
- [ ] 각 그룹 hover → 드롭다운 표시, mouse leave → 닫힘
- [ ] 서브메뉴 링크 클릭 → 해당 페이지 이동 + 드롭다운 닫힘
- [ ] `/daily` 에서 `진단평가` 탭 하이라이트 (primary 색상)
- [ ] `/kice/analytics` 에서 `메타인지` 탭 하이라이트 (`실력쌓기` 아님)
- [ ] 탭 버튼에 Tab 키 포커스 → `Enter` 또는 `Space` → 드롭다운 열림
- [ ] 드롭다운 열린 상태에서 `Escape` → 닫힘
- [ ] 드롭다운 button에 `aria-haspopup="true"` 및 `aria-expanded` 확인 (DevTools Elements 탭)
- [ ] 모바일 너비(≤768px)에서 드롭다운 nav 숨김 (헤더 로고 + 우측 액션만 표시)

- [ ] **Step 2.6: 커밋**

```bash
git add src/components/layout/Header.tsx src/app/layout.tsx
git commit -m "feat: Header 드롭다운 네비게이션 — 4그룹 IA, showAdminNav/isAdmin/async 제거"
```

---

## Chunk 3: BottomTabBar.tsx — 5탭 + 서브메뉴 스트립

**Files:**
- Modify: `src/components/layout/BottomTabBar.tsx` (전체 교체)
- Modify: `src/app/layout.tsx` (하단 패딩 조정)

---

- [ ] **Step 3.1: BottomTabBar.tsx 교체**

```tsx
// src/components/layout/BottomTabBar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home } from 'lucide-react';
import { NAV_GROUPS, getActiveGroupId } from '@/lib/nav-config';

export function BottomTabBar() {
  const pathname = usePathname();
  const activeGroupId = getActiveGroupId(pathname);

  // 활성 그룹의 서브 항목 (홈이면 빈 배열)
  const activeGroup = NAV_GROUPS.find((g) => g.id === activeGroupId);
  const subItems = activeGroup?.items ?? [];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 print:hidden">
      {/* 서브메뉴 스트립 — 활성 탭의 서브 항목 수평 스크롤 */}
      {subItems.length > 0 && (
        <div className="flex items-center gap-1 px-3 h-10 border-b border-border overflow-x-auto scrollbar-hide">
          {subItems.map((item) => {
            const isSubActive = pathname === item.href || pathname.startsWith(item.href + '/');
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
          // 탭 클릭 시 첫 번째 서브 항목으로 이동
          const firstHref = group.items[0].href;
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
```

> `relative` 클래스가 각 탭 `<Link>`에 추가되어 active dot(`absolute top-1`)이 탭 내부를 기준으로 위치한다.

- [ ] **Step 3.2: layout.tsx 하단 패딩 조정**

`src/app/layout.tsx`의 `<main>` 패딩:

```tsx
// Before
<main className="min-h-screen pb-20 md:pb-0">

// After — 서브메뉴 스트립(2.5rem) + 탭바(4.25rem) + iOS safe-area
<main className="min-h-screen pb-[calc(4.25rem+2.5rem+env(safe-area-inset-bottom))] md:pb-0">
```

> Tailwind v4는 arbitrary values 내 `env()` 지원. 노치 기기에서 safe-area까지 포함한 전체 높이를 예약한다.

- [ ] **Step 3.3: 빌드 확인**

```bash
npm run build
```

Expected: exit 0

- [ ] **Step 3.4: 전체 테스트 실행**

```bash
npx vitest run
```

Expected: 기존 109개 + nav-config 15개 = 124개 이상 통과

- [ ] **Step 3.5: 수동 UI 검증 — 모바일 시뮬레이션**

DevTools → 모바일 너비(≤768px):

- [ ] 하단에 5개 탭 표시: 홈, 진단평가, 실력쌓기, 메타인지, 함께하기
- [ ] 홈(`/`)에서는 서브메뉴 스트립 없음
- [ ] `진단평가` 탭 탭 → `/daily` 이동 + 스트립에 `오늘학습`, `용어학습` 표시
- [ ] 스트립 `용어학습` 탭 → `/terms` 이동, `용어학습` 스트립 아이템 pill 하이라이트
- [ ] `/kice/analytics`에서 `메타인지` 탭 active + 스트립 `출제경향` 하이라이트
- [ ] `/community/create`에서 `함께하기` 탭 active
- [ ] 스트립 없을 때(홈) 탭바 단독 높이 유지
- [ ] active dot이 탭 아이콘 위 정중앙에 위치 (탭 외부로 삐져나오지 않음)
- [ ] 페이지 콘텐츠 하단이 탭바/스트립에 가려지지 않음
- [ ] iOS Safari 시뮬레이션: 홈 인디케이터 영역과 탭바 겹치지 않음

- [ ] **Step 3.6: 커밋**

```bash
git add src/components/layout/BottomTabBar.tsx src/app/layout.tsx
git commit -m "feat: BottomTabBar 5탭+서브메뉴 스트립, safe-area 패딩 조정"
```

---

## 완료 기준 체크리스트

- [ ] `npx vitest run` → 전체 테스트 통과 (nav-config 15개 포함, 총 124개+)
- [ ] `npm run build` → exit 0
- [ ] `npx tsc --noEmit` → 0 errors
- [ ] 데스크탑: 4개 그룹 드롭다운 정상 동작 + Escape 닫힘
- [ ] 모바일: 탭 전환 시 서브메뉴 스트립 갱신
- [ ] `/kice/exam` ↔ `/kice/analytics` active 그룹 혼동 없음
- [ ] `/reviews` 가 `함께하기` 서브메뉴에서 접근 가능
- [ ] `showAdminNav` prop 완전 제거 (TypeScript 오류 없음)
- [ ] active dot이 `relative` 부모 기준으로 정상 위치
