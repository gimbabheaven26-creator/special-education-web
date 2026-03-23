import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

const TYPE_LABELS: Record<string, string> = {
  multiple: '객관식',
  ox: 'OX',
  fill_in: '빈칸채우기',
  descriptive: '서술형',
  scenario_composite: '시나리오',
};

const DIFFICULTY_LABELS: Record<number, string> = {
  1: '기본',
  2: '심화',
  3: '고난도',
};

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: totalCount },
    { data: allRows },
    { data: subjects },
  ] = await Promise.all([
    supabase.from('quiz_questions').select('*', { count: 'exact', head: true }),
    supabase.from('quiz_questions').select('subject, type, difficulty').limit(10000),
    supabase.from('subjects').select('slug, title').order('sort_order'),
  ]);

  const rows = allRows ?? [];

  const subjectMap = new Map<string, number>();
  const typeMap = new Map<string, number>();
  const difficultyMap = new Map<number, number>();

  for (const row of rows) {
    subjectMap.set(row.subject, (subjectMap.get(row.subject) ?? 0) + 1);
    typeMap.set(row.type, (typeMap.get(row.type) ?? 0) + 1);
    difficultyMap.set(row.difficulty, (difficultyMap.get(row.difficulty) ?? 0) + 1);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">대시보드</h1>
        <Link
          href="/admin/editor"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          문제 관리 &rarr;
        </Link>
      </div>

      {/* 전체 문항 수 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <p className="text-sm text-gray-500">전체 문항 수</p>
        <p className="text-4xl font-bold mt-1">{(totalCount ?? 0).toLocaleString()}</p>
      </div>

      {/* 과목별 문항 */}
      <h2 className="text-lg font-semibold mb-3">과목별 문항</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        {(subjects ?? []).map((s) => (
          <div key={s.slug} className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600">{s.title}</p>
            <p className="text-2xl font-bold mt-1">{subjectMap.get(s.slug) ?? 0}</p>
          </div>
        ))}
      </div>

      {/* 유형별 문항 */}
      <h2 className="text-lg font-semibold mb-3">유형별 문항</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {Object.entries(TYPE_LABELS).map(([key, label]) => (
          <div key={key} className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600">{label}</p>
            <p className="text-2xl font-bold mt-1">{typeMap.get(key) ?? 0}</p>
          </div>
        ))}
      </div>

      {/* 난이도별 문항 */}
      <h2 className="text-lg font-semibold mb-3">난이도별 문항</h2>
      <div className="grid grid-cols-3 gap-3">
        {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
          <div key={key} className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600">{label}</p>
            <p className="text-2xl font-bold mt-1">{difficultyMap.get(Number(key)) ?? 0}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
