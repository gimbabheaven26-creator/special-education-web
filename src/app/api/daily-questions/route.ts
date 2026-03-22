import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function seededRandom(seed: number, index: number): number {
  const s = (seed * 1664525 + 1013904223 + index * 22695477) & 0x7fffffff;
  return s / 0x7fffffff;
}

function seededSample<T>(arr: T[], n: number, seed: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed, i) * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(n, copy.length));
}

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('quiz_questions')
    .select('id, type, question, answer, chapter, subject, explanation')
    .in('type', ['ox', 'fill_in', 'descriptive']);

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }

  const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date());
  const seed = today.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
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
