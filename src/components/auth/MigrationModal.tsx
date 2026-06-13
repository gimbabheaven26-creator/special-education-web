'use client';

/**
 * MigrationModal
 *
 * 로그인 직후, localStorage에 학습 데이터(XP > 0 또는 오답노트)가 있으면 표시.
 * "저장하기" → migrateGuestData(userId) 후 migrated 플래그 설정 → 모달 닫기
 * "저장 안 함" → 모달 닫기
 * 이미 마이그레이션한 유저는 재표시 안 함 (localStorage "sew-migrated" 플래그)
 */

import { useState } from 'react';
import { CloudUpload, X } from 'lucide-react';
import { migrateGuestData, STORE_LS_KEYS } from '@/lib/db/sync';

const MIGRATED_KEY = 'sew-migrated';

interface MigrationModalProps {
  userId: string;
  onClose: () => void;
}

export function MigrationModal({ userId, onClose }: MigrationModalProps) {
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      await migrateGuestData(userId);
      localStorage.setItem(MIGRATED_KEY, '1');
    } catch {
      // migration failure is non-critical
    } finally {
      setLoading(false);
      onClose();
    }
  }

  function handleSkip() {
    localStorage.setItem(MIGRATED_KEY, '1');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={handleSkip} />

      {/* Modal */}
      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-xl">
        <button
          onClick={handleSkip}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="닫기"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 mb-4">
          <CloudUpload className="h-6 w-6 text-primary" />
        </div>

        <h2 className="text-base font-semibold text-foreground mb-1">
          이전에 학습한 데이터가 있습니다
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          이 기기에 저장된 학습 기록, 오답노트, 플래시카드를 계정에 저장하시겠습니까?
        </p>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {loading ? '저장 중...' : '저장하기'}
          </button>
          <button
            onClick={handleSkip}
            className="w-full py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"
          >
            저장 안 함
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 로그인 성공 직후 마이그레이션 필요 여부 판단.
 * XP > 0 또는 오답노트 개수 > 0이고, 이미 migrated 아닌 경우 true 반환.
 */
export function shouldShowMigration(): boolean {
  if (typeof window === 'undefined') return false;
  if (localStorage.getItem(MIGRATED_KEY)) return false;

  // Check Zustand store state from localStorage.
  // 키는 STORE_LS_KEYS 단일 소스에서 가져온다 (이전엔 '*-store' 오타로 항상 false였음).
  try {
    const studyRaw = localStorage.getItem(STORE_LS_KEYS.study);
    const quizRaw = localStorage.getItem(STORE_LS_KEYS.quiz);

    let hasStudyData = false;
    let hasWrongNotes = false;

    if (studyRaw) {
      const parsed = JSON.parse(studyRaw) as { state?: { totalXP?: number } };
      hasStudyData = (parsed?.state?.totalXP ?? 0) > 0;
    }
    if (quizRaw) {
      const parsed = JSON.parse(quizRaw) as { state?: { wrongNotes?: unknown[] } };
      hasWrongNotes = (parsed?.state?.wrongNotes?.length ?? 0) > 0;
    }

    return hasStudyData || hasWrongNotes;
  } catch {
    return false;
  }
}
