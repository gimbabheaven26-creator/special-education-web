import { createClient } from '@/lib/supabase/server';
import AIGenerateClient from './AIGenerateClient';

export const dynamic = 'force-dynamic';

interface SubjectRow {
  slug: string;
  title: string;
}

interface ChapterRow {
  slug: string;
  title: string;
  subject_slug: string;
}

export default async function AIGeneratePage() {
  const supabase = await createClient();

  const { data: subjects } = await supabase
    .from('subjects')
    .select('slug, title')
    .order('sort_order');

  const { data: chapters } = await supabase
    .from('chapters')
    .select('slug, title, subject_slug')
    .order('sort_order');

  return (
    <AIGenerateClient
      subjects={(subjects as SubjectRow[] | null) ?? []}
      chapters={(chapters as ChapterRow[] | null) ?? []}
    />
  );
}
