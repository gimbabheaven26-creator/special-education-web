import { getClient } from './lib/supabase-client.mjs';

const supabase = getClient();

async function main() {
  console.log('=== 방향B 품질 감사 시작 ===\n')

  // 전체 문항 수
  const { count: total } = await supabase.from('quiz_questions').select('*', { count: 'exact', head: true })
  console.log(`전체 문항: ${total}건\n`)

  // 1. explanation이 짧은 문항 (30자 미만)
  const { data: allQ } = await supabase.from('quiz_questions').select('id, subject, type, explanation, wrong_explanations, tags')

  const shortExpl = allQ.filter(q => !q.explanation || q.explanation.length < 30)
  console.log(`[1] explanation < 30자: ${shortExpl.length}건`)
  if (shortExpl.length > 0) {
    shortExpl.slice(0, 20).forEach(q => console.log(`  - ${q.id} (${q.subject}/${q.type}): "${q.explanation?.slice(0,40)}"...`))
    if (shortExpl.length > 20) console.log(`  ... 외 ${shortExpl.length - 20}건`)
  }

  // 2. multiple인데 wrong_explanations 비어있는 문항
  const multipleNoWE = allQ.filter(q =>
    q.type === 'multiple' &&
    (!q.wrong_explanations || Object.keys(q.wrong_explanations).length === 0)
  )
  console.log(`\n[2] multiple이지만 wrong_explanations 없음: ${multipleNoWE.length}건`)
  if (multipleNoWE.length > 0) {
    multipleNoWE.slice(0, 20).forEach(q => console.log(`  - ${q.id} (${q.subject})`))
    if (multipleNoWE.length > 20) console.log(`  ... 외 ${multipleNoWE.length - 20}건`)
  }

  // 3. tags가 비어있는 문항
  const emptyTags = allQ.filter(q => !q.tags || Object.keys(q.tags).length === 0)
  console.log(`\n[3] tags 비어있음: ${emptyTags.length}건`)
  if (emptyTags.length > 0) {
    emptyTags.slice(0, 10).forEach(q => console.log(`  - ${q.id} (${q.subject})`))
    if (emptyTags.length > 10) console.log(`  ... 외 ${emptyTags.length - 10}건`)
  }

  // 4. fill_in/ox인데 wrong_explanations가 null이 아닌 경우
  const fillOxWithWE = allQ.filter(q =>
    (q.type === 'fill_in' || q.type === 'ox') &&
    q.wrong_explanations !== null
  )
  console.log(`\n[4] fill_in/ox인데 wrong_explanations NOT NULL: ${fillOxWithWE.length}건`)
  if (fillOxWithWE.length > 0) {
    fillOxWithWE.slice(0, 10).forEach(q => console.log(`  - ${q.id} (${q.subject}/${q.type})`))
  }

  // 5. 과목별 문항 분포
  const bySubject = {}
  allQ.forEach(q => { bySubject[q.subject] = (bySubject[q.subject] || 0) + 1 })
  console.log('\n[5] 과목별 분포:')
  Object.entries(bySubject).sort((a,b) => b[1]-a[1]).forEach(([s,c]) => console.log(`  ${s}: ${c}문항`))

  // 6. 유형별 분포
  const byType = {}
  allQ.forEach(q => { byType[q.type] = (byType[q.type] || 0) + 1 })
  console.log('\n[6] 유형별 분포:')
  Object.entries(byType).sort((a,b) => b[1]-a[1]).forEach(([t,c]) => console.log(`  ${t}: ${c}문항`))

  // 7. 난이도 분포
  const byDiff = {}
  allQ.forEach(q => { byDiff[q.difficulty] = (byDiff[q.difficulty] || 0) + 1 })
  console.log('\n[7] 난이도 분포:')
  Object.entries(byDiff).sort((a,b) => a[0]-b[0]).forEach(([d,c]) => console.log(`  난이도 ${d}: ${c}문항`))

  console.log('\n=== 품질 감사 완료 ===')
}

main().catch(console.error)
