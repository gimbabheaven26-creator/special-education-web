import StructureClient from './StructureClient';
import { AdminOnly } from '@/components/AdminOnly';
import { createClient } from '@/lib/supabase/server';
import { getConceptsForSubject } from '@/lib/content/concepts';

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
    const [{ data: subjects }, { data: questions }] =
      await Promise.all([
        supabase.from('subjects').select('slug,title').order('sort_order'),
        supabase.from('quiz_questions').select('subject,type').limit(5000),
      ]);

    if (!subjects || !questions) return [];

    return subjects.map((sub) => {
      const conceptCount = getConceptsForSubject(sub.slug).length;
      const subQs = questions.filter((q) => q.subject === sub.slug);
      return {
        title: sub.title,
        slug: sub.slug,
        chapters: conceptCount,
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
