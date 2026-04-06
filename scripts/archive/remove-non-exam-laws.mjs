import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ssluhxvbyzqmdkbjwoke.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const deleteIds = [
  'laws-q45','laws-q46','laws-q47','laws-q48','laws-q49','laws-q50','laws-q51','laws-q72','laws-q37',
  'laws-q9','laws-q52','laws-q53','laws-q54','laws-q55','laws-q56','laws-q57','laws-q65','laws-q74',
]

async function main() {
  const { error: qErr } = await supabase
    .from('quiz_questions')
    .delete()
    .in('id', deleteIds)

  if (qErr) {
    console.error(`Quiz delete failed: ${qErr.message}`)
  } else {
    console.log(`Deleted ${deleteIds.length} quiz questions`)
  }

  const chaptersToDelete = ['welfare-act', 'anti-discrimination-act']
  for (const ch of chaptersToDelete) {
    const { data: remaining } = await supabase
      .from('quiz_questions')
      .select('id')
      .eq('chapter', ch)

    if (remaining && remaining.length > 0) {
      console.log(`  WARNING: ${remaining.length} quizzes still use chapter ${ch}`)
    } else {
      const { error: chErr } = await supabase
        .from('chapters')
        .delete()
        .eq('slug', ch)

      if (chErr) {
        console.error(`  Chapter ${ch} delete failed: ${chErr.message}`)
      } else {
        console.log(`  Deleted chapter: ${ch}`)
      }
    }
  }

  const { count: lawsCount } = await supabase
    .from('quiz_questions')
    .select('*', { count: 'exact', head: true })
    .eq('subject', 'laws')

  const { count: totalCount } = await supabase
    .from('quiz_questions')
    .select('*', { count: 'exact', head: true })

  const { data: lawsChapters } = await supabase
    .from('chapters')
    .select('slug, title')
    .eq('subject_slug', 'laws')

  console.log(`\nLaws quizzes: ${lawsCount}`)
  console.log(`Total quizzes: ${totalCount}`)
  console.log(`Laws chapters:`)
  for (const ch of (lawsChapters || [])) {
    console.log(`  ${ch.slug}: ${ch.title}`)
  }
}

main().catch(err => { console.error(err.message); process.exit(1) })
