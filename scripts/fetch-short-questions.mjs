const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const URL = 'https://ssluhxvbyzqmdkbjwoke.supabase.co'
const h = { apikey: KEY, Authorization: `Bearer ${KEY}` }

const ids = ['hi-q4','hi-q7','hi-q20','vi-q25','vi-q27','vi-q32','vi-q37','vi-q40','vi-q5','vi-q9','vi-q14','vi-q16','vi-q20']

async function main() {
  const filter = ids.map(id => `id.eq.${id}`).join(',')
  const res = await fetch(`${URL}/rest/v1/quiz_questions?select=id,question,case_context,answer,explanation,subject,chapter&or=(${filter})`, { headers: h })
  const rows = await res.json()

  for (const q of rows) {
    console.log(`\n${'─'.repeat(60)}`)
    console.log(`ID: ${q.id} | ${q.subject}/${q.chapter}`)
    console.log(`Question: ${q.question}`)
    console.log(`Answer: ${(q.answer || '').substring(0, 100)}`)
    console.log(`CaseContext: ${(q.case_context || 'NULL').substring(0, 200)}`)
  }

  // Also fetch cd-q62, cd-q63 details
  const cdRes = await fetch(`${URL}/rest/v1/quiz_questions?select=id,question,answer,explanation,subject,chapter&or=(id.eq.cd-q62,id.eq.cd-q63)`, { headers: h })
  const cds = await cdRes.json()
  console.log(`\n${'═'.repeat(60)}`)
  console.log('CD DUPLICATES:')
  for (const q of cds) {
    console.log(`${q.id}: "${q.question.substring(0, 100)}" → ${q.answer}`)
  }
}

main().catch(e => console.error(e))
