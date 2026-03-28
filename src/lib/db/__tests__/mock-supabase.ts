/* eslint-disable @typescript-eslint/no-unused-vars */
import { vi } from 'vitest';

/**
 * Supabase query builder mock — chainable methods return `this`,
 * terminal methods (.single(), await) resolve with the configured result.
 *
 * Shared across all db/ domain test files.
 */
export class MockQueryBuilder {
  private result: { data: unknown; error: unknown };
  constructor(result: { data: unknown; error: unknown }) {
    this.result = result;
  }
  select(_col?: string) { return this; }
  eq(_k: string, _v: unknown) { return this; }
  in(_k: string, _v: unknown[]) { return this; }
  or(_filter: string) { return this; }
  order(_k: string, _opts?: unknown) { return this; }
  limit(_n: number) { return this; }
  insert(_: unknown) { return this; }
  update(_: unknown) { return this; }
  upsert(_: unknown, __?: unknown) { return this; }
  delete() { return this; }
  single() { return Promise.resolve(this.result); }
  then<T>(
    resolve: (v: { data: unknown; error: unknown }) => T,
    reject?: (e: unknown) => T,
  ) { return Promise.resolve(this.result).then(resolve, reject); }
  catch<T>(reject: (e: unknown) => T) { return Promise.resolve(this.result).catch(reject); }
  finally(fn: () => void) { return Promise.resolve(this.result).finally(fn); }
}

/** Create a mock Supabase client whose `.from()` always returns the given result. */
export function makeSupabase(result: { data: unknown; error: unknown }) {
  return { from: vi.fn(() => new MockQueryBuilder(result)) };
}

/** Shortcut: configure `createClient` mock to resolve with the given result. */
export function mockCreateClient(
  createClient: ReturnType<typeof vi.fn>,
  result: { data: unknown; error: unknown },
) {
  createClient.mockResolvedValue(makeSupabase(result));
}
