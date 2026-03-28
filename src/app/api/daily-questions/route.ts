import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { seededSample } from '@/lib/seeded-sample';
import { getKSTTimeslot } from '@/lib/timeslot';

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('quiz_questions')
    .select('id, type, question, answer, chapter, subject, explanation')
    .in('type', ['ox', 'fill_in', 'descriptive']);

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }

  const { key } = getKSTTimeslot();
  const seed = key.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const rows = data as {
    id: string;
    type: string;
    question: string;
    answer: string;
    chapter: string;
    subject: string;
    explanation?: string;
  }[];

  const ox = seededSample(rows.filter((r) => r.type === 'ox'), 10, seed);
  const fillIn = seededSample(rows.filter((r) => r.type === 'fill_in'), 5, seed + 1);
  const descriptive = seededSample(rows.filter((r) => r.type === 'descriptive'), 3, seed + 2);

  return NextResponse.json({ ox, fillIn, descriptive });
}
