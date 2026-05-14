'use client';

import { useEffect, useState, useCallback } from 'react';
import { Target, RefreshCw, ChevronDown } from 'lucide-react';
import { useFocusStore } from '@/stores/useFocusStore';
import { useMounted } from '@/hooks/useMounted';
import { pickWeakestSubject } from '@/lib/study/focus-utils';
import { useStudyStore } from '@/stores/useStudyStore';
import { getAllSubjectSlugs } from '@/lib/study/study-planner';
import { getSubjectDisplayName } from '@/lib/study/display-labels';

const ALL_SLUGS = getAllSubjectSlugs();

export function FocusBanner() {
  const mounted = useMounted();
  const focusSubject = useFocusStore((s) => s.focusSubject);
  const focusExpiresAt = useFocusStore((s) => s.focusExpiresAt);
  const setFocus = useFocusStore((s) => s.setFocus);
  const clearFocus = useFocusStore((s) => s.clearFocus);
  const isFocusExpired = useFocusStore((s) => s.isFocusExpired);
  const dailyHistory = useStudyStore((s) => s.dailyHistory);
  const [showPicker, setShowPicker] = useState(false);
  const [remainingLabel, setRemainingLabel] = useState('');

  const autoSelect = useCallback(() => {
    const stats = ALL_SLUGS.map((slug) => {
      const entries = dailyHistory.filter(
        (e) => 'subjectSlug' in e && (e as Record<string, unknown>).subjectSlug === slug
      );
      const attempted = entries.reduce((s, e) => s + e.questionsAttempted, 0);
      const correct = entries.reduce((s, e) => s + e.questionsCorrect, 0);
      return { slug, attempted, correct, totalQuestions: 100 };
    });
    const weakest = pickWeakestSubject(stats, ALL_SLUGS);
    if (weakest) {
      setFocus(weakest);
    }
  }, [dailyHistory, setFocus]);

  useEffect(() => {
    if (!mounted) return;
    if (!focusSubject || isFocusExpired()) {
      autoSelect();
    }
  }, [mounted, focusSubject, isFocusExpired, autoSelect]);

  useEffect(() => {
    if (!focusExpiresAt) return;
    const update = () => {
      const diff = focusExpiresAt - Date.now();
      if (diff <= 0) {
        setRemainingLabel('만료됨');
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setRemainingLabel(h > 0 ? h + '시간 ' + m + '분 남음' : m + '분 남음');
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [focusExpiresAt]);

  if (!mounted || !focusSubject) {
    return <div className="h-14 rounded-xl bg-card animate-pulse" />;
  }

  const label = getSubjectDisplayName(focusSubject);

  return (
    <div className="relative rounded-xl border border-primary/20 bg-primary/5 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            오늘 집중: {label}
          </span>
          <span className="text-xs text-muted-foreground">{remainingLabel}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={autoSelect}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            aria-label="집중 과목 자동 변경"
          >
            <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            aria-label="집중 과목 선택"
          >
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {showPicker && (
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {ALL_SLUGS.map((slug) => (
            <button
              key={slug}
              onClick={() => {
                setFocus(slug);
                setShowPicker(false);
              }}
              className={
                'text-xs px-2 py-1.5 rounded-lg text-left transition-colors ' +
                (slug === focusSubject
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 hover:bg-muted text-foreground')
              }
            >
              {getSubjectDisplayName(slug)}
            </button>
          ))}
          <button
            onClick={() => {
              clearFocus();
              setShowPicker(false);
            }}
            className="text-xs px-2 py-1.5 rounded-lg text-left bg-muted/50 hover:bg-muted text-muted-foreground col-span-2"
          >
            집중 모드 끄기
          </button>
        </div>
      )}
    </div>
  );
}
