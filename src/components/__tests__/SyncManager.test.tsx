import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('@/lib/supabase/browser', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/lib/db/sync', () => ({
  pushToServer: vi.fn().mockResolvedValue('pushed'),
  pullFromServer: vi.fn().mockResolvedValue(null),
  serializeState: vi.fn((s: Record<string, unknown>) => s),
  syncAllStores: vi.fn(),
}));

import { createClient } from '@/lib/supabase/browser';
import { syncAllStores } from '@/lib/db/sync';
import { SyncManager } from '../SyncManager';

const mockedCreateClient = vi.mocked(createClient);
const mockedSyncAllStores = vi.mocked(syncAllStores);

type AuthCallback = (event: string, session: { user: { id: string } } | null) => void;

/** onAuthStateChange 콜백을 캡처하는 mock Supabase auth */
function makeAuthSupabase() {
  let authCallback: AuthCallback = () => {};
  const sb = {
    auth: {
      // 초기 마운트에서는 비로그인 — 동기화는 SIGNED_IN 이벤트로만 트리거
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      onAuthStateChange: vi.fn((cb: AuthCallback) => {
        authCallback = cb;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      }),
    },
    fireAuth: (event: string, session: { user: { id: string } } | null) => authCallback(event, session),
  };
  return sb;
}

describe('SyncManager — syncOnLogin 뮤텍스 (V 권고 회귀)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('동기화 진행 중 SIGNED_IN이 연속 발생해도 syncAllStores는 1회만 호출된다', async () => {
    const sb = makeAuthSupabase();
    mockedCreateClient.mockReturnValue(sb as never);

    // syncAllStores를 수동 resolve 가능한 pending 상태로 유지
    let resolveSync: () => void = () => {};
    mockedSyncAllStores.mockImplementation(
      () => new Promise<void>((resolve) => { resolveSync = resolve; }),
    );

    render(<SyncManager />);
    await act(async () => {});

    // 첫 동기화가 in-flight인 동안 같은 이벤트가 연속 도착 (탭 복귀, 토큰 갱신 등)
    await act(async () => {
      sb.fireAuth('SIGNED_IN', { user: { id: 'user-1' } });
      sb.fireAuth('SIGNED_IN', { user: { id: 'user-1' } });
      sb.fireAuth('SIGNED_IN', { user: { id: 'user-1' } });
    });

    expect(mockedSyncAllStores).toHaveBeenCalledTimes(1);

    // 동기화 완료 후 같은 userId 재이벤트도 중복 동기화하지 않음
    await act(async () => { resolveSync(); });
    await act(async () => {
      sb.fireAuth('SIGNED_IN', { user: { id: 'user-1' } });
    });
    expect(mockedSyncAllStores).toHaveBeenCalledTimes(1);
  });

  it('다른 사용자로 로그인하면 새 동기화가 실행된다 (뮤텍스 과차단 방지)', async () => {
    const sb = makeAuthSupabase();
    mockedCreateClient.mockReturnValue(sb as never);
    mockedSyncAllStores.mockResolvedValue(undefined);

    render(<SyncManager />);
    await act(async () => {});

    await act(async () => {
      sb.fireAuth('SIGNED_IN', { user: { id: 'user-1' } });
    });
    await act(async () => {
      sb.fireAuth('SIGNED_OUT', null);
    });
    await act(async () => {
      sb.fireAuth('SIGNED_IN', { user: { id: 'user-2' } });
    });

    expect(mockedSyncAllStores).toHaveBeenCalledTimes(2);
    expect(mockedSyncAllStores).toHaveBeenNthCalledWith(1, 'user-1');
    expect(mockedSyncAllStores).toHaveBeenNthCalledWith(2, 'user-2');
  });
});
