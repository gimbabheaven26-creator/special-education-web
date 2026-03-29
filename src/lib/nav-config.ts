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
  href?: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'diagnosis',
    label: '진단평가',
    icon: ClipboardCheck,
    href: '/diagnosis',
    items: [
      { href: '/quiz/ox', label: 'OX 퀴즈', description: '전 과목 OX 문제' },
      { href: '/quiz/short', label: '단답형', description: '전 과목 단답형 문제' },
      { href: '/terms', label: '용어학습', description: '핵심 용어 플래시카드' },
    ],
  },
  {
    id: 'practice',
    label: '실력쌓기',
    icon: Dumbbell,
    href: '/practice-hub',
    items: [
      { href: '/concepts', label: '개념학습', description: '과목별 핵심 개념 정리' },
      { href: '/practice', label: '문제풀기', description: '모의고사·워크시트 실전 대비' },
      { href: '/interactive', label: '인터랙티브', description: '매칭·빈칸·절차 연습' },
      { href: '/scenarios', label: '상황 시뮬레이션', description: '교실 상황 분기형 의사결정' },
    ],
  },
  {
    id: 'metacognition',
    label: '내 기록',
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
    href: '/community',
    items: [
      { href: '/community', label: '커뮤니티', description: '함께 문제 만들고 풀기' },
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
    if (group.href && isPathMatch(pathname, group.href)) {
      return group.id;
    }
    if (group.items.some((item) => isPathMatch(pathname, item.href))) {
      return group.id;
    }
  }
  return null;
}
