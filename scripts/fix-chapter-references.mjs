/**
 * Fix broken chapter references in quiz_questions
 *
 * Problem: quiz_questions.chapter uses Korean slugs but chapters table uses English slugs.
 * Also: 'emotional-behavioral' subject doesn't exist → remap to 'behavior-support/ebd'.
 *
 * Usage: SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/fix-chapter-references.mjs [--dry-run]
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ssluhxvbyzqmdkbjwoke.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY env var required');
}

const DRY_RUN = process.argv.includes('--dry-run');
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ── Korean chapter slug → English chapter slug mapping ──

const CHAPTER_MAP = {
  // introduction (chapters: understanding, disability-types, history)
  'introduction/특수교육의정의와대상': { chapter: 'understanding' },
  'introduction/장애유형별핵심개념': { chapter: 'disability-types' },
  'introduction/특수교육역사와패러다임': { chapter: 'history' },

  // laws (chapters: special-education-act)
  'laws/특수교육법총칙과국가의무': { chapter: 'special-education-act' },
  'laws/특수교육기관과권리구제': { chapter: 'special-education-act' },
  'laws/개별화교육계획법적요건과지원': { chapter: 'special-education-act' },
  'laws/특수교육대상자선정과배치': { chapter: 'special-education-act' },

  // assessment (chapters: standardized-tests, cbm, fba)
  'assessment/표준화검사와점수': { chapter: 'standardized-tests' },
  'assessment/타당도신뢰도와사정': { chapter: 'standardized-tests' },
  'assessment/비공식평가와사정방법': { chapter: 'fba' },
  'assessment/평가기초와측정': { chapter: 'standardized-tests' },
  'assessment/학습검사': { chapter: 'standardized-tests' },
  'assessment/형성평가와진전도': { chapter: 'cbm' },

  // behavior-support (chapters: aba, pbs, intervention, ebd, adhd)
  'behavior-support/기본이론': { chapter: 'aba' },
  'behavior-support/행동감소전략': { chapter: 'intervention' },
  'behavior-support/긍정적행동지원': { chapter: 'pbs' },
  'behavior-support/관찰측정과단일대상설계': { chapter: 'aba' },
  'behavior-support/강화와행동증가': { chapter: 'aba' },

  // communication-disorder (chapters: articulation, aac, spontaneous-speech, emt, fluency)
  'communication-disorder/중재전략과평가': { chapter: 'emt' },
  'communication-disorder/말장애': { chapter: 'articulation' },
  'communication-disorder/언어장애': { chapter: 'spontaneous-speech' },

  // curriculum (chapters: basic-curriculum, general-curriculum, iep)
  'curriculum/2022개정교육과정': { chapter: 'general-curriculum' },
  'curriculum/2022-revised': { chapter: 'general-curriculum' },
  'curriculum/교육과정재구성': { chapter: 'basic-curriculum' },
  'curriculum/전환교육과정': { chapter: 'general-curriculum' },
  'curriculum/udl': { chapter: 'general-curriculum' },

  // inclusive-education (chapters: theory, co-teaching, udl)
  'inclusive-education/협력교수와협동학습': { chapter: 'co-teaching' },
  'inclusive-education/개념과협력팀': { chapter: 'theory' },
  'inclusive-education/보편적학습설계심화': { chapter: 'udl' },
  'inclusive-education/교수적합화': { chapter: 'co-teaching' },
  'inclusive-education/삽입교수와중복교육과정': { chapter: 'co-teaching' },

  // transition (chapters: planning, self-determination, cbi)
  'transition/전환교육개요': { chapter: 'planning' },
  'transition/전환결과고용': { chapter: 'cbi' },
  'transition/전환평가': { chapter: 'planning' },

  // visual-impairment (chapters: braille, orientation-mobility, visual-acuity, visual-training, assistive-tech)
  'visual-impairment/촉각청각점자': { chapter: 'braille' },
  'visual-impairment/보행기술': { chapter: 'orientation-mobility' },
  'visual-impairment/검사와보행훈련': { chapter: 'visual-acuity' },
  'visual-impairment/교육과정': { chapter: 'visual-training' },
  'visual-impairment/보조공학': { chapter: 'assistive-tech' },
  'visual-impairment/이해와안질환': { chapter: 'visual-acuity' },

  // hearing-impairment (chapters: audiogram, cochlear-implant, hearing-aid, sign-language, classroom)
  'hearing-impairment/보조기기': { chapter: 'hearing-aid' },
  'hearing-impairment/수어심화': { chapter: 'sign-language' },
  'hearing-impairment/청력검사': { chapter: 'audiogram' },
  'hearing-impairment/교실환경지원': { chapter: 'classroom' },
  'hearing-impairment/교육적접근': { chapter: 'cochlear-implant' },

  // physical-disability (chapters: cp-types, gmfcs, primitive-reflexes, positioning, muscular-dystrophy)
  'physical-disability/이해와뇌성마비': { chapter: 'cp-types' },
  'physical-disability/뇌성마비특성과기타유형': { chapter: 'gmfcs' },
  'physical-disability/자세보행일상생활': { chapter: 'positioning' },
  'physical-disability/건강장애와병원학교': { chapter: 'muscular-dystrophy' },
  'physical-disability/보조공학과접근성': { chapter: 'positioning' },
  'physical-disability/건강장애심화와전환교육': { chapter: 'muscular-dystrophy' },

  // emotional-behavioral → remap to behavior-support/ebd
  'emotional-behavioral/기초이론': { subject: 'behavior-support', chapter: 'ebd' },
  'emotional-behavioral/인지행동중재': { subject: 'behavior-support', chapter: 'ebd' },
  'emotional-behavioral/강박장애': { subject: 'behavior-support', chapter: 'ebd' },
  'emotional-behavioral/불안장애': { subject: 'behavior-support', chapter: 'ebd' },
  'emotional-behavioral/우울양극성': { subject: 'behavior-support', chapter: 'ebd' },
  'emotional-behavioral/품행장애': { subject: 'behavior-support', chapter: 'ebd' },
  'emotional-behavioral/기타': { subject: 'behavior-support', chapter: 'ebd' },
  'emotional-behavioral/외상장애': { subject: 'behavior-support', chapter: 'ebd' },
};

async function main() {
  console.log(DRY_RUN ? '=== DRY RUN ===' : '=== LIVE RUN ===');
  console.log('');

  // 1. Fetch all quizzes (paginated)
  let allQuizzes = [];
  let from = 0;
  const batchSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('id, subject, chapter')
      .range(from, from + batchSize - 1);
    if (error) throw new Error(`Fetch error: ${error.message}`);
    allQuizzes = allQuizzes.concat(data);
    if (data.length < batchSize) break;
    from += batchSize;
  }
  console.log(`Total quizzes fetched: ${allQuizzes.length}`);

  // 2. Get chapter set for validation
  const { data: chapters } = await supabase
    .from('chapters')
    .select('subject_slug, slug')
    .limit(10000);
  const chapterSet = new Set(chapters.map(c => `${c.subject_slug}/${c.slug}`));

  // 3. Build updates
  const updates = [];
  const alreadyOk = [];
  const unmapped = [];

  for (const q of allQuizzes) {
    const key = `${q.subject}/${q.chapter}`;

    // Already matches
    if (chapterSet.has(key)) {
      alreadyOk.push(q.id);
      continue;
    }

    const mapping = CHAPTER_MAP[key];
    if (!mapping) {
      unmapped.push({ id: q.id, subject: q.subject, chapter: q.chapter });
      continue;
    }

    const update = { id: q.id };
    if (mapping.subject) update.subject = mapping.subject;
    update.chapter = mapping.chapter;
    updates.push(update);
  }

  console.log(`Already OK: ${alreadyOk.length}`);
  console.log(`To update: ${updates.length}`);
  console.log(`Unmapped: ${unmapped.length}`);

  if (unmapped.length > 0) {
    console.log('\nUnmapped entries:');
    const unmappedGroups = {};
    for (const u of unmapped) {
      const key = `${u.subject}/${u.chapter}`;
      unmappedGroups[key] = (unmappedGroups[key] || 0) + 1;
    }
    for (const [key, count] of Object.entries(unmappedGroups).sort((a, b) => b[1] - a[1])) {
      console.log(`  [${count}] ${key}`);
    }
  }

  if (DRY_RUN) {
    console.log('\nDry run complete. No changes made.');
    console.log('\nSample updates (first 10):');
    for (const u of updates.slice(0, 10)) {
      console.log(`  ${u.id}: chapter → ${u.chapter}${u.subject ? `, subject → ${u.subject}` : ''}`);
    }
    return;
  }

  // 4. Apply updates in batches
  console.log('\nApplying updates...');
  let success = 0;
  let failed = 0;

  // Group by subject+chapter change for batch updates
  const batchGroups = {};
  for (const u of updates) {
    const changeKey = `${u.subject || ''}|${u.chapter}`;
    if (!batchGroups[changeKey]) batchGroups[changeKey] = [];
    batchGroups[changeKey].push(u.id);
  }

  for (const [changeKey, ids] of Object.entries(batchGroups)) {
    const [newSubject, newChapter] = changeKey.split('|');
    const updateData = { chapter: newChapter };
    if (newSubject) updateData.subject = newSubject;

    // Update in batches of 100 IDs
    for (let i = 0; i < ids.length; i += 100) {
      const batch = ids.slice(i, i + 100);
      const { error } = await supabase
        .from('quiz_questions')
        .update(updateData)
        .in('id', batch);

      if (error) {
        console.error(`  FAIL: ${changeKey} (${batch.length} rows): ${error.message}`);
        failed += batch.length;
      } else {
        success += batch.length;
      }
    }
  }

  console.log(`\nDone. Success: ${success}, Failed: ${failed}`);

  // 5. Verify
  let verified = [];
  from = 0;
  while (true) {
    const { data } = await supabase
      .from('quiz_questions')
      .select('subject, chapter')
      .range(from, from + batchSize - 1);
    verified = verified.concat(data);
    if (data.length < batchSize) break;
    from += batchSize;
  }

  let brokenAfter = 0;
  for (const q of verified) {
    if (!chapterSet.has(`${q.subject}/${q.chapter}`)) brokenAfter++;
  }
  console.log(`\nVerification: ${brokenAfter} broken references remaining (was ${allQuizzes.length - alreadyOk.length})`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
