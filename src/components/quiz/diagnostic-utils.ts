/**
 * DiagnosticReport 데이터 계산 유틸.
 * 컴포넌트(DiagnosticReport.tsx)와 테스트에서 공용으로 사용.
 */

import { computeSubjectStats, computeChapterStats } from '@/lib/study/stats-utils';
import { getConceptUrl } from '@/lib/content/concept-urls';
import { getChapterDisplayName, getSubjectDisplayName } from '@/lib/study/display-labels';
import type { QuizResult } from '@/types/quiz';

// ─── 마스터리 레벨 판정 (mastery.ts 의존 제거: json import 회피) ────────────

type SimpleMasteryLevel = 'not_started' | 'learning' | 'practicing' | 'proficient' | 'mastered';

interface SimpleMasteryInfo {
  readonly level: SimpleMasteryLevel;
  readonly label: string;
  readonly emoji: string;
}

const MASTERY_MAP: Record<SimpleMasteryLevel, Omit<SimpleMasteryInfo, 'level'>> = {
  not_started: { label: '미학습', emoji: '⬜' },
  learning: { label: '학습 중', emoji: '🟡' },
  practicing: { label: '연습 중', emoji: '🟠' },
  proficient: { label: '숙달', emoji: '🟢' },
  mastered: { label: '마스터', emoji: '🏆' },
};

function determineMasteryLevel(rate: number, total: number): SimpleMasteryLevel {
  if (total === 0) return 'not_started';
  if (total < 3) return 'learning';
  const accuracy = rate / 100;
  if (accuracy < 0.5) return 'learning';
  if (accuracy < 0.7) return 'practicing';
  if (accuracy < 0.9) return 'proficient';
  return 'mastered';
}

// ─── 레이더 차트 데이터 ─────────────────────────────────────────────────────

export interface RadarDatum {
  readonly label: string;
  readonly value: number; // 0~100
}

/** 과목별 정답률을 레이더 차트 데이터로 변환 */
export function buildRadarData(
  results: ReadonlyArray<QuizResult>,
  subjectMap: Readonly<Record<string, string>>,
): RadarDatum[] {
  const stats = computeSubjectStats(results as QuizResult[]);
  return stats.map((s) => ({
    label: subjectMap[s.subject] ?? s.subject,
    value: s.rate,
  }));
}

// ─── 취약 챕터 ──────────────────────────────────────────────────────────────

export interface WeakChapter {
  readonly subject: string;
  readonly chapter: string;
  readonly total: number;
  readonly correct: number;
  readonly rate: number;
  readonly masteryEmoji: string;
  readonly masteryLabel: string;
}

/** 챕터별 정답률 오름차순 정렬, TOP N개 반환 */
export function buildWeakChapters(
  results: ReadonlyArray<QuizResult>,
  topN: number,
): WeakChapter[] {
  const stats = computeChapterStats(results as QuizResult[]);
  const sorted = [...stats].sort((a, b) => a.rate - b.rate);

  return sorted.slice(0, topN).map((s) => {
    const level = determineMasteryLevel(s.rate, s.total);
    const info = MASTERY_MAP[level];
    return {
      subject: s.subject,
      chapter: s.chapter,
      total: s.total,
      correct: s.correct,
      rate: s.rate,
      masteryEmoji: info.emoji,
      masteryLabel: info.label,
    };
  });
}

// ─── 추천 학습 ──────────────────────────────────────────────────────────────

export interface Recommendation {
  readonly subject: string;
  readonly label: string;
  readonly url: string;
  readonly rate: number;
}

export interface NextActionSummary {
  readonly title: string;
  readonly body: string;
  readonly href: string;
  readonly ctaLabel: string;
}

/** 취약 과목 → 개념학습 바로가기 링크 생성 (정답률 오름차순) */
export function buildRecommendations(
  results: ReadonlyArray<QuizResult>,
  subjectMap: Readonly<Record<string, string>>,
): Recommendation[] {
  const stats = computeSubjectStats(results as QuizResult[]);
  // stats는 이미 rate 오름차순 정렬되어 있음

  return stats.map((s) => ({
    subject: s.subject,
    label: subjectMap[s.subject] ?? s.subject,
    url: getConceptUrl(s.subject),
    rate: s.rate,
  }));
}

export function buildNextActionSummary(
  results: ReadonlyArray<QuizResult>,
  subjectMap: Readonly<Record<string, string>>,
  chapterMap: Readonly<Record<string, string>> = {},
): NextActionSummary | null {
  const [weakest] = buildWeakChapters(results, 1);
  if (!weakest) return null;

  const subjectLabel = subjectMap[weakest.subject] ?? getSubjectDisplayName(weakest.subject);
  const chapterLabel = getChapterDisplayName(weakest.chapter, chapterMap);
  const emphasis = weakest.rate < 40
    ? '가장 먼저 다시 볼 영역입니다.'
    : weakest.rate < 70
      ? '한 번 더 확인하면 점수가 바로 오를 영역입니다.'
      : '마무리 복습으로 안정화하면 좋은 영역입니다.';

  return {
    title: `${subjectLabel} · ${chapterLabel}`,
    body: `${weakest.correct}/${weakest.total} 정답, 정답률 ${weakest.rate}%. ${emphasis}`,
    href: getConceptUrl(weakest.subject, weakest.chapter),
    ctaLabel: '약점 개념 보기',
  };
}
