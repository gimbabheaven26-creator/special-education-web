/**
 * 기존 TS 하드코딩 데이터를 Supabase DB로 마이그레이션
 * 실행: npx tsx scripts/migrate-to-supabase.ts
 */
import { createClient } from '@supabase/supabase-js';
import { subjects } from '../src/data/subjects';
import { quizzesBySubject } from '../src/data/quizzes/index';
import {
  worksheetsBySubject,
  topicsBySubject,
} from '../src/data/worksheets/index';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function migrate() {
  console.log('🚀 마이그레이션 시작...\n');

  // ─── 1. subjects ───
  console.log('📚 과목 데이터 삽입...');
  const subjectRows = subjects.map((s) => ({
    slug: s.slug,
    title: s.title,
    description: s.description,
    icon: s.icon,
    color: s.color,
    sort_order: s.order,
  }));

  const { error: subjectError } = await supabase
    .from('subjects')
    .upsert(subjectRows, { onConflict: 'slug' });

  if (subjectError) {
    console.error('❌ subjects 삽입 실패:', subjectError.message);
    return;
  }
  console.log(`  ✅ ${subjectRows.length}개 과목 삽입 완료`);

  // ─── 2. chapters ───
  console.log('📖 챕터 데이터 삽입...');
  const chapterRows = subjects.flatMap((s) =>
    s.chapters.map((c) => ({
      subject_slug: s.slug,
      slug: c.slug,
      title: c.title,
      description: c.description,
      keywords: c.keywords,
      sort_order: c.order,
    }))
  );

  // chapters는 serial PK라서 upsert가 까다로움. 기존 데이터 삭제 후 삽입
  await supabase.from('chapters').delete().neq('id', 0);
  const { error: chapterError } = await supabase
    .from('chapters')
    .insert(chapterRows);

  if (chapterError) {
    console.error('❌ chapters 삽입 실패:', chapterError.message);
    return;
  }
  console.log(`  ✅ ${chapterRows.length}개 챕터 삽입 완료`);

  // ─── 3. quiz_questions ───
  console.log('❓ 퀴즈 데이터 삽입...');
  const quizRows: Record<string, unknown>[] = [];

  for (const [subject, questions] of Object.entries(quizzesBySubject)) {
    for (const q of questions) {
      quizRows.push({
        id: q.id,
        subject: q.subject || subject,
        chapter: q.chapter,
        type: q.type,
        question: q.question,
        case_context: q.caseContext || null,
        options: q.options || null,
        answer: String(q.answer),
        explanation: q.explanation,
        wrong_explanations: q.wrongExplanations || null,
        difficulty: q.difficulty,
        source: q.source || null,
        tags: q.tags || null,
      });
    }
  }

  // 배치 삽입 (50개씩)
  for (let i = 0; i < quizRows.length; i += 50) {
    const batch = quizRows.slice(i, i + 50);
    const { error } = await supabase
      .from('quiz_questions')
      .upsert(batch, { onConflict: 'id' });
    if (error) {
      console.error(`❌ quiz_questions 배치 ${i} 실패:`, error.message);
      return;
    }
  }
  console.log(`  ✅ ${quizRows.length}개 퀴즈 삽입 완료`);

  // ─── 4. worksheet_topics ───
  console.log('📋 워크시트 토픽 삽입...');
  const topicRows: { id: string; subject: string; name: string }[] = [];

  for (const [subject, topics] of Object.entries(topicsBySubject)) {
    for (const [topicId, topicData] of Object.entries(topics)) {
      topicRows.push({
        id: topicId,
        subject,
        name: topicData.name,
      });
    }
  }

  // 기존 삭제 후 삽입 (복합 PK)
  await supabase.from('worksheet_topics').delete().neq('id', '');
  const { error: topicError } = await supabase
    .from('worksheet_topics')
    .insert(topicRows);

  if (topicError) {
    console.error('❌ worksheet_topics 삽입 실패:', topicError.message);
    return;
  }
  console.log(`  ✅ ${topicRows.length}개 토픽 삽입 완료`);

  // ─── 5. worksheet_questions ───
  console.log('📝 워크시트 문제 삽입...');
  const wsRows: Record<string, unknown>[] = [];

  for (const [subject, questions] of Object.entries(worksheetsBySubject)) {
    for (const q of questions) {
      wsRows.push({
        id: q.id,
        topic_id: q.topicId,
        subject: q.subject || subject,
        type: q.type,
        difficulty: q.difficulty,
        question: q.question,
        answer: q.answer,
        explanation: q.explanation,
        source: q.source || null,
        tags: q.tags || [],
      });
    }
  }

  // 배치 삽입 (50개씩)
  for (let i = 0; i < wsRows.length; i += 50) {
    const batch = wsRows.slice(i, i + 50);
    const { error } = await supabase
      .from('worksheet_questions')
      .upsert(batch, { onConflict: 'id' });
    if (error) {
      console.error(`❌ worksheet_questions 배치 ${i} 실패:`, error.message);
      return;
    }
  }
  console.log(`  ✅ ${wsRows.length}개 워크시트 문제 삽입 완료`);

  // ─── 결과 요약 ───
  console.log('\n🎉 마이그레이션 완료!');
  console.log('───────────────────');
  console.log(`  과목:          ${subjectRows.length}개`);
  console.log(`  챕터:          ${chapterRows.length}개`);
  console.log(`  퀴즈:          ${quizRows.length}개`);
  console.log(`  워크시트 토픽:  ${topicRows.length}개`);
  console.log(`  워크시트 문제:  ${wsRows.length}개`);
}

migrate().catch(console.error);
