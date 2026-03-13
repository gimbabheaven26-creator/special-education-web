/**
 * 새로 생성된 120개 퀴즈를 Supabase에 삽입
 * 실행: npx tsx scripts/insert-new-quizzes.ts
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = 'https://ssluhxvbyzqmdkbjwoke.supabase.co';
const SUPABASE_KEY = 'sb_publishable_aqOsWC1qTzUrKmb_YD3eUA_pA4rJu75';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface QuizRow {
  id: string;
  subject: string;
  chapter: string;
  type: string;
  question: string;
  case_context: string | null;
  options: string[] | null;
  answer: string;
  explanation: string;
  wrong_explanations: Record<string, string> | null;
  difficulty: number;
  source: string | null;
  tags: Record<string, unknown> | null;
}

const NEW_SUBJECTS = [
  {
    slug: 'visual-impairment',
    title: '시각장애',
    description: '시각장애 교육의 이론과 실제',
    icon: '👁️',
    color: '#6366F1',
    sort_order: 12,
    chapters: [
      { slug: 'braille', title: '점자 규정', description: '한글·영어 점자 체계와 점자 규정', keywords: ['점자', '훈맹정음', '점번호'], sort_order: 1 },
      { slug: 'orientation-mobility', title: '보행 훈련', description: '보행 기술과 이동 훈련 방법', keywords: ['흰지팡이', '인도보행', '독립보행'], sort_order: 2 },
      { slug: 'visual-acuity', title: '시력 측정', description: '시력 측정과 시야 검사', keywords: ['스넬렌', '시야', '저시력'], sort_order: 3 },
      { slug: 'visual-training', title: '시기능 훈련', description: '잔존 시력 활용과 시기능 훈련', keywords: ['CVI', '시효율', '시지각'], sort_order: 4 },
      { slug: 'assistive-tech', title: '보조공학', description: '시각장애 보조공학 기기 활용', keywords: ['확대경', '화면확대', '스크린리더'], sort_order: 5 },
    ],
  },
  {
    slug: 'hearing-impairment',
    title: '청각장애',
    description: '청각장애 교육의 이론과 실제',
    icon: '👂',
    color: '#EC4899',
    sort_order: 13,
    chapters: [
      { slug: 'audiogram', title: '청력도 해석', description: '청력 검사와 청력도 읽기', keywords: ['청력도', 'dB', '주파수'], sort_order: 1 },
      { slug: 'cochlear-implant', title: '인공와우', description: '인공와우 이식과 재활', keywords: ['인공와우', '매핑', '청각재활'], sort_order: 2 },
      { slug: 'hearing-aid', title: '보청기', description: '보청기 종류와 적합', keywords: ['보청기', '이득', '피드백'], sort_order: 3 },
      { slug: 'sign-language', title: '수어/지문자', description: '한국수어와 지문자 체계', keywords: ['수어', '지문자', '수지한국어'], sort_order: 4 },
      { slug: 'classroom', title: '교실 환경', description: '청각장애 학생을 위한 교실 환경', keywords: ['FM시스템', '소음', '시각자료'], sort_order: 5 },
    ],
  },
  {
    slug: 'physical-disability',
    title: '지체장애',
    description: '지체장애 교육의 이론과 실제',
    icon: '🦽',
    color: '#F59E0B',
    sort_order: 14,
    chapters: [
      { slug: 'cp-types', title: '뇌성마비 유형', description: '뇌성마비 분류와 특성', keywords: ['뇌성마비', '경직형', '불수의운동형'], sort_order: 1 },
      { slug: 'gmfcs', title: 'GMFCS 분류', description: '대운동기능분류체계', keywords: ['GMFCS', '운동기능', '이동성'], sort_order: 2 },
      { slug: 'primitive-reflexes', title: '원시반사', description: '원시반사와 자세반응', keywords: ['모로반사', 'ATNR', 'STNR'], sort_order: 3 },
      { slug: 'positioning', title: '자세보조/보조기기', description: '자세 보조 장치와 보조 기기', keywords: ['자세보조', '보조기기', '서기틀'], sort_order: 4 },
      { slug: 'muscular-dystrophy', title: '근이영양증', description: '근이영양증의 특성과 지원', keywords: ['듀센형', '가워스징후', '근위축'], sort_order: 5 },
    ],
  },
  {
    slug: 'communication-disorder',
    title: '의사소통장애',
    description: '의사소통장애 교육의 이론과 실제',
    icon: '💬',
    color: '#14B8A6',
    sort_order: 15,
    chapters: [
      { slug: 'articulation', title: '조음음운', description: '조음음운 장애의 평가와 중재', keywords: ['조음', '음운변동', '말소리'], sort_order: 1 },
      { slug: 'aac', title: 'AAC/보완대체의사소통', description: '보완대체의사소통 체계와 적용', keywords: ['AAC', 'PECS', '의사소통판'], sort_order: 2 },
      { slug: 'spontaneous-speech', title: '자발화 분석', description: '자발화 수집과 언어 분석', keywords: ['MLU', '자발화', 'TTR'], sort_order: 3 },
      { slug: 'emt', title: '환경중심 언어중재', description: '환경중심 언어중재 전략', keywords: ['EMT', '환경중심', '우발교수'], sort_order: 4 },
      { slug: 'fluency', title: '유창성 장애', description: '유창성 장애(말더듬)의 이해와 중재', keywords: ['말더듬', '유창성', '수정법'], sort_order: 5 },
    ],
  },
];

async function insertSubjectsAndChapters() {
  console.log('📚 신규 과목 4개 삽입...');

  const subjectRows = NEW_SUBJECTS.map((s) => ({
    slug: s.slug,
    title: s.title,
    description: s.description,
    icon: s.icon,
    color: s.color,
    sort_order: s.sort_order,
  }));

  const { error: subjectError } = await supabase
    .from('subjects')
    .upsert(subjectRows, { onConflict: 'slug' });

  if (subjectError) {
    console.error('❌ subjects 삽입 실패:', subjectError.message);
    return false;
  }
  console.log(`  ✅ ${subjectRows.length}개 과목 삽입 완료`);

  console.log('📖 신규 챕터 20개 삽입...');
  const chapterRows = NEW_SUBJECTS.flatMap((s) =>
    s.chapters.map((c) => ({
      subject_slug: s.slug,
      slug: c.slug,
      title: c.title,
      description: c.description,
      keywords: c.keywords,
      sort_order: c.sort_order,
    }))
  );

  const { error: chapterError } = await supabase
    .from('chapters')
    .upsert(chapterRows, { onConflict: 'subject_slug,slug' });

  if (chapterError) {
    // upsert 실패 시 개별 삽입 시도 (중복 무시)
    console.log('  ⚠️ upsert 실패, 개별 삽입 시도...');
    for (const row of chapterRows) {
      const { error } = await supabase.from('chapters').insert(row);
      if (error && !error.message.includes('duplicate')) {
        console.error(`  ❌ 챕터 ${row.slug} 실패:`, error.message);
      }
    }
  }
  console.log(`  ✅ ${chapterRows.length}개 챕터 삽입 완료`);

  return true;
}

async function insertNewQuizzes() {
  // 1단계: 신규 과목/챕터 삽입
  const subjectsOk = await insertSubjectsAndChapters();
  if (!subjectsOk) return;

  console.log('');

  // 2단계: 퀴즈 삽입
  const dataDir = join(__dirname, 'quiz-data');
  const files = readdirSync(dataDir).filter((f) => f.endsWith('.json'));

  console.log(`📂 ${files.length}개 파일 발견\n`);

  const allRows: QuizRow[] = [];

  for (const file of files) {
    const raw = readFileSync(join(dataDir, file), 'utf-8');
    const questions = JSON.parse(raw) as QuizRow[];

    for (const q of questions) {
      allRows.push({
        id: q.id,
        subject: q.subject,
        chapter: q.chapter,
        type: q.type,
        question: q.question,
        case_context: q.case_context ?? null,
        options: q.options ?? null,
        answer: String(q.answer),
        explanation: q.explanation,
        wrong_explanations: q.wrong_explanations ?? null,
        difficulty: q.difficulty,
        source: q.source ?? null,
        tags: q.tags ?? null,
      });
    }

    console.log(`  ${file}: ${questions.length}문항`);
  }

  console.log(`\n총 ${allRows.length}문항 삽입 시작...\n`);

  // ID 중복 체크
  const ids = allRows.map((r) => r.id);
  const uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size) {
    const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
    console.error(`❌ 중복 ID 발견: ${duplicates.join(', ')}`);
    return;
  }

  // 배치 삽입 (50개씩)
  let inserted = 0;
  for (let i = 0; i < allRows.length; i += 50) {
    const batch = allRows.slice(i, i + 50);
    const { error } = await supabase
      .from('quiz_questions')
      .upsert(batch, { onConflict: 'id' });

    if (error) {
      console.error(`❌ 배치 ${i}~${i + batch.length} 실패:`, error.message);
      return;
    }
    inserted += batch.length;
    console.log(`  ✅ ${inserted}/${allRows.length} 삽입 완료`);
  }

  // 검증
  const { count, error: countError } = await supabase
    .from('quiz_questions')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('❌ 검증 실패:', countError.message);
    return;
  }

  console.log(`\n🎉 삽입 완료!`);
  console.log(`  신규 삽입: ${allRows.length}문항`);
  console.log(`  DB 전체 퀴즈 수: ${count}문항`);
}

insertNewQuizzes().catch(console.error);
