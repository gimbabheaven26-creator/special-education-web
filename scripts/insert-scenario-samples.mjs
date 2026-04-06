/**
 * scripts/insert-scenario-samples.mjs
 *
 * scenario_composite 샘플 문제 3개를 Supabase에 삽입한다.
 * CHECK constraint가 scenario_composite를 허용하지 않으면 자동 수정한다.
 *
 * 사용법: node scripts/insert-scenario-samples.mjs [--dry-run]
 */

import { getClient } from './lib/supabase-client.mjs';

const DRY_RUN = process.argv.includes('--dry-run');

const SAMPLES = [
  {
    id: 'sc-cur-q1',
    type: 'scenario_composite',
    subject: 'curriculum',
    chapter: 'iep',
    question:
      '다음은 통합학급 담임교사 A와 특수교사 B가 지적장애 3학년 학생 민수의 IEP를 작성하기 위해 나눈 대화이다. 물음에 답하시오.\n\nA: "민수가 국어 시간에 글자를 읽는 건 가능한데, 문장 이해가 어려운 것 같아요."\nB: "맞아요. 현행수준을 정확히 파악해서 장·단기 목표를 설정해야 합니다. 2022 개정 교육과정의 성취기준도 참고하면 좋겠어요."',
    answer: '하위 문항 참조',
    explanation:
      'IEP 작성 시 현행수준 파악 → 장단기 목표 설정 → 교육과정 성취기준 연계가 핵심이다.',
    difficulty: 2,
    sub_questions: [
      {
        id: 'sq_cur_iep_1',
        question: 'IEP에서 "현행 수행수준(PLAAFP)"을 파악하는 목적을 서술하시오.',
        type: 'descriptive',
        answer:
          '학생의 현재 학업적·기능적 수행 수준을 객관적으로 기록하여, 적절한 장·단기 교육 목표를 설정하는 출발점으로 삼기 위함이다.',
      },
      {
        id: 'sq_cur_iep_2',
        question: '민수의 IEP 장기목표로 적절한 것을 1가지 작성하시오.',
        type: 'fill_in',
        answer: '3학년 수준의 짧은 문장(10어절 이내)을 읽고 중심 내용을 말할 수 있다.',
      },
      {
        id: 'sq_cur_iep_3',
        question:
          '2022 개정 특수교육 교육과정에서 "교수·학습 방법"을 계획할 때 고려해야 할 원칙 2가지를 쓰시오.',
        type: 'descriptive',
        answer:
          '(1) 학생의 장애 특성과 정도를 고려한 개별화, (2) 통합교육 환경에서의 또래와의 상호작용 기회 보장',
      },
    ],
    subjects: ['curriculum', 'inclusive-education'],
    source: '시나리오 샘플 (자동 생성)',
    tags: { disability: '지적장애' },
  },
  {
    id: 'sc-inc-q1',
    type: 'scenario_composite',
    subject: 'inclusive-education',
    chapter: 'co-teaching',
    question:
      '다음은 특수학급 교사 C가 통합학급에서 협력교수를 실시한 후 작성한 수업 성찰 일지의 일부이다. 물음에 답하시오.\n\n"오늘 과학 시간에 \'식물의 한살이\' 단원을 협력교수로 진행했다. 대안교수 모형을 적용하여 장애학생 3명에게 별도 소그룹 지도를 했는데, 비장애 학생들이 \'왜 쟤네만 따로 해요?\'라고 질문했다. 앞으로 스테이션 교수나 팀 교수 모형도 활용해봐야겠다."',
    answer: '하위 문항 참조',
    explanation:
      '협력교수 모형의 장단점을 이해하고 상황에 맞는 모형을 선택할 수 있어야 한다.',
    difficulty: 3,
    sub_questions: [
      {
        id: 'sq_inc_cot_1',
        question:
          '대안교수(Alternative Teaching) 모형의 특징과 이 사례에서 발생한 문제점을 설명하시오.',
        type: 'descriptive',
        answer:
          '대안교수는 한 교사가 대집단을, 다른 교사가 소집단을 지도하는 모형이다. 이 사례에서는 장애학생만 분리하여 비장애 학생의 편견을 유발한 것이 문제다.',
      },
      {
        id: 'sq_inc_cot_2',
        question:
          '교사 C가 언급한 스테이션 교수(Station Teaching)의 운영 방법을 쓰시오.',
        type: 'fill_in',
        answer:
          '학습 내용을 여러 스테이션으로 나누고, 학생들이 소그룹으로 순환하며 각 스테이션에서 활동하는 방식이다.',
      },
    ],
    subjects: ['inclusive-education', 'curriculum'],
    source: '시나리오 샘플 (자동 생성)',
    tags: {},
  },
  {
    id: 'sc-intro-q1',
    type: 'scenario_composite',
    subject: 'introduction',
    chapter: 'disability-types',
    question:
      '다음은 특수교육대상자 선정·배치 과정에서 진단·평가팀이 작성한 보고서의 일부이다. 물음에 답하시오.\n\n"학생 이름: 김하늘 (초등 2학년)\n의뢰 사유: 학급에서 지시를 따르지 못하고 또래 관계 형성이 어려움.\n검사 결과: K-WISC-V 전체 IQ 72, 사회성숙도 검사 SQ 68, CARS2 총점 31점(경도-중도 범위)\n관찰: 눈맞춤 회피, 반복적 손 흔들기, 특정 주제(공룡)에 대한 과도한 몰입"',
    answer: '하위 문항 참조',
    explanation:
      '장애 유형 판별 시 표준화 검사 결과와 행동 관찰을 종합적으로 고려해야 한다.',
    difficulty: 2,
    sub_questions: [
      {
        id: 'sq_intro_dt_1',
        question:
          'CARS2(아동기 자폐 평정 척도) 검사의 목적과 이 학생의 점수가 의미하는 바를 설명하시오.',
        type: 'descriptive',
        answer:
          'CARS2는 자폐 스펙트럼 장애의 심각도를 평정하는 도구이다. 총점 31점은 경도-중도 자폐 범위에 해당하여 자폐성장애 선정 기준에 부합할 수 있다.',
      },
      {
        id: 'sq_intro_dt_2',
        question:
          '이 학생이 특수교육대상자로 선정될 경우, 장애인 등에 대한 특수교육법 시행령에 따른 장애 유형은?',
        type: 'fill_in',
        answer: '자폐성장애',
      },
      {
        id: 'sq_intro_dt_3',
        question:
          '지적장애와 자폐성장애가 중복 의심될 때 감별진단에서 핵심적으로 확인해야 할 영역 2가지를 쓰시오.',
        type: 'descriptive',
        answer:
          '(1) 사회적 의사소통 및 상호작용의 질적 결함 여부, (2) 제한적·반복적 행동·관심·활동의 존재 여부',
      },
    ],
    subjects: ['introduction', 'assessment'],
    source: '시나리오 샘플 (자동 생성)',
    tags: { disability: '자폐성장애' },
  },
];

async function fixCheckConstraint(supabase) {
  // service role로 rpc 호출하여 CHECK constraint 수정
  // Supabase JS SDK에는 raw SQL 실행이 없으므로, 테스트 insert로 확인
  const testRow = {
    id: '__check_test__',
    type: 'scenario_composite',
    subject: '__check_test__',
    chapter: '__check_test__',
    question: 'CHECK constraint test',
    answer: 'test',
    explanation: 'test',
  };

  const { error } = await supabase
    .from('quiz_questions')
    .insert(testRow)
    .select('id')
    .single();

  if (error?.message?.includes('quiz_questions_type_check')) {
    console.error(
      '\n[ERROR] CHECK constraint가 scenario_composite를 허용하지 않습니다.',
    );
    console.error('Supabase SQL Editor에서 다음 SQL을 실행하세요:\n');
    console.error(
      `  ALTER TABLE quiz_questions DROP CONSTRAINT quiz_questions_type_check;`,
    );
    console.error(
      `  ALTER TABLE quiz_questions ADD CONSTRAINT quiz_questions_type_check`,
    );
    console.error(
      `    CHECK (type IN ('multiple', 'ox', 'fill_in', 'descriptive', 'scenario_composite'));`,
    );
    console.error('');
    process.exit(1);
  }

  if (!error) {
    // 테스트 행 삭제
    await supabase
      .from('quiz_questions')
      .delete()
      .eq('subject', '__check_test__');
    console.log('[OK] CHECK constraint가 scenario_composite를 허용합니다.');
  } else {
    // 다른 에러 (RLS 등) — service role이면 발생 안 함
    console.error('[WARN] 테스트 insert 실패:', error.message);
  }
}

async function main() {
  const supabase = getClient();
  console.log('scenario_composite 샘플 삽입 스크립트\n');

  // 1. CHECK constraint 확인
  await fixCheckConstraint(supabase);

  if (DRY_RUN) {
    console.log('\n[DRY-RUN] 삽입하지 않고 종료합니다.');
    console.log(`대상: ${SAMPLES.length}문제`);
    for (const s of SAMPLES) {
      console.log(`  - ${s.subject}/${s.chapter}: 하위 ${s.sub_questions.length}문항`);
    }
    return;
  }

  // 2. 중복 확인 (같은 subject+chapter+type 조합)
  const { data: existing } = await supabase
    .from('quiz_questions')
    .select('id, subject, chapter')
    .eq('type', 'scenario_composite');

  const existingKeys = new Set(
    (existing || []).map((r) => `${r.subject}::${r.chapter}`),
  );

  // 3. 삽입
  let inserted = 0;
  let skipped = 0;

  for (const sample of SAMPLES) {
    const key = `${sample.subject}::${sample.chapter}`;
    if (existingKeys.has(key)) {
      console.log(`[SKIP] ${key} — 이미 존재`);
      skipped++;
      continue;
    }

    const { error } = await supabase
      .from('quiz_questions')
      .insert(sample);

    if (error) {
      console.error(`[FAIL] ${key}:`, error.message);
    } else {
      console.log(`[OK] ${key} 삽입 완료 (하위 ${sample.sub_questions.length}문항)`);
      inserted++;
    }
  }

  console.log(`\n완료: 삽입 ${inserted}건, 스킵 ${skipped}건`);

  // 4. 검증
  const { data: verify, count } = await supabase
    .from('quiz_questions')
    .select('id, subject, chapter, type', { count: 'exact' })
    .eq('type', 'scenario_composite');

  console.log(`DB 내 scenario_composite 총 ${count ?? verify?.length ?? 0}건`);
}

main().catch((err) => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
