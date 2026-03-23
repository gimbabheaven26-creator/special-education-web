import { createClient } from '@/lib/supabase/server';
import { QuizTable } from './QuizTable';

const PAGE_SIZE = 50;

interface SearchParams {
  page?: string;
  subject?: string;
  chapter?: string;
  type?: string;
  difficulty?: string;
  search?: string;
}

export default async function EditorPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const subject = params.subject || '';
  const chapter = params.chapter || '';
  const type = params.type || '';
  const difficulty = params.difficulty || '';
  const search = params.search || '';

  const supabase = await createClient();

  // 필터 적용된 쿼리
  const offset = (page - 1) * PAGE_SIZE;
  let query = supabase
    .from('quiz_questions')
    .select('id, subject, chapter, type, difficulty, question', { count: 'exact' });

  if (subject) query = query.eq('subject', subject);
  if (chapter) query = query.eq('chapter', chapter);
  if (type) query = query.eq('type', type);
  if (difficulty) query = query.eq('difficulty', Number(difficulty));
  if (search) query = query.ilike('question', `%${search}%`);

  query = query.order('created_at', { ascending: false }).range(offset, offset + PAGE_SIZE - 1);

  const [{ data, count, error }, { data: subjects }, { data: chapters }] = await Promise.all([
    query,
    supabase.from('subjects').select('slug, title').order('sort_order'),
    subject
      ? supabase.from('chapters').select('slug, title').eq('subject_slug', subject).order('sort_order')
      : Promise.resolve({ data: [] as { slug: string; title: string }[] }),
  ]);

  const rows = error ? [] : (data ?? []);
  const total = count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">문제 관리</h1>
      <QuizTable
        rows={rows}
        subjects={subjects ?? []}
        chapters={chapters ?? []}
        filters={{ page, subject, chapter, type, difficulty, search }}
        totalPages={totalPages}
        total={total}
      />
    </div>
  );
}
