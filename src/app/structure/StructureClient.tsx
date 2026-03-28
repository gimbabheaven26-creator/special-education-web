'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { SubjectStat } from './page';
import {
  Home,
  CalendarDays,
  BookOpen,
  FileQuestion,
  GraduationCap,
  Layers,
  AlertCircle,
  Bookmark,
  BarChart2,
  Brain,
  Users,
  Play,
  Map,
  User,
  LogIn,
  Settings,
  Database,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface PageNode {
  title: string;
  path: string;
  desc: string;
  icon: React.ElementType;
  children?: Omit<PageNode, 'children'>[];
}

interface SiteGroup {
  title: string;
  color: string;
  iconColor: string;
  pages: PageNode[];
}

const SITE_MAP: SiteGroup[] = [
  {
    title: '메인',
    color: 'border-blue-200 dark:border-blue-900/50',
    iconColor: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30',
    pages: [
      {
        title: '홈',
        path: '/',
        desc: '오늘의 문제 · 스트릭 · 복습 카드',
        icon: Home,
        children: [
          { title: '일일 학습', path: '/daily', desc: 'OX 10 + 단답 5 + 서술 3', icon: CalendarDays },
          { title: '용어사전', path: '/terms', desc: 'NISE 1,100여 개 용어', icon: BookOpen },
        ],
      },
    ],
  },
  {
    title: '과목 학습',
    color: 'border-indigo-200 dark:border-indigo-900/50',
    iconColor: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30',
    pages: [
      {
        title: '과목 목록',
        path: '/subjects',
        desc: '11개 과목 · 39개 챕터',
        icon: BookOpen,
        children: [
          { title: '과목 페이지', path: '/subjects/[slug]', desc: '챕터 목록 + 학습 경로', icon: BookOpen },
          { title: '챕터 학습', path: '/subjects/[slug]/[chapter]', desc: '퀴즈 · 플래시카드 · 워크시트', icon: GraduationCap },
        ],
      },
      {
        title: '퀴즈',
        path: '/quiz',
        desc: 'OX · 기입 · 서술 · 시나리오형',
        icon: FileQuestion,
      },
      {
        title: '워크시트',
        path: '/worksheets',
        desc: '단원별 종합 문제지',
        icon: FileQuestion,
        children: [
          { title: '워크시트 풀기', path: '/worksheets/[id]', desc: '문제 풀기 + 채점', icon: FileQuestion },
          { title: '워크시트 정답', path: '/worksheets/[id]/answers', desc: '해설 보기', icon: FileQuestion },
        ],
      },
    ],
  },
  {
    title: 'KICE 기출',
    color: 'border-amber-200 dark:border-amber-900/50',
    iconColor: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30',
    pages: [
      {
        title: 'KICE 허브',
        path: '/kice',
        desc: '연도별 · 영역별 기출 브라우저',
        icon: GraduationCap,
        children: [
          { title: '모의고사 모드', path: '/kice/exam', desc: '타이머 + 자동채점', icon: Play },
          { title: '출제 경향 분석', path: '/kice/analytics', desc: '히트맵 + 연속출제 키워드', icon: BarChart2 },
        ],
      },
    ],
  },
  {
    title: '학습 도구',
    color: 'border-purple-200 dark:border-purple-900/50',
    iconColor: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30',
    pages: [
      { title: '플래시카드', path: '/flashcards', desc: '플래시카드 간격 반복', icon: Layers },
      {
        title: '오답노트',
        path: '/wrong-notes',
        desc: '틀린 문제 집중 복습',
        icon: AlertCircle,
        children: [
          { title: '오답 퀴즈', path: '/wrong-notes/quiz', desc: '오답만 모아서 다시 풀기', icon: FileQuestion },
        ],
      },
      { title: '북마크', path: '/bookmarks', desc: '저장한 문제·용어 모아보기', icon: Bookmark },
      { title: '학습 통계', path: '/stats', desc: '히트맵 · 주간 추이 · 취약 영역', icon: BarChart2 },
      { title: '마스터리 트리', path: '/mastery', desc: '챕터별 숙련도 + 합격 시뮬레이션', icon: Brain },
    ],
  },
  {
    title: '커뮤니티',
    color: 'border-green-200 dark:border-green-900/50',
    iconColor: 'text-green-500 bg-green-50 dark:bg-green-950/30',
    pages: [
      {
        title: '커뮤니티',
        path: '/community',
        desc: '수험생 제작 문제 갤러리',
        icon: Users,
        children: [
          { title: '문제 만들기', path: '/community/create', desc: '4단계 위저드 출제 도구', icon: FileQuestion },
          { title: '문제 풀기', path: '/community/[id]', desc: '풀기 · 투표 · 해설', icon: Play },
        ],
      },
    ],
  },
  {
    title: '시뮬레이터',
    color: 'border-rose-200 dark:border-rose-900/50',
    iconColor: 'text-rose-500 bg-rose-50 dark:bg-rose-950/30',
    pages: [
      {
        title: '행동 시뮬레이터',
        path: '/scenarios',
        desc: 'FBA·PBS·통합교육 의사결정',
        icon: Play,
        children: [
          { title: '개별 시나리오', path: '/scenarios/[id]', desc: '단계별 선택지 + 피드백', icon: Play },
          { title: '스페이스드 그룹', path: '/scenarios/groups/[id]', desc: '간격 반복 시나리오', icon: Layers },
        ],
      },
    ],
  },
  {
    title: '계정',
    color: 'border-slate-200 dark:border-slate-800',
    iconColor: 'text-slate-500 bg-slate-50 dark:bg-slate-950/30',
    pages: [
      { title: '마이페이지', path: '/my', desc: '프로필 · 학습 현황 · 관리자', icon: User },
      { title: '로그인', path: '/login', desc: '이메일 · Google · Kakao OAuth', icon: LogIn },
      { title: '인증 콜백', path: '/auth/callback', desc: 'OAuth 세션 처리 (자동)', icon: Settings },
    ],
  },
  {
    title: '관리자',
    color: 'border-zinc-200 dark:border-zinc-800',
    iconColor: 'text-zinc-500 bg-zinc-50 dark:bg-zinc-950/30',
    pages: [
      { title: '사이트맵', path: '/structure', desc: '전체 페이지 구조 (현재 페이지)', icon: Map },
    ],
  },
];

export default function StructureClient({ dbStats }: { dbStats: SubjectStat[] }) {
  const [tab, setTab] = useState<'sitemap' | 'data'>('sitemap');

  const totalPages = SITE_MAP.reduce(
    (acc, g) =>
      acc +
      g.pages.reduce((a, p) => a + 1 + (p.children?.length ?? 0), 0),
    0,
  );
  const totalQuestions = dbStats.reduce((a, s) => a + s.total, 0);
  const totalChapters = dbStats.reduce((a, s) => a + s.chapters, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
          <Map className="h-6 w-6 text-primary" />
          사이트 구조도
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          관리자 전용 · 전체 현황
        </p>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
        <button
          onClick={() => setTab('sitemap')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
            tab === 'sitemap' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Map className="h-3.5 w-3.5" />
          사이트맵
        </button>
        <button
          onClick={() => setTab('data')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
            tab === 'data' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Database className="h-3.5 w-3.5" />
          데이터 현황
        </button>
      </div>

      {/* 데이터 현황 탭 */}
      {tab === 'data' && (
        <div className="space-y-4">
          {/* 요약 수치 */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: '과목', value: dbStats.length },
              { label: '챕터', value: totalChapters },
              { label: '총 문제', value: totalQuestions.toLocaleString() },
            ].map(({ label, value }) => (
              <div key={label} className="p-4 rounded-xl border border-border bg-card text-center">
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* 과목별 테이블 */}
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">과목</th>
                  <th className="text-center px-3 py-2.5 font-medium text-muted-foreground">챕터</th>
                  <th className="text-center px-3 py-2.5 font-medium text-muted-foreground">OX</th>
                  <th className="text-center px-3 py-2.5 font-medium text-muted-foreground">단답</th>
                  <th className="text-center px-3 py-2.5 font-medium text-muted-foreground">서술</th>
                  <th className="text-center px-3 py-2.5 font-medium text-foreground">합계</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dbStats.map((s) => (
                  <tr key={s.slug} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-foreground">{s.title}</td>
                    <td className="px-3 py-2.5 text-center text-muted-foreground">{s.chapters}</td>
                    <td className="px-3 py-2.5 text-center text-blue-600 dark:text-blue-400">{s.ox}</td>
                    <td className="px-3 py-2.5 text-center text-green-600 dark:text-green-400">{s.fill_in}</td>
                    <td className="px-3 py-2.5 text-center text-purple-600 dark:text-purple-400">{s.descriptive}</td>
                    <td className="px-3 py-2.5 text-center font-semibold text-foreground">{s.total}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted/30 border-t-2 border-border">
                <tr>
                  <td className="px-4 py-2.5 font-bold text-foreground">합계</td>
                  <td className="px-3 py-2.5 text-center font-bold">{totalChapters}</td>
                  <td className="px-3 py-2.5 text-center font-bold text-blue-600 dark:text-blue-400">{dbStats.reduce((a,s)=>a+s.ox,0)}</td>
                  <td className="px-3 py-2.5 text-center font-bold text-green-600 dark:text-green-400">{dbStats.reduce((a,s)=>a+s.fill_in,0)}</td>
                  <td className="px-3 py-2.5 text-center font-bold text-purple-600 dark:text-purple-400">{dbStats.reduce((a,s)=>a+s.descriptive,0)}</td>
                  <td className="px-3 py-2.5 text-center font-bold text-foreground">{totalQuestions.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* 사이트맵 탭 */}
      {tab === 'sitemap' && (
        <>
          <p className="text-sm text-muted-foreground -mt-2">전체 {totalPages}개 페이지 · {SITE_MAP.length}개 카테고리</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SITE_MAP.map((group) => (
          <section
            key={group.title}
            className={`rounded-2xl border-2 ${group.color} bg-card overflow-hidden`}
          >
            <div className="px-4 py-3 border-b border-border/50 bg-muted/30">
              <h2 className="text-sm font-semibold text-foreground">{group.title}</h2>
            </div>
            <div className="p-3 space-y-1">
              {group.pages.map((page) => (
                <div key={page.path}>
                  <PageRow page={page} iconColor={group.iconColor} isRoot />
                  {page.children && page.children.length > 0 && (
                    <div className="ml-6 mt-1 space-y-1 border-l-2 border-border/50 pl-3">
                      {page.children.map((child) => (
                        <PageRow key={child.path} page={child} iconColor={group.iconColor} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-4 border-t border-border">
        <span className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3" />
          루트 페이지
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-0.5 bg-border" />
          하위 페이지
        </span>
        <span className="flex items-center gap-1">
          <span className="font-mono bg-muted px-1 rounded text-[10px]">[slug]</span>
          동적 경로
        </span>
      </div>
        </>
      )}
    </div>
  );
}

function PageRow({
  page,
  iconColor,
  isRoot = false,
}: {
  page: Omit<PageNode, 'children'>;
  iconColor: string;
  isRoot?: boolean;
}) {
  const isDynamic = page.path.includes('[');

  return (
    <div className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 group hover:bg-muted/50 transition-colors ${isRoot ? '' : ''}`}>
      <div className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center ${iconColor}`}>
        <page.icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-medium text-foreground ${isRoot ? '' : 'font-normal'}`}>
            {page.title}
          </span>
          <span className={`font-mono text-[10px] px-1 rounded ${isDynamic ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400' : 'bg-muted text-muted-foreground'}`}>
            {page.path}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 line-clamp-1">
          {page.desc}
        </p>
      </div>
      {!isDynamic && (
        <Link
          href={page.path}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary shrink-0"
          title={`${page.title} 열기`}
        >
          <ExternalLink className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}
