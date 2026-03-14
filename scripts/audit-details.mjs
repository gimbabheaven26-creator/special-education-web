const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const URL = 'https://ssluhxvbyzqmdkbjwoke.supabase.co'
const h = { apikey: KEY, Authorization: `Bearer ${KEY}` }

async function fetchIds(ids, fields = 'id,question,type,subject,chapter') {
  const filter = ids.map(id => `id.eq.${id}`).join(',')
  const res = await fetch(`${URL}/rest/v1/quiz_questions?select=${fields}&or=(${filter})`, { headers: h })
  return res.json()
}

async function main() {
  // 1. Duplicates
  const dupIds = ['cd-q63','cd-q62','intro-q16','laws-q62','hi-q4','hi-q7','hi-q20','vi-q25','vi-q27','vi-q32','vi-q37','vi-q40','vi-q5','vi-q9','vi-q14','vi-q16','vi-q20']
  const dups = await fetchIds(dupIds)

  console.log('=== DUPLICATES (17) ===')
  const byText = new Map()
  for (const q of dups) {
    const key = q.question.substring(0, 80)
    const list = byText.get(key) || []
    list.push(`${q.id} [${q.subject}/${q.chapter}]`)
    byText.set(key, list)
  }
  for (const [text, ids] of byText) {
    if (ids.length > 1) {
      console.log(`\n"${text}..."`)
      for (const id of ids) console.log(`  ${id}`)
    }
  }

  // 2. Short questions
  const shortIds = ['hi-q4','hi-q7','hi-q20','vi-q25','vi-q27','vi-q32','vi-q37','vi-q40','vi-q5','vi-q9','vi-q14','vi-q16','vi-q20']
  const shorts = await fetchIds(shortIds)

  console.log('\n\n=== SHORT QUESTIONS (13) ===')
  for (const q of shorts) {
    console.log(`${q.id}: "${q.question}" [${q.type}, ${q.subject}]`)
  }

  // 3. Orphan chapters
  const orphanIds = ['bs-q92','laws-q71','laws-q32','laws-q31','laws-q59','laws-q58','laws-q62','laws-q68','laws-q75']
  const orphans = await fetchIds(orphanIds, 'id,subject,chapter')

  console.log('\n\n=== ORPHAN CHAPTERS (9) ===')
  for (const q of orphans) {
    console.log(`${q.id}: ${q.subject}/${q.chapter}`)
  }

  // 4. Existing chapters
  const chapRes = await fetch(`${URL}/rest/v1/chapters?select=subject_slug,slug`, { headers: h })
  const chapters = await chapRes.json()
  const chapSet = new Set(chapters.map(c => `${c.subject_slug}/${c.slug}`))
  console.log('\n--- Available chapters for orphan subjects ---')
  for (const q of orphans) {
    const matches = chapters.filter(c => c.subject_slug === q.subject).map(c => c.slug)
    console.log(`${q.subject}: [${matches.join(', ')}]`)
  }

  // 5. Short explanation
  const exps = await fetchIds(['intro-q5'], 'id,explanation')
  console.log('\n\n=== SHORT EXPLANATION (1) ===')
  for (const q of exps) {
    console.log(`${q.id}: "${q.explanation}"`)
  }
}

main().catch(e => console.error(e))
