import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ssluhxvbyzqmdkbjwoke.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY env var required.\nUsage: SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/cleanup-duplicate-chapters.mjs')
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// OLD chapter → NEW chapter quiz reassignment map
// Quizzes in OLD chapters get moved to the most relevant NEW chapter
const REASSIGN_MAP = {
  // hearing-impairment
  'audiology': 'audiogram',
  'amplification': 'hearing-aid',       // 보청기+인공와우 → hearing-aid (더 넓은 범위)
  'communication': 'sign-language',     // 의사소통 방법 → 수어/지문자

  // physical-disability
  'cerebral-palsy': 'cp-types',
  'reflexes': 'primitive-reflexes',
  'assistive-devices': 'positioning',

  // visual-impairment
  'visual-function': 'visual-acuity',   // 시기능과 측정 → 시력 측정

  // communication-disorder
  'language-intervention': 'emt',       // 언어중재 → 환경중심 언어중재
}

async function main() {
  console.log('=== Duplicate Chapter Cleanup ===\n')

  // 1. Preview: count quizzes to reassign
  const { data: quizzes, error: qErr } = await supabase
    .from('quiz_questions')
    .select('id, chapter')

  if (qErr) {
    throw new Error(`Failed to fetch quizzes: ${qErr.message}`)
  }

  const oldChapters = Object.keys(REASSIGN_MAP)
  const toReassign = quizzes.filter(q => oldChapters.includes(q.chapter))

  console.log(`Quizzes to reassign: ${toReassign.length}`)
  for (const [oldCh, newCh] of Object.entries(REASSIGN_MAP)) {
    const count = toReassign.filter(q => q.chapter === oldCh).length
    console.log(`  ${oldCh} → ${newCh}: ${count} quizzes`)
  }

  // 2. Reassign quizzes
  let reassigned = 0
  let failed = 0

  for (const [oldCh, newCh] of Object.entries(REASSIGN_MAP)) {
    const { error: updateErr, count } = await supabase
      .from('quiz_questions')
      .update({ chapter: newCh })
      .eq('chapter', oldCh)

    if (updateErr) {
      console.error(`  FAIL reassign ${oldCh} → ${newCh}: ${updateErr.message}`)
      failed++
    } else {
      reassigned++
      console.log(`  ✓ ${oldCh} → ${newCh}`)
    }
  }

  console.log(`\nReassignment: ${reassigned} success, ${failed} failed`)

  if (failed > 0) {
    console.error('Aborting chapter deletion due to reassignment failures')
    return
  }

  // 3. Verify no quizzes remain in old chapters
  const { data: remaining } = await supabase
    .from('quiz_questions')
    .select('id, chapter')
    .in('chapter', oldChapters)

  if (remaining && remaining.length > 0) {
    console.error(`\nERROR: ${remaining.length} quizzes still in old chapters!`)
    for (const q of remaining) {
      console.error(`  ${q.id} → ${q.chapter}`)
    }
    throw new Error('Cannot delete chapters with remaining quizzes')
  }

  console.log('\nNo quizzes remain in old chapters. Proceeding to delete...')

  // 4. Delete old chapters
  let deleted = 0
  for (const oldCh of oldChapters) {
    const { error: delErr } = await supabase
      .from('chapters')
      .delete()
      .eq('slug', oldCh)

    if (delErr) {
      console.error(`  FAIL delete chapter ${oldCh}: ${delErr.message}`)
    } else {
      deleted++
      console.log(`  ✓ Deleted chapter: ${oldCh}`)
    }
  }

  console.log(`\nDeleted ${deleted}/${oldChapters.length} old chapters`)

  // 5. Re-sort remaining chapters (1-based, sequential)
  const subjects = ['hearing-impairment', 'physical-disability', 'visual-impairment', 'communication-disorder']
  for (const subj of subjects) {
    const { data: chs } = await supabase
      .from('chapters')
      .select('id, slug, sort_order')
      .eq('subject_slug', subj)
      .order('sort_order')

    if (chs) {
      for (let i = 0; i < chs.length; i++) {
        const newOrder = i + 1
        if (chs[i].sort_order !== newOrder) {
          await supabase
            .from('chapters')
            .update({ sort_order: newOrder })
            .eq('id', chs[i].id)
        }
      }
      console.log(`  Re-sorted ${subj}: ${chs.length} chapters`)
    }
  }

  // 6. Final verification
  console.log('\n=== Final State ===')
  for (const subj of subjects) {
    const { data: finalChs } = await supabase
      .from('chapters')
      .select('slug, title, sort_order')
      .eq('subject_slug', subj)
      .order('sort_order')

    const { data: finalQuizzes } = await supabase
      .from('quiz_questions')
      .select('id, chapter')
      .eq('subject', subj)

    const qByChapter = {}
    for (const q of (finalQuizzes || [])) {
      qByChapter[q.chapter] = (qByChapter[q.chapter] || 0) + 1
    }

    console.log(`\n${subj} (${finalQuizzes?.length || 0} quizzes):`)
    for (const ch of (finalChs || [])) {
      console.log(`  ${ch.sort_order}. ${ch.slug} (${qByChapter[ch.slug] || 0} quiz) — ${ch.title}`)
    }
  }
}

main().catch(err => {
  console.error(err.message)
  process.exit(1)
})
