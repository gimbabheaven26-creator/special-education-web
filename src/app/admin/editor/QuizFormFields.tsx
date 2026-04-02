import type { QuizType } from '@/types/quiz';

// ── 스타일 상수 ──────────────────────────────────────

export const INPUT_CLASS =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none';

// ── 상수 ──────────────────────────────────────────

export const TYPE_OPTIONS: { value: QuizType; label: string }[] = [
  { value: 'multiple', label: '객관식' },
  { value: 'ox', label: 'OX' },
  { value: 'fill_in', label: '빈칸채우기' },
  { value: 'descriptive', label: '서술형' },
  { value: 'scenario_composite', label: '시나리오 복합' },
];

export const DIFFICULTY_OPTIONS: { value: 1 | 2 | 3; label: string }[] = [
  { value: 1, label: '하' },
  { value: 2, label: '중' },
  { value: 3, label: '상' },
];

// ── 토스트 ──────────────────────────────────────────

export function Toast({ message, type, visible }: { message: string; type: 'success' | 'error'; visible: boolean }) {
  if (!visible) return null;
  const bg = type === 'success' ? 'bg-green-600' : 'bg-red-600';
  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-white text-sm shadow-lg ${bg} transition-opacity`}>
      {message}
    </div>
  );
}

// ── 공통 UI 컴포넌트 ──────────────────────────────

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
