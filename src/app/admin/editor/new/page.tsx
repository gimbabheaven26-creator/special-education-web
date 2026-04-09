import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { QuizForm } from '../QuizForm';
import { AIPrefilledForm } from './AIPrefilledForm';

export const dynamic = 'force-dynamic';

interface NewQuizPageProps {
  searchParams: Promise<{ from?: string }>;
}

export default async function NewQuizPage({ searchParams }: NewQuizPageProps) {
  const params = await searchParams;
  const fromAI = params.from === 'ai';

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
        <span className="text-sm text-gray-700">
          {fromAI ? 'AI 초안 편집' : '새 문제 등록'}
        </span>
      </div>

      <h1 className="text-2xl font-bold mb-6">
        {fromAI ? 'AI 초안 편집 후 등록' : '새 문제 등록'}
      </h1>

      {fromAI ? (
        <AIPrefilledForm subjects={subjects ?? []} />
      ) : (
        <QuizForm mode="create" subjects={subjects ?? []} />
      )}
    </div>
  );
}
