import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { QuizForm } from '../QuizForm';

export default async function NewQuizPage() {
  const supabase = await createClient();

  const { data: subjects } = await supabase
    .from('subjects')
    .select('slug, title')
    .order('sort_order');

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/admin/editor"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          문제 관리
        </Link>
        <span className="text-sm text-gray-400">/</span>
        <span className="text-sm text-gray-700">새 문제 등록</span>
      </div>

      <h1 className="text-2xl font-bold mb-6">새 문제 등록</h1>

      <QuizForm
        mode="create"
        subjects={subjects ?? []}
      />
    </div>
  );
}
