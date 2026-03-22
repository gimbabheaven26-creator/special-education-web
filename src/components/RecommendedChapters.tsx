'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { useQuizStore } from '@/stores/useQuizStore';
import { getChapterProficiency } from '@/lib/adaptive-difficulty';

export function RecommendedChapters() {
  const quizHistory = useQuizStore((s) => s.quizHistory);
  const wrongNotes = useQuizStore((s) => s.wrongNotes);

  const recommendations = useMemo(() => {
    if (quizHistory.length === 0) return [];

    // quizHistory에서 questionId→chapter 역방향 조회
    const qIdToInfo = new Map<string, { subject: string; chapter: string }>();
    for (const r of quizHistory) {
      if (!qIdToInfo.has(r.questionId)) {
        qIdToInfo.set(r.questionId, { subject: r.subject, chapter: r.chapter });
      }
    }

    // 챕터별 오답 카운트
    const wrongMap = new Map<string, number>();
    for (const note of wrongNotes.filter((n) => !n.mastered)) {
      const info = qIdToInfo.get(note.questionId);
      if (!info) continue;
      const key = `${info.subject}::${info.chapter}`;
      wrongMap.set(key, (wrongMap.get(key) ?? 0) + note.attempts);
    }

    // 학습한 챕터 유니크 목록
    const chapterSet = new Map<string, { subject: string; chapter: string }>();
    for (const r of quizHistory) {
      const key = `${r.subject}::${r.chapter}`;
      if (!chapterSet.has(key)) chapterSet.set(key, { subject: r.subject, chapter: r.chapter });
    }

    // 숙련도 낮은 챕터 + 오답 많은 챕터 우선 추천
    const scored = Array.from(chapterSet.values()).map(({ subject, chapter }) => {
      const prof = getChapterProficiency(chapter, quizHistory);
      const wrongCount = wrongMap.get(`${subject}::${chapter}`) ?? 0;
      // 낮은 accuracy + 많은 오답 = 높은 priority score
      const priorityScore = (1 - prof.accuracy) * 100 + wrongCount * 5;
      return { subject, chapter, accuracy: prof.accuracy, priorityScore };
    });

    return scored.sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 3);
  }, [quizHistory, wrongNotes]);

  if (recommendations.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">오늘 추천 챕터</span>
      </div>
      <div className="space-y-2">
        {recommendations.map(({ subject, chapter, accuracy }) => (
          <Link
            key={`${subject}::${chapter}`}
            href={`/quiz/${subject}`}
            className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                {subject}
              </span>
              <span className="text-sm font-medium truncate">{chapter}</span>
            </div>
            <span className={`text-xs font-semibold shrink-0 ml-2 ${
              accuracy < 0.5 ? 'text-red-500' : accuracy < 0.7 ? 'text-amber-500' : 'text-green-500'
            }`}>
              {Math.round(accuracy * 100)}%
            </span>
          </Link>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">정답률 기반 우선 추천</p>
    </div>
  );
}
