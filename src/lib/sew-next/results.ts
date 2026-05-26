import { getChapterDisplayName, getSubjectDisplayName } from '@/lib/study/display-labels';
import type { QuizResult } from '@/types/quiz';

export interface SewNextSessionSummary {
  title: string;
  mode: string;
  href: string;
  total: number;
  correct: number;
  rate: number;
  subject: string;
  chapter: string;
  timestamp: number;
}

export interface SewNextNextAction {
  href: string;
  message: string;
}

export interface SewNextRouteInfo {
  title: string;
  mode: string;
  href: string;
}

export interface MockExamPaperTrend {
  label: string;
  period: string;
  total: number;
  correct: number;
  rate: number;
  possiblePoints: number;
  earnedPoints: number;
  fullCount: number;
  weakestFormat: string;
  actionHref: string;
  prescription: string;
}

type MockExamPaperTrendAccumulator = Omit<MockExamPaperTrend, 'rate' | 'weakestFormat' | 'actionHref' | 'prescription'> & {
  formatMisses: Record<string, number>;
};

const SEW_NEXT_SESSION_WINDOW_MS = 30 * 60 * 1000;

export function buildMockExamFollowUpHref(label: string, format: string): string {
  const params = new URLSearchParams({
    mode: 'mock',
    variant: 'full',
    paper: label,
    focus: format,
  });
  return `/next/practice?${params.toString()}`;
}

export const MOCK_EXAM_PREVIEW_TRENDS: MockExamPaperTrend[] = [
  {
    label: '전공A',
    period: '2교시',
    total: 12,
    correct: 8,
    rate: 67,
    possiblePoints: 40,
    earnedPoints: 27,
    fullCount: 0,
    weakestFormat: '서술형',
    actionHref: buildMockExamFollowUpHref('전공A', '서술형'),
    prescription: '전공A 2교시: 단답형은 빠르게 통과하고 서술형 근거 문장을 2개씩 고정하세요.',
  },
  {
    label: '전공B',
    period: '3교시',
    total: 11,
    correct: 7,
    rate: 64,
    possiblePoints: 40,
    earnedPoints: 25,
    fullCount: 0,
    weakestFormat: '사례 적용형',
    actionHref: buildMockExamFollowUpHref('전공B', '사례 적용형'),
    prescription: '전공B 3교시: 사례 적용형에서 조건, 절차, 근거를 분리해 다시 풀어 보세요.',
  },
];

export function getSewNextRouteInfo(sessionId: string): SewNextRouteInfo {
  const mode = sessionId.replace(/^sew-next-/, '');
  if (mode === 'adaptive') {
    return { title: 'Adaptive Readiness', mode, href: '/next/practice?mode=adaptive' };
  }
  if (mode === 'custom') {
    return { title: 'Custom Qbank', mode, href: '/next/practice?mode=custom' };
  }
  if (mode === 'mock') {
    return { title: 'Mock Exam', mode, href: '/next/practice?mode=mock' };
  }
  if (mode === 'mock-full') {
    return { title: 'Full Mock Exam', mode: 'mock', href: '/next/practice?mode=mock&variant=full' };
  }
  if (mode === 'review') {
    return { title: 'Spaced Review', mode, href: '/next/practice?mode=review' };
  }
  return { title: 'SEW Next', mode: mode || 'adaptive', href: '/next/practice?mode=adaptive' };
}

export function getRecentSewNextSessions(quizHistory: readonly QuizResult[]): SewNextSessionSummary[] {
  const ordered = [...quizHistory]
    .filter((result) => result.sessionId?.startsWith('sew-next-'))
    .sort((a, b) => a.timestamp - b.timestamp);
  const grouped: QuizResult[][] = [];

  for (const result of ordered) {
    const currentGroup = grouped[grouped.length - 1];
    const previous = currentGroup?.[currentGroup.length - 1];
    const belongsToCurrentGroup = previous?.sessionId === result.sessionId
      && result.timestamp - previous.timestamp <= SEW_NEXT_SESSION_WINDOW_MS;

    if (belongsToCurrentGroup) {
      currentGroup.push(result);
    } else {
      grouped.push([result]);
    }
  }

  return grouped
    .map((sessionResults) => {
      const latest = sessionResults[sessionResults.length - 1];
      const correct = sessionResults.filter((result) => result.isCorrect).length;
      const route = getSewNextRouteInfo(latest.sessionId ?? '');

      return {
        title: route.title,
        mode: route.mode,
        href: route.href,
        total: sessionResults.length,
        correct,
        rate: Math.round((correct / sessionResults.length) * 100),
        subject: latest.subject,
        chapter: latest.chapter,
        timestamp: latest.timestamp,
      };
    })
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 3);
}

export function buildMockExamPaperTrends(quizHistory: readonly QuizResult[]): MockExamPaperTrend[] {
  const rows = new Map<string, MockExamPaperTrendAccumulator>();

  for (const result of quizHistory) {
    if (!result.sessionId?.startsWith('sew-next-mock') || !result.sewNextExamMeta) continue;

    const meta = result.sewNextExamMeta;
    const current = rows.get(meta.paperLabel) ?? {
      label: meta.paperLabel,
      period: meta.period,
      total: 0,
      correct: 0,
      possiblePoints: 0,
      earnedPoints: 0,
      fullCount: 0,
      formatMisses: {},
    };

    rows.set(meta.paperLabel, {
      ...current,
      total: current.total + 1,
      correct: current.correct + (result.isCorrect ? 1 : 0),
      possiblePoints: current.possiblePoints + meta.points,
      earnedPoints: current.earnedPoints + (result.isCorrect ? meta.points : 0),
      fullCount: current.fullCount + (meta.mockVariant === 'full' ? 1 : 0),
      formatMisses: result.isCorrect
        ? current.formatMisses
        : {
            ...current.formatMisses,
            [meta.format]: (current.formatMisses[meta.format] ?? 0) + 1,
          },
    });
  }

  return Array.from(rows.values())
    .map((row) => {
      const rate = row.total > 0 ? Math.round((row.correct / row.total) * 100) : 0;
      const weakestFormat = Object.entries(row.formatMisses)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ko'))[0]?.[0] ?? '서술형';
      return {
        ...row,
        rate,
        weakestFormat,
        actionHref: buildMockExamFollowUpHref(row.label, weakestFormat),
        prescription: rate >= 80
          ? `${row.label} ${row.period}: 현재 흐름을 유지하고 실전형에서 시간 배분을 확인하세요.`
          : `${row.label} ${row.period}: ${weakestFormat} 2문항을 실전형으로 이어 풀어 보세요.`,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label, 'ko'));
}

export function buildSewNextNextAction(sessions: readonly SewNextSessionSummary[]): SewNextNextAction | null {
  if (sessions.length < 2) return null;

  const weakest = [...sessions].sort((a, b) => a.rate - b.rate || b.timestamp - a.timestamp)[0];
  if (!weakest) return null;

  const subject = getSubjectDisplayName(weakest.subject);
  const chapter = getChapterDisplayName(weakest.chapter);
  return {
    href: weakest.href,
    message: `${subject} ${chapter}을 2문항만 더 풀어 보세요.`,
  };
}
