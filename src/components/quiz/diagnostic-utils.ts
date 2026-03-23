/**
 * DiagnosticReport 데이터 계산 유틸.
 * 컴포넌트(DiagnosticReport.tsx)와 테스트에서 공용으로 사용.
 */

import { computeSubjectStats, computeChapterStats } from '@/lib/stats-utils';
import { getConceptUrl } from '@/lib/concept-urls';
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
