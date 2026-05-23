import { pushToServer, serializeState } from '@/lib/db/sync';
import { createClient } from '@/lib/supabase/browser';

export type SewNextSyncStatus = 'idle' | 'syncing' | 'guest' | 'synced' | 'partial' | 'error';

export interface SewNextSessionSyncResult {
  status: Exclude<SewNextSyncStatus, 'idle' | 'syncing'>;
  syncedAt?: string;
}

export async function pushSewNextSessionSnapshot({
  studyState,
  quizState,
}: {
  studyState: Record<string, unknown>;
  quizState: Record<string, unknown>;
}): Promise<SewNextSessionSyncResult> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { status: 'guest' };
    }

    const [studyResult, quizResult] = await Promise.all([
      pushToServer(user.id, 'study', serializeState(studyState)),
      pushToServer(user.id, 'quiz', serializeState(quizState)),
    ]);
    const results = [studyResult, quizResult];

    if (results.every((result) => result === 'pushed' || result === 'skipped')) {
      return { status: 'synced', syncedAt: new Date().toISOString() };
    }

    if (results.some((result) => result === 'pushed' || result === 'skipped')) {
      return { status: 'partial', syncedAt: new Date().toISOString() };
    }

    return { status: 'error' };
  } catch {
    return { status: 'error' };
  }
}
