import StructureClient from './StructureClient';
import { AdminOnly } from '@/components/AdminOnly';
import { createClient } from '@/lib/supabase/server';

export interface SubjectStat {
  title: string;
  slug: string;
  chapters: number;
  total: number;
  ox: number;
  fill_in: number;
  descriptive: number;
}

async function getDbStats(): Promise<SubjectStat[]> {
  try {
    const supabase = await createClient();
    const [{ data: subjects }, { data: chapters }, { data: questions }] =
      await Promise.all([
        supabase.from('subjects').select('slug,title').order('sort_order'),
        supabase.from('chapters').select('slug,subject_slug'),
        supabase.from('quiz_questions').select('subject,type').limit(5000),
      ]);

    if (!subjects || !chapters || !questions) return [];

    return subjects.map((sub) => {
      const subChapters = chapters.filter((c) => c.subject_slug === sub.slug);
      const subQs = questions.filter((q) => q.subject === sub.slug);
      return {
        title: sub.title,
        slug: sub.slug,
        chapters: subChapters.length,
        total: subQs.length,
        ox: subQs.filter((q) => q.type === 'ox').length,
        fill_in: subQs.filter((q) => q.type === 'fill_in').length,
        descriptive: subQs.filter((q) => q.type === 'descriptive').length,
      };
    });
  } catch {
    return [];
  }
}

export default async function StructurePage() {
  const dbStats = await getDbStats();
  return (
    <AdminOnly>
      <StructureClient dbStats={dbStats} />
    </AdminOnly>
  );
}
