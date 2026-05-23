import type { QuizResult } from '@/types/quiz';
import type { WrongNote } from '@/types/study';
import {
  readinessMetrics,
  weakDomains,
  type ReadinessMetric,
  type ReadinessStatus,
  type WeakDomain,
} from '@/lib/sew-next/prototype-data';
import { getSubjectDisplayName } from '@/lib/study/display-labels';

export interface ReadinessSnapshot {
  heroValue: number;
  heroStatus: ReadinessStatus;
  metrics: ReadinessMetric[];
  highRiskDomains: WeakDomain[];
}

export interface BuildReadinessSnapshotInput {
  quizHistory: readonly QuizResult[];
  wrongNotes: readonly WrongNote[];
  now?: number;
}

const READINESS_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;
const TARGET_BLUEPRINT_DOMAIN_COUNT = 11;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getStatus(value: number): ReadinessStatus {
  if (value >= 78) return 'strong';
  if (value >= 60) return 'watch';
  return 'risk';
}

function groupCountBySubject(items: readonly { subject: string }[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of items) {
    counts.set(item.subject, (counts.get(item.subject) ?? 0) + 1);
  }
  return counts;
}

function buildRiskDomains(
  recentHistory: readonly QuizResult[],
  wrongNotes: readonly WrongNote[],
): WeakDomain[] {
  const activeWrongNotes = wrongNotes.filter((note) => !note.mastered);
  const source = activeWrongNotes.length > 0
    ? activeWrongNotes.map((note) => ({ subject: note.subject, chapter: note.chapter ?? '최근 오답' }))
    : recentHistory.filter((entry) => !entry.isCorrect).map((entry) => ({ subject: entry.subject, chapter: entry.chapter }));

  if (source.length === 0) return weakDomains;

  return Array.from(groupCountBySubject(source).entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([subject, count]) => ({
      domain: getSubjectDisplayName(subject),
      blueprint: source.find((entry) => entry.subject === subject)?.chapter ?? '최근 오답',
      readiness: clamp(68 - count * 9, 20, 78),
      risk: count >= 2 ? 'risk' : 'watch',
      evidence: `최근 미해결 오답 ${count}개가 남아 있습니다.`,
      prescription: '오답 재인출 3문항 + 연결 개념 1개 + 24시간 후 재점검',
    }));
}

export function buildReadinessSnapshot({
  now = Date.now(),
  quizHistory,
  wrongNotes,
}: BuildReadinessSnapshotInput): ReadinessSnapshot {
  const cutoff = now - READINESS_WINDOW_MS;
  const recentHistory = quizHistory.filter((entry) => entry.timestamp >= cutoff);

  if (recentHistory.length === 0) {
    return {
      heroValue: readinessMetrics[0].value,
      heroStatus: readinessMetrics[0].status,
      metrics: readinessMetrics,
      highRiskDomains: weakDomains,
    };
  }

  const total = recentHistory.length;
  const correct = recentHistory.filter((entry) => entry.isCorrect).length;
  const accuracy = Math.round((correct / total) * 100);
  const uniqueSubjects = new Set(recentHistory.map((entry) => entry.subject).filter(Boolean));
  const activeWrongNotes = wrongNotes.filter((note) => !note.mastered);
  const readinessValue = clamp(
    Math.round(48 + accuracy * 0.18 + Math.min(total, 20) * 1.2 + uniqueSubjects.size * 2 - activeWrongNotes.length * 0.6),
    25,
    96,
  );
  const coverageValue = clamp(Math.round((uniqueSubjects.size / TARGET_BLUEPRINT_DOMAIN_COUNT) * 100), 0, 100);
  const requiredMinutes = clamp(24 + activeWrongNotes.length * 6 + Math.max(0, 80 - readinessValue), 18, 90);
  const readinessDelta = readinessValue - readinessMetrics[0].value;

  const metrics: ReadinessMetric[] = readinessMetrics.map((metric) => {
    if (metric.label === '합격 준비도') {
      return {
        ...metric,
        value: readinessValue,
        delta: readinessDelta >= 0 ? `+${readinessDelta}` : String(readinessDelta),
        status: getStatus(readinessValue),
        note: `최근 ${total}문항 · 정답률 ${accuracy}%`,
      };
    }
    if (metric.label === '블루프린트 커버리지') {
      return {
        ...metric,
        value: coverageValue,
        delta: `${uniqueSubjects.size}/${TARGET_BLUEPRINT_DOMAIN_COUNT}`,
        status: coverageValue >= 70 ? 'strong' : coverageValue >= 35 ? 'watch' : 'risk',
        note: `최근 14일 ${uniqueSubjects.size}개 영역 노출`,
      };
    }
    if (metric.label === '고위험 단원') {
      return {
        ...metric,
        value: activeWrongNotes.length,
        delta: activeWrongNotes.length > 0 ? '집중' : 'clear',
        status: activeWrongNotes.length >= 3 ? 'risk' : activeWrongNotes.length > 0 ? 'watch' : 'strong',
        note: '미해결 오답 기준',
      };
    }
    if (metric.label === '오늘 필요 학습량') {
      return {
        ...metric,
        value: requiredMinutes,
        delta: '계산',
        status: requiredMinutes <= 35 ? 'strong' : requiredMinutes <= 55 ? 'watch' : 'risk',
        note: '정답률, 커버리지, 오답 위험도 반영',
      };
    }
    return metric;
  });

  return {
    heroValue: readinessValue,
    heroStatus: getStatus(readinessValue),
    metrics,
    highRiskDomains: buildRiskDomains(recentHistory, activeWrongNotes),
  };
}

export function readReadinessSnapshotFromLocalStorage(): ReadinessSnapshot {
  if (typeof window === 'undefined') {
    return buildReadinessSnapshot({ quizHistory: [], wrongNotes: [] });
  }

  try {
    const raw = localStorage.getItem('quiz-data');
    if (!raw) return buildReadinessSnapshot({ quizHistory: [], wrongNotes: [] });
    const parsed = JSON.parse(raw);
    const state = parsed?.state ?? {};
    return buildReadinessSnapshot({
      quizHistory: Array.isArray(state.quizHistory) ? state.quizHistory : [],
      wrongNotes: Array.isArray(state.wrongNotes) ? state.wrongNotes : [],
    });
  } catch {
    return buildReadinessSnapshot({ quizHistory: [], wrongNotes: [] });
  }
}
