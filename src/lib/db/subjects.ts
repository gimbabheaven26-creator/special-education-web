import { createClient } from '@/lib/supabase/server';
import { getConceptsForSubject } from '@/lib/concepts';
import type { Subject } from '@/types/content';

/** MDX title에서 "과목명 — " 접두어 제거 (예: "진단평가 — 지능 검사" → "지능 검사") */
function stripSubjectPrefix(title: string): string {
  const idx = title.indexOf(' — ');
  return idx > 0 ? title.slice(idx + 3) : title;
}

export async function getSubjects(): Promise<Subject[]> {
  const supabase = await createClient();
  const { data: subjectRows, error } = await supabase
    .from('subjects')
    .select('*')
    .order('sort_order');

  if (error || !subjectRows) return [];

  return subjectRows.map((s) => ({
    slug: s.slug,
    title: s.title,
    description: s.description,
    icon: s.icon,
    color: s.color,
    order: s.sort_order,
    chapters: getConceptsForSubject(s.slug).map((c) => ({
      slug: c.slug,
      title: stripSubjectPrefix(c.title),
      description: c.description,
      keywords: c.kiceKeywords,
      order: c.order,
    })),
  }));
}

export async function getSubjectBySlug(slug: string): Promise<Subject | null> {
  const supabase = await createClient();
  const { data: s, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !s) return null;

  return {
    slug: s.slug,
    title: s.title,
    description: s.description,
    icon: s.icon,
    color: s.color,
    order: s.sort_order,
    chapters: getConceptsForSubject(s.slug).map((c) => ({
      slug: c.slug,
      title: stripSubjectPrefix(c.title),
      description: c.description,
      keywords: c.kiceKeywords,
      order: c.order,
    })),
  };
}
