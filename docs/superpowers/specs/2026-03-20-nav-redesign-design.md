# 네비게이션 전면 재설계 스펙

**날짜**: 2026-03-20
**작성**: 스미스 프라임
**상태**: 승인됨 (카이란 확인)

---

## 1. 목표

현재 4개 flat 링크 구조(헤더) + 5탭(하단)을 말해보카식 계층 탐색으로 전환한다.
서비스에 축적된 기능(기출분석, 마스터리, 인터랙티브, BDS 등)이 숨겨져 있는 문제를 해소하고,
장기 비전(3-Phase 스캐폴딩, 게임식 로드맵)을 반영한 IA를 확립한다.

---

## 2. 정보 구조 (확정)

| 탭 | 서브 페이지 | 라우트 |
|----|-----------|--------|
| **홈** | — | `/` |
| **진단평가** | 오늘학습 | `/daily` |
| | 용어학습 | `/terms` |
| **실력쌓기** | 과목학습 | `/subjects` |
| | 모의고사 | `/kice/exam` |
| | 워크시트 | `/worksheets` |
| | 인터랙티브 | `/interactive` |
| **메타인지** | 마스터리 트리 | `/mastery` |
| | 학습통계 | `/stats` |
| | 북마크 | `/bookmarks` |
| | 출제경향 | `/kice/analytics` |
| | 오답노트 | `/wrong-notes` |
| | 플래시카드 | `/flashcards` |
| **함께하기** | 커뮤니티 | `/community` |
| | 리뷰 | `/reviews` |
| | BDS 시나리오 | `/scenarios` |

---

## 3. 컴포넌트 설계

### 3-1. Header.tsx (데스크탑)

**현재**: 로고 + 4개 flat 링크 (오늘학습, 커뮤니티, 오답노트, 용어학습)
**변경 후**: 로고(= `/` 홈) + 4개 드롭다운 그룹 (진단평가, 실력쌓기, 메타인지, 함께하기)

```
[특수교육 공부방 로고]  진단평가▾  실력쌓기▾  메타인지▾  함께하기▾  [검색][테마][AuthButton]
```

- 드롭다운: hover(md+) 시 서브 메뉴 표시
- 현재 경로의 탭 그룹에 active 표시
- 드롭다운 아이템: 아이콘 + 레이블 + 한 줄 설명 (선택)
- 드롭다운 컨테이너: `absolute`, `z-50`, 배경 `bg-background/95 backdrop-blur`

### 3-2. BottomTabBar.tsx (모바일)

**현재**: 5탭 flat (홈, 오늘학습, 오답노트, 용어학습, 통계)
**변경 후**: 5탭 계층 (홈, 진단평가, 실력쌓기, 메타인지, 함께하기) + 서브메뉴 스트립

```
┌────────────────────────────────────┐
│  [오늘학습] [용어학습]              ← 서브메뉴 스트립 (활성 탭 서브 항목)
├────────────────────────────────────┤
│  홈   진단평가  실력쌓기  메타인지  함께하기  ← 탭바
└────────────────────────────────────┘
```

- 서브메뉴 스트립: 활성 탭이 `홈`이면 숨김, 나머지 탭은 서브 목록 수평 스크롤
- 스트립 높이: `h-10` (약 40px), 탭바 바로 위 고정
- 스트립 아이템: 텍스트 링크, 현재 경로 일치 시 `text-primary font-bold`
- isActive 로직: 서브 항목의 `href`가 `pathname`과 매칭되면 해당 탭 그룹 active

### 3-3. 아이콘 매핑 (lucide-react)

| 탭 | 아이콘 |
|---|---|
| 홈 | `Home` |
| 진단평가 | `ClipboardCheck` |
| 실력쌓기 | `Dumbbell` |
| 메타인지 | `Brain` |
| 함께하기 | `Users` |

---

## 4. 데이터 구조

### navConfig (중앙 관리)

```typescript
// src/lib/nav-config.ts (신규)
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
```

Header와 BottomTabBar 모두 이 config를 import해서 사용한다.

---

## 5. Active 상태 판정

```typescript
// href 정확 매칭 or 하위 경로 매칭 (trailing slash 필수)
function isPathMatch(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + '/');
}

// 어느 그룹에 속하는지 판정
function getActiveGroupId(pathname: string, groups: NavGroup[]): string | null {
  if (pathname === '/') return null; // 홈은 탭 그룹 없음
  for (const group of groups) {
    if (group.items.some(item => isPathMatch(pathname, item.href))) {
      return group.id;
    }
  }
  return null;
}
```

> `/kice/exam`과 `/kice/analytics` 모두 `startsWith('/kice/')` 이므로 반드시 trailing slash 포함 매칭 사용.

---

## 6. 변경 파일 목록

| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `src/lib/nav-config.ts` | **신규** | 중앙 IA 설정 |
| `src/components/layout/Header.tsx` | **수정** | 드롭다운 네비게이션 |
| `src/components/layout/BottomTabBar.tsx` | **수정** | 5탭 + 서브메뉴 스트립 |

`adminNavLinks`(리뷰)는 `함께하기` 그룹으로 통합.
`showAdminNav` prop은 **제거**한다. `/reviews`는 모든 사용자에게 노출되는 `함께하기` 서브메뉴로 이동하므로 조건 분기 불필요. `layout.tsx`에서 `showAdminNav` 전달 제거 필요.

---

## 7. 하위 호환 / 마이그레이션

- 기존 라우트 변경 없음 — 모든 href는 현재 라우트 그대로 사용
- `/reviews`는 현재 `adminNavLinks`였으나 `함께하기` 그룹으로 이동 (showAdminNav 조건 검토 필요)
- `/structure` 는 건드리지 않음 (AdminOnly 래핑 현행 유지)

---

## 8. 비기능 요구사항

- 드롭다운 hover는 `md:` 이상만 (`@media (min-width: 768px)`)
- 서브메뉴 스트립은 `md:hidden` (모바일 전용)
- 전체 네비게이션 `print:hidden` 유지
- 접근성: 드롭다운에 `aria-expanded`, `aria-haspopup` 적용
- 키보드 접근성 (이번 버전 범위): `Enter`/`Space`로 드롭다운 열기, `Escape`로 닫기. 화살표 키 탐색은 **다음 버전**으로 미룸.
- 애니메이션: `transition-all duration-150` 정도의 subtle 진입 효과
- 모바일 하단 여백: 서브메뉴 스트립(`h-10`) + 탭바(`h-[4.25rem]`) + `pb-safe` 합산 높이를 `layout.tsx`의 `pb-` 패딩에 반영 (`pb-[calc(4.25rem+2.5rem+env(safe-area-inset-bottom))]`). 강선생2가 BottomTabBar 수정 시 layout.tsx 패딩도 함께 조정.

---

## 9. 롤백 계획

Header, BottomTabBar는 전체 앱에 렌더링되는 레이아웃 컴포넌트. 빌드/런타임 오류 시 즉각 롤백.

```bash
# nav-config.ts 삭제 + Header/BottomTabBar git 복원
git checkout HEAD -- src/components/layout/Header.tsx src/components/layout/BottomTabBar.tsx
git rm src/lib/nav-config.ts
```

작업 전 커밋을 반드시 확보할 것. 구현 완료 후 `npm run build` exit 0 확인 전까지 병합 금지.

---

## 10. 담당

- **강선생1**: Header.tsx + nav-config.ts (auth 도메인 인접)
- **강선생2**: BottomTabBar.tsx (강선생1 완료 후 nav-config import해서 연동)

---

## 11. 완료 기준

- `npm run build` exit 0
- 데스크탑: 4개 탭 드롭다운 정상 동작
- 모바일: 탭 전환 시 서브메뉴 스트립 갱신
- 현재 경로 기반 active 그룹 하이라이트 정확
- 리뷰 링크가 `함께하기` 서브메뉴에서 접근 가능
