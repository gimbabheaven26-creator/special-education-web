import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

const SUPABASE_URL = 'https://ssluhxvbyzqmdkbjwoke.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY env var required')
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// 1. Insert new subjects
const newSubjects = [
  { slug: 'visual-impairment', title: '시각장애', description: '시각장애 교육의 이론과 실제', icon: '👁️', color: '#6366F1', sort_order: 12 },
  { slug: 'hearing-impairment', title: '청각장애', description: '청각장애 교육의 이론과 실제', icon: '👂', color: '#EC4899', sort_order: 13 },
  { slug: 'physical-disability', title: '지체장애', description: '지체장애 교육의 이론과 실제', icon: '🦽', color: '#F59E0B', sort_order: 14 },
  { slug: 'communication-disorder', title: '의사소통장애', description: '의사소통장애 교육의 이론과 실제', icon: '💬', color: '#14B8A6', sort_order: 15 },
]

// 2. Insert new chapters
const newChapters = [
  { subject_slug: 'visual-impairment', slug: 'braille', title: '점자 규정', description: '한글·영어 점자 체계와 점자 규정', keywords: ['점자','훈맹정음','점번호'], sort_order: 1 },
  { subject_slug: 'visual-impairment', slug: 'orientation-mobility', title: '보행 훈련', description: '보행 기술과 이동 훈련 방법', keywords: ['흰지팡이','인도보행','독립보행'], sort_order: 2 },
  { subject_slug: 'visual-impairment', slug: 'visual-acuity', title: '시력 측정', description: '시력 측정과 시야 검사', keywords: ['스넬렌','시야','저시력'], sort_order: 3 },
  { subject_slug: 'visual-impairment', slug: 'visual-training', title: '시기능 훈련', description: '잔존 시력 활용과 시기능 훈련', keywords: ['CVI','시효율','시지각'], sort_order: 4 },
  { subject_slug: 'visual-impairment', slug: 'assistive-tech', title: '보조공학', description: '시각장애 보조공학 기기 활용', keywords: ['확대경','화면확대','스크린리더'], sort_order: 5 },
  { subject_slug: 'hearing-impairment', slug: 'audiogram', title: '청력도 해석', description: '청력 검사와 청력도 읽기', keywords: ['청력도','dB','주파수'], sort_order: 1 },
  { subject_slug: 'hearing-impairment', slug: 'cochlear-implant', title: '인공와우', description: '인공와우 이식과 재활', keywords: ['인공와우','매핑','청각재활'], sort_order: 2 },
  { subject_slug: 'hearing-impairment', slug: 'hearing-aid', title: '보청기', description: '보청기 종류와 적합', keywords: ['보청기','이득','피드백'], sort_order: 3 },
  { subject_slug: 'hearing-impairment', slug: 'sign-language', title: '수어/지문자', description: '한국수어와 지문자 체계', keywords: ['수어','지문자','수지한국어'], sort_order: 4 },
  { subject_slug: 'hearing-impairment', slug: 'classroom', title: '교실 환경', description: '청각장애 학생을 위한 교실 환경', keywords: ['FM시스템','소음','시각자료'], sort_order: 5 },
  { subject_slug: 'physical-disability', slug: 'cp-types', title: '뇌성마비 유형', description: '뇌성마비 분류와 특성', keywords: ['뇌성마비','경직형','불수의운동형'], sort_order: 1 },
  { subject_slug: 'physical-disability', slug: 'gmfcs', title: 'GMFCS 분류', description: '대운동기능분류체계', keywords: ['GMFCS','운동기능','이동성'], sort_order: 2 },
  { subject_slug: 'physical-disability', slug: 'primitive-reflexes', title: '원시반사', description: '원시반사와 자세반응', keywords: ['모로반사','ATNR','STNR'], sort_order: 3 },
  { subject_slug: 'physical-disability', slug: 'positioning', title: '자세보조/보조기기', description: '자세 보조 장치와 보조 기기', keywords: ['자세보조','보조기기','서기틀'], sort_order: 4 },
  { subject_slug: 'physical-disability', slug: 'muscular-dystrophy', title: '근이영양증', description: '근이영양증의 특성과 지원', keywords: ['듀센형','가워스징후','근위축'], sort_order: 5 },
  { subject_slug: 'communication-disorder', slug: 'articulation', title: '조음음운', description: '조음음운 장애의 평가와 중재', keywords: ['조음','음운변동','말소리'], sort_order: 1 },
  { subject_slug: 'communication-disorder', slug: 'aac', title: 'AAC/보완대체의사소통', description: '보완대체의사소통 체계와 적용', keywords: ['AAC','PECS','의사소통판'], sort_order: 2 },
  { subject_slug: 'communication-disorder', slug: 'spontaneous-speech', title: '자발화 분석', description: '자발화 수집과 언어 분석', keywords: ['MLU','자발화','TTR'], sort_order: 3 },
  { subject_slug: 'communication-disorder', slug: 'emt', title: '환경중심 언어중재', description: '환경중심 언어중재 전략', keywords: ['EMT','환경중심','우발교수'], sort_order: 4 },
  { subject_slug: 'communication-disorder', slug: 'fluency', title: '유창성 장애', description: '유창성 장애(말더듬)의 이해와 중재', keywords: ['말더듬','유창성','수정법'], sort_order: 5 },
]

async function main() {
  console.log('=== 퀴즈 데이터 삽입 시작 ===\n')

  // Step 1: Insert subjects
  console.log('1. 과목 삽입 중...')
  const { error: subjectError } = await supabase
    .from('subjects')
    .upsert(newSubjects, { onConflict: 'slug' })
  if (subjectError) {
    console.error('과목 삽입 실패:', subjectError)
    return
  }
  console.log(`   ${newSubjects.length}개 과목 삽입 완료`)

  // Step 2: Insert chapters
  console.log('2. 챕터 삽입 중...')
  const { error: chapterError } = await supabase
    .from('chapters')
    .upsert(newChapters, { onConflict: 'subject_slug,slug' })
  if (chapterError) {
    console.error('챕터 삽입 실패:', chapterError)
    return
  }
  console.log(`   ${newChapters.length}개 챕터 삽입 완료`)

  // Step 3: Read and insert quiz questions from JSON files
  console.log('3. 퀴즈 문항 삽입 중...')
  const dataDir = join(import.meta.dirname, 'quiz-data')
  const files = readdirSync(dataDir).filter(f => f.endsWith('.json'))

  const seenIds = new Set()
  let totalInserted = 0
  let duplicateSkipped = 0

  for (const file of files) {
    const filePath = join(dataDir, file)
    const raw = JSON.parse(readFileSync(filePath, 'utf-8'))
    const questions = Array.isArray(raw) ? raw : (raw.questions || [])

    const uniqueQuestions = questions.filter(q => {
      if (seenIds.has(q.id)) {
        duplicateSkipped++
        return false
      }
      seenIds.add(q.id)
      return true
    })

    if (uniqueQuestions.length === 0) continue

    // Upsert in batches of 50
    for (let i = 0; i < uniqueQuestions.length; i += 50) {
      const batch = uniqueQuestions.slice(i, i + 50)
      const { error } = await supabase
        .from('quiz_questions')
        .upsert(batch, { onConflict: 'id' })

      if (error) {
        console.error(`   ${file} 삽입 실패:`, error)
        continue
      }
    }
    totalInserted += uniqueQuestions.length
    console.log(`   ${file}: ${uniqueQuestions.length}문항`)
  }

  console.log(`\n=== 완료 ===`)
  console.log(`총 삽입: ${totalInserted}문항`)
  console.log(`중복 스킵: ${duplicateSkipped}문항`)

  // Step 4: Verify counts
  console.log('\n=== 검증 ===')
  const { count } = await supabase
    .from('quiz_questions')
    .select('*', { count: 'exact', head: true })
  console.log(`quiz_questions 전체 레코드 수: ${count}`)

  const { data: subjectCounts } = await supabase
    .from('quiz_questions')
    .select('subject')
  if (subjectCounts) {
    const counts = {}
    for (const row of subjectCounts) {
      counts[row.subject] = (counts[row.subject] || 0) + 1
    }
    console.log('과목별 문항 수:', JSON.stringify(counts, null, 2))
  }
}

main().catch(console.error)
