import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { QuizQuestion } from '@/types/quiz';
import { QuizForm } from '../QuizForm';

interface DbRow {
  id: string;
  subject: string;
  chapter: string;
  type: string;
  question: string;
  case_context: string | null;
  options: string[] | null;
  answer: string | number;
  explanation: string;
  wrong_explanations: Record<string, string> | null;
  difficulty: number;
  source: string | null;
  tags: { disability?: string; year?: number; round?: number } | null;
  sub_questions: QuizQuestion['subQuestions'] | null;
  image_url: string | null;
}

function toQuizQuestion(row: DbRow): QuizQuestion {
  return {
    id: row.id,
    subject: row.subject,
    chapter: row.chapter,
    type: row.type as QuizQuestion['type'],
    question: row.question,
    caseContext: row.case_context ?? undefined,
    options: row.options ?? undefined,
    answer: row.answer,
    explanation: row.explanation,
    wrongExplanations: row.wrong_explanations ?? undefined,
    difficulty: row.difficulty as 1 | 2 | 3,
    source: row.source ?? undefined,
    tags: row.tags ?? undefined,
    subQuestions: row.sub_questions ?? undefined,
    imageUrl: row.image_url ?? undefined,
  };
}

export default async function EditQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // 문제 데이터 + 과목 목록 병렬 로딩
  const [questionResult, subjectsResult] = await Promise.all([
    supabase.from('quiz_questions').select('*').eq('id', id).single(),
    supabase.from('subjects').select('slug, title').order('sort_order'),
  ]);

  if (questionResult.error || !questionResult.data) {
    notFound();
  }

  const row = questionResult.data as DbRow;
  const quizQuestion = toQuizQuestion(row);

  // 해당 과목의 챕터 목록 로딩
  const { data: chapters } = await supabase
    .from('chapters')
    .select('slug, title')
    .eq('subject_slug', row.subject)
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
        <span className="text-sm text-gray-700">문제 수정</span>
      </div>

      <h1 className="text-2xl font-bold mb-6">문제 수정</h1>

      <QuizForm
        mode="edit"
        initialData={quizQuestion}
        subjects={subjectsResult.data ?? []}
        initialChapters={chapters ?? []}
      />
    </div>
  );
}
