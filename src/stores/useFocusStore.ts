import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DailyMission } from '@/types/study';
import { getKSTDate } from '@/lib/date-utils';

interface FocusState {
  focusSubject: string | null;
  focusSetAt: number | null;
  focusExpiresAt: number | null;
  focusMode: 'system' | 'user' | 'off';
  todayMission: DailyMission | null;
}

interface FocusActions {
  setFocus: (slug: string, hours?: number) => void;
  clearFocus: () => void;
  setTodayMission: (mission: DailyMission) => void;
  completeMissionBlock: (blockId: string) => void;
  isFocusExpired: () => boolean;
}

const DEFAULT_FOCUS_HOURS = 6;

export const useFocusStore = create<FocusState & FocusActions>()(
  persist(
    (set, get) => ({
      focusSubject: null,
      focusSetAt: null,
      focusExpiresAt: null,
      focusMode: 'off',
      todayMission: null,

      setFocus: (slug, hours = DEFAULT_FOCUS_HOURS) => {
        const now = Date.now();
        set({
          focusSubject: slug,
          focusSetAt: now,
          focusExpiresAt: now + hours * 60 * 60 * 1000,
          focusMode: 'user',
        });
      },

      clearFocus: () =>
        set({
          focusSubject: null,
          focusSetAt: null,
          focusExpiresAt: null,
          focusMode: 'off',
        }),

      setTodayMission: (mission) => set({ todayMission: mission }),

      completeMissionBlock: (blockId) =>
        set((state) => {
          if (!state.todayMission) return state;
          return {
            todayMission: {
              ...state.todayMission,
              blocks: state.todayMission.blocks.map((b) =>
                b.id === blockId ? { ...b, completed: true } : b
              ),
            },
          };
        }),

      isFocusExpired: () => {
        const { focusExpiresAt } = get();
        if (!focusExpiresAt) return false;
        return Date.now() > focusExpiresAt;
      },
    }),
    {
      name: 'focus-store',
      version: 1,
      partialize: (state) => ({
        focusSubject: state.focusSubject,
        focusSetAt: state.focusSetAt,
        focusExpiresAt: state.focusExpiresAt,
        focusMode: state.focusMode,
        todayMission: state.todayMission,
      }),
    }
  )
);

/** 오늘 미션이 최신인지 확인 */
export function isMissionStale(mission: DailyMission | null): boolean {
  if (!mission) return true;
  return mission.date !== getKSTDate();
}
