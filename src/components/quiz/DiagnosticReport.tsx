'use client';

import Link from 'next/link';
import { RadarChart } from './RadarChart';
import {
  buildRadarData,
  buildWeakChapters,
  buildRecommendations,
} from './diagnostic-utils';
import { getConceptUrl } from '@/lib/content/concept-urls';
import type { QuizResult } from '@/types/quiz';

interface DiagnosticReportProps {
  results: ReadonlyArray<QuizResult>;
  subjectMap: Readonly<Record<string, string>>; // slug→한국어
  chapterMap?: Readonly<Record<string, string>>; // slug→한국어
}

const WEAK_TOP_N = 5;

/**
 * 진단 리포트 컴포넌트.
 * 과목별 레이더 차트 + 취약 TOP 5 + 추천 학습 경로를 표시한다.
 */
export function DiagnosticReport({
  results,
  subjectMap,
  chapterMap,
}: DiagnosticReportProps) {
  const radarData = buildRadarData(results, subjectMap);
  const weakChapters = buildWeakChapters(results, WEAK_TOP_N);
  const recommendations = buildRecommendations(results, subjectMap);

  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        진단 결과가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-8 mt-8">
      {/* ─── 진단 결과: 레이더 차트 ───────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-bold text-foreground mb-4">
          📊 진단 결과
        </h2>
        <div className="bg-card rounded-xl border p-6">
          {radarData.length > 0 ? (
            <RadarChart data={radarData} size={300} />
          ) : (
            <p className="text-center text-muted-foreground text-sm">
              과목별 데이터가 부족합니다.
            </p>
          )}
        </div>
      </section>

      {/* ─── 취약 영역 TOP 5 ──────────────────────────────────────────────── */}
      {weakChapters.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">
            ⚠️ 취약 영역 TOP {Math.min(WEAK_TOP_N, weakChapters.length)}
          </h2>
          <div className="space-y-2">
            {weakChapters.map((wc, i) => {
              const chapterLabel = chapterMap?.[wc.chapter] ?? wc.chapter;
              const subjectLabel = subjectMap[wc.subject] ?? wc.subject;
              const chapterUrl = getConceptUrl(wc.subject, wc.chapter);
              return (
                <Link
                  key={`${wc.subject}-${wc.chapter}`}
                  href={chapterUrl}
                  className="flex items-center gap-3 bg-card rounded-lg border px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-lg font-bold text-muted-foreground w-6 text-center">
                    {i + 1}
                  </span>
                  <span className="text-lg" title={wc.masteryLabel}>
                    {wc.masteryEmoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {chapterLabel}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {subjectLabel} · {wc.correct}/{wc.total} 정답
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-bold ${
                        wc.rate >= 70
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : wc.rate >= 40
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {wc.rate}%
                    </span>
                    <span className="text-muted-foreground text-sm">→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ─── 추천 학습 ────────────────────────────────────────────────────── */}
      {recommendations.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">
            📚 추천 학습
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {recommendations.map((rec) => (
              <Link
                key={rec.subject}
                href={rec.url}
                className="flex items-center gap-3 bg-card rounded-lg border px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <span className="text-primary text-lg">📖</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {rec.label} 개념학습
                  </p>
                  <p className="text-xs text-muted-foreground">
                    정답률 {rec.rate}%
                  </p>
                </div>
                <span className="text-muted-foreground text-sm">→</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
