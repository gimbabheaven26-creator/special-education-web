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
      { href: '/concepts', label: '개념학습', description: '과목별 핵심 개념 정리' },
      { href: '/worksheets', label: '워크시트', description: '과목별 개념 확인 문제지' },
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
