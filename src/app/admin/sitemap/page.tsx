'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Home,
  ClipboardCheck,
  Dumbbell,
  Brain,
  Users,
  Settings,
  LogIn,
  Search,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  type LucideIcon,
} from 'lucide-react';

interface RouteNode {
  path: string;
  label: string;
  icon?: LucideIcon;
  status?: 'ok' | 'warn' | 'error';
  note?: string;
  children?: RouteNode[];
}

const SITE_STRUCTURE: RouteNode[] = [
  {
    path: '/',
    label: '홈',
    icon: Home,
    children: [
      { path: '/login', label: '로그인', icon: LogIn },
      { path: '/onboarding', label: '온보딩' },
      { path: '/search', label: '검색', icon: Search },
    ],
  },
  {
    path: '#diagnosis',
    label: '진단평가',
    icon: ClipboardCheck,
    children: [
      { path: '/daily', label: '오늘학습', note: '추천 문제 풀기' },
      {
        path: '/concepts',
        label: '개념학습',
        children: [
          { path: '/concepts/[subject]', label: '과목별 개념 목록' },
          { path: '/concepts/[subject]/[slug]', label: '개념 상세 (MDX)' },
        ],
      },
      {
        path: '/worksheets',
        label: '워크시트',
        children: [
          { path: '/worksheets/[id]', label: '워크시트 풀기' },
          { path: '/worksheets/[id]/answers', label: '워크시트 답안' },
        ],
      },
      { path: '/terms', label: '용어학습', note: '플래시카드 (한/영)' },
    ],
  },
  {
    path: '#practice',
    label: '실력쌓기',
    icon: Dumbbell,
    children: [
      {
        path: '/subjects',
        label: '과목학습',
        children: [
          { path: '/subjects/[slug]', label: '과목 상세' },
          { path: '/subjects/[slug]/[chapter]', label: '챕터 퀴즈' },
        ],
      },
      {
        path: '/kice',
        label: '기출문제',
        children: [
          { path: '/kice/exam', label: '모의고사' },
          { path: '/kice/analytics', label: '출제경향 분석' },
        ],
      },
      { path: '/interactive', label: '인터랙티브' },
      {
        path: '/quiz',
        label: '퀴즈',
        children: [
          { path: '/quiz/[subject]', label: '과목별 퀴즈' },
        ],
      },
    ],
  },
  {
    path: '#metacognition',
    label: '내 기록',
    icon: Brain,
    children: [
      { path: '/mastery', label: '마스터리 트리' },
      { path: '/stats', label: '학습통계' },
      { path: '/bookmarks', label: '북마크' },
      {
        path: '/wrong-notes',
        label: '오답노트',
        children: [
          { path: '/wrong-notes/quiz', label: '오답 재시험' },
        ],
      },
      {
        path: '/flashcards',
        label: '플래시카드',
        children: [
          { path: '/flashcards/add', label: '카드 추가' },
          { path: '/flashcards/review', label: '카드 복습' },
        ],
      },
      { path: '/my', label: '마이페이지' },
    ],
  },
  {
    path: '#community',
    label: '함께하기',
    icon: Users,
    children: [
      {
        path: '/community',
        label: '커뮤니티',
        children: [
          { path: '/community/create', label: '글 작성' },
          { path: '/community/mine', label: '내 글' },
          { path: '/community/[id]', label: '글 상세' },
        ],
      },
      { path: '/reviews', label: '리뷰' },
      {
        path: '/scenarios',
        label: 'BDS 시나리오',
        children: [
          { path: '/scenarios/[id]', label: '시나리오 상세' },
          { path: '/scenarios/spaced/[groupId]', label: '간격 반복' },
        ],
      },
    ],
  },
  {
    path: '#admin',
    label: '관리자',
    icon: Settings,
    children: [
      { path: '/admin', label: '대시보드' },
      {
        path: '/admin/editor',
        label: '문제 관리',
        children: [
          { path: '/admin/editor/new', label: '문제 등록' },
          { path: '/admin/editor/[id]', label: '문제 수정' },
        ],
      },
      { path: '/admin/sitemap', label: '사이트 구조도' },
    ],
  },
];

function RouteTree({ nodes, depth = 0 }: { readonly nodes: RouteNode[]; readonly depth?: number }) {
  return (
    <ul className={depth === 0 ? 'space-y-2' : 'ml-4 mt-1 space-y-1 border-l border-gray-200 dark:border-gray-700 pl-3'}>
      {nodes.map((node) => (
        <RouteItem key={node.path} node={node} depth={depth} />
      ))}
    </ul>
  );
}

function RouteItem({ node, depth }: { readonly node: RouteNode; readonly depth: number }) {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;
  const isLink = !node.path.startsWith('#');
  const isDynamic = node.path.includes('[');
  const Icon = node.icon;

  return (
    <li>
      <div className="flex items-center gap-2 group">
        {hasChildren ? (
          <button
            onClick={() => setOpen(!open)}
            className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {open ? <ChevronDown className="h-3.5 w-3.5 text-gray-400" /> : <ChevronRight className="h-3.5 w-3.5 text-gray-400" />}
          </button>
        ) : (
          <span className="w-4" />
        )}

        {Icon && <Icon className="h-4 w-4 text-gray-500 flex-shrink-0" />}

        {isLink && !isDynamic ? (
          <Link
            href={node.path}
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            {node.label}
            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-50" />
          </Link>
        ) : (
          <span className={`text-sm font-medium ${isDynamic ? 'text-gray-500 dark:text-gray-400 italic' : 'text-gray-900 dark:text-gray-100'}`}>
            {node.label}
          </span>
        )}

        {isDynamic && (
          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-500">
            {node.path}
          </code>
        )}

        {node.note && (
          <span className="text-xs text-gray-400">{node.note}</span>
        )}
      </div>

      {hasChildren && open && <RouteTree nodes={node.children!} depth={depth + 1} />}
    </li>
  );
}

export default function SitemapPage() {
  const totalStatic = 34;
  const totalDynamic = 11;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">사이트 구조도</h1>
      <p className="text-sm text-gray-500 mb-6">
        정적 라우트 {totalStatic}개 · 동적 라우트 {totalDynamic}개 · 총 {totalStatic + totalDynamic}개 페이지
      </p>

      <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <RouteTree nodes={SITE_STRUCTURE} />
      </div>
    </div>
  );
}
