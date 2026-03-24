/**
 * insert-ebd-fill-in.mjs
 * 정서행동장애 fill_in — 단일 빈칸 기준으로 전면 재구성
 * 실행: node scripts/insert-ebd-fill-in.mjs
 *
 * answer 규칙:
 *   단일 빈칸: "정답" 또는 "정답,동의어"
 *   복수 표기 동의어만 허용: "정답1,정답2" (같은 개념의 다른 표기)
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
const get = k => env.match(new RegExp(`^${k}=(.+)$`, 'm'))?.[1]?.trim();
const sb = createClient(get('NEXT_PUBLIC_SUPABASE_URL'), get('SUPABASE_SERVICE_ROLE_KEY'), {
  auth: { autoRefreshToken: false, persistSession: false }
});

const DELETE_IDS = Array.from({ length: 20 }, (_, i) => `ebd-q${i + 1}`);

const QUESTIONS = [
  // ── 기초이론 ──
  {
    id: 'ebd-q1',
    subject: 'emotional-behavioral',
    chapter: '기초이론',
    type: 'fill_in',
    question: 'K-CBCL 분류에서 불안·우울·위축 등 눈에 띄지 않아 심화 위험이 높은 유형을 ___장애라 한다.',
    answer: '내재화',
    explanation: 'K-CBCL은 행동을 내재화(과잉 통제)와 외현화(통제 결여)로 분류한다. 내재화 장애는 겉으로 드러나지 않아 조기 발견이 어렵다.',
    difficulty: 1,
    options: null,
    wrong_explanations: null,
  },
  {
    id: 'ebd-q2',
    subject: 'emotional-behavioral',
    chapter: '기초이론',
    type: 'fill_in',
    question: 'K-CBCL 분류에서 규칙 위반·공격 행동 등 타인·환경에 표출되는 유형을 ___장애라 한다.',
    answer: '외현화',
    explanation: '외현화 장애는 행동이 타인을 향해 표출되어 식별이 상대적으로 쉽다. K-CBCL의 외현화 척도는 규칙 위반과 공격 행동으로 구성된다.',
    difficulty: 1,
    options: null,
    wrong_explanations: null,
  },
  {
    id: 'ebd-q3',
    subject: 'emotional-behavioral',
    chapter: '기초이론',
    type: 'fill_in',
    question: 'SSBD 1단계에서 담임교사는 외현화·내재화 아동을 각각 ___명씩 추천한다.',
    answer: '3',
    explanation: 'SSBD 1단계: 담임교사가 외현화 3명, 내재화 3명 추천. 2단계: CEI·CFI 작성. 3단계: 특수교사가 직접 관찰 후 개별화 교육 의뢰.',
    difficulty: 1,
    options: null,
    wrong_explanations: null,
  },
  {
    id: 'ebd-q4',
    subject: 'emotional-behavioral',
    chapter: '기초이론',
    type: 'fill_in',
    question: 'Ainsworth의 애착 유형 중 양육자의 일관성 없는 양육으로 형성되며 분리 시 강하게 저항하는 유형을 ___ 애착이라 한다.',
    answer: '저항',
    explanation: '저항 애착은 일관성 없는 양육에 의해 형성된다. 4가지 유형 중 안정 > 회피 > 저항 > 혼란 순으로 안정성이 낮아진다.',
    difficulty: 1,
    options: null,
    wrong_explanations: null,
  },
  {
    id: 'ebd-q5',
    subject: 'emotional-behavioral',
    chapter: '기초이론',
    type: 'fill_in',
    question: '생태학적 모델에서 지역사회 전문가·가족·학교가 공동으로 협력하는 사회적 체계 중재 방식을 ___(이)라 한다.',
    answer: '랩어라운드,wraparound',
    explanation: '랩어라운드(wraparound)는 생태학적 모델의 사회적 체계 중재다. RE-ED 프로젝트, CASSP와 함께 3대 사회적 체계 중재에 속한다.',
    difficulty: 2,
    options: null,
    wrong_explanations: null,
  },

  // ── 불안장애 ──
  {
    id: 'ebd-q6',
    subject: 'emotional-behavioral',
    chapter: '불안장애',
    type: 'fill_in',
    question: '불안장애 중재 시 공포 자극을 위계 구성하여 약한 것부터 강한 것 순으로 점진적으로 노출하는 기법을 ___(이)라 한다.',
    answer: '체계적 둔감법',
    explanation: '체계적 둔감법은 이완 훈련과 위계적 노출을 병행한다. 처음부터 가장 강한 자극에 노출하는 정동 홍수법(flooding)과 대비된다.',
    difficulty: 1,
    options: null,
    wrong_explanations: null,
  },
  {
    id: 'ebd-q7',
    subject: 'emotional-behavioral',
    chapter: '불안장애',
    type: 'fill_in',
    question: '불안장애 중재 초기부터 가장 심한 자극에 오랫동안 노출하여 불안 반응을 약화시키는 기법을 ___(이)라 한다.',
    answer: '정동 홍수법,flooding',
    explanation: '정동 홍수법(flooding)은 점진적 위계 없이 처음부터 최대 자극에 노출한다. 체계적 둔감법(약한→강한)과의 비교가 자주 출제된다.',
    difficulty: 1,
    options: null,
    wrong_explanations: null,
  },
  {
    id: 'ebd-q8',
    subject: 'emotional-behavioral',
    chapter: '불안장애',
    type: 'fill_in',
    question: '분리불안장애는 아동·청소년의 경우 ___ 이상 증상이 지속되어야 진단된다.',
    answer: '4주',
    explanation: '분리불안장애 증상 지속 기간: 아동·청소년 4주, 성인 6개월. 선택적 함묵증(1개월), 사회적 불안장애·GAD(6개월)와 구분해야 한다.',
    difficulty: 2,
    options: null,
    wrong_explanations: null,
  },

  // ── 외상장애 ──
  {
    id: 'ebd-q9',
    subject: 'emotional-behavioral',
    chapter: '외상장애',
    type: 'fill_in',
    question: '반응성 애착장애는 만 ___ 이전에 나타나야 진단 가능하다.',
    answer: '5세',
    explanation: '반응성 애착장애 진단 기준 E: 만 5세 이전 발생, 발달 연령 9개월 이상. 극단적으로 불충분한 양육(방치, 주 양육자 반복 교체 등)이 원인이다.',
    difficulty: 2,
    options: null,
    wrong_explanations: null,
  },
  {
    id: 'ebd-q10',
    subject: 'emotional-behavioral',
    chapter: '외상장애',
    type: 'fill_in',
    question: 'PTSD 진단 기준 중 기준 D(인지·기분의 부정적 변화)는 ___ 이상의 증상이 충족되어야 한다.',
    answer: '2가지,2개',
    explanation: 'PTSD 클러스터별 최소 증상 수: B(침습) 1가지 이상, C(회피) 지속적, D(인지·기분) 2가지 이상, E(각성) 2가지 이상. D와 E 모두 2가지가 기준이다.',
    difficulty: 2,
    options: null,
    wrong_explanations: null,
  },

  // ── 강박장애 ──
  {
    id: 'ebd-q11',
    subject: 'emotional-behavioral',
    chapter: '강박장애',
    type: 'fill_in',
    question: 'OCD에서 원하지 않는 비합리적 생각이 반복되는 것을 ___(이)라 한다.',
    answer: '강박 사고',
    explanation: '강박 사고(obsession)는 원하지 않지만 반복되는 비합리적 생각이다. 이와 달리 강박 행동(compulsion)은 어쩔 수 없이 반복하게 되는 정형화된 행동이다.',
    difficulty: 1,
    options: null,
    wrong_explanations: null,
  },
  {
    id: 'ebd-q12',
    subject: 'emotional-behavioral',
    chapter: '강박장애',
    type: 'fill_in',
    question: 'OCD에서 어쩔 수 없이 반복하게 되는 정형화된 행동을 ___(이)라 한다.',
    answer: '강박 행동,충동',
    explanation: '강박 행동(compulsion, 충동)은 반복적이고 정형화된 행동 또는 정신적 행동이다. 아동은 성인과 달리 자신의 행동이 비합리적임을 깨닫지 못하기도 한다.',
    difficulty: 1,
    options: null,
    wrong_explanations: null,
  },
  {
    id: 'ebd-q13',
    subject: 'emotional-behavioral',
    chapter: '강박장애',
    type: 'fill_in',
    question: '신체추형장애는 강박-충동 관련 장애의 하위 유형으로, ___ 장애를 함께 가질 가능성이 높다.',
    answer: '주요 우울',
    explanation: '신체추형장애는 타인이 관찰하기 어려운 외모 결함에 과도하게 집착하며 주요 우울장애와 공존율이 높다. DSM-5에서 불안장애가 아닌 강박-충동 관련 장애로 분류된다.',
    difficulty: 2,
    options: null,
    wrong_explanations: null,
  },

  // ── 우울양극성 ──
  {
    id: 'ebd-q14',
    subject: 'emotional-behavioral',
    chapter: '우울양극성',
    type: 'fill_in',
    question: '주요 우울장애는 DSM-5 우울 기준 9가지 중 ___가지 이상을 만족해야 한다.',
    answer: '5',
    explanation: '주요 우울장애: 9가지 중 5가지 이상, 2주 이상 지속, 우울 기분 또는 흥미·즐거움 상실 중 하나 필수 포함.',
    difficulty: 1,
    options: null,
    wrong_explanations: null,
  },
  {
    id: 'ebd-q15',
    subject: 'emotional-behavioral',
    chapter: '우울양극성',
    type: 'fill_in',
    question: '양극성 장애 I과 달리 양극성 장애 II에는 ___ 삽화가 없다.',
    answer: '조증',
    explanation: '양극성 I vs II의 핵심 차이: I은 조증 삽화 있음, II는 조증 없이 경조증 + 주요 우울장애 조합. 조증 삽화가 단 한 번이라도 있으면 II가 아닌 I로 진단한다.',
    difficulty: 2,
    options: null,
    wrong_explanations: null,
  },
  {
    id: 'ebd-q16',
    subject: 'emotional-behavioral',
    chapter: '우울양극성',
    type: 'fill_in',
    question: '파괴적 기분조절장애는 심한 울화 폭발이 주 평균 ___ 이상 반복되어야 진단 기준을 충족한다.',
    answer: '3회',
    explanation: '파괴적 기분조절장애(DSM-5 신규): 주 평균 3회 이상, 12개월 이상 지속, 12세 이전 아동. 청소년기 이전 아동의 과다한 양극성 장애 진단 예방을 위해 도입됐다.',
    difficulty: 2,
    options: null,
    wrong_explanations: null,
  },

  // ── 품행장애 ──
  {
    id: 'ebd-q17',
    subject: 'emotional-behavioral',
    chapter: '품행장애',
    type: 'fill_in',
    question: '적대적 반항장애(ODD)는 반항적·도발적 행동을 보이지만 ___ 위반이 없다는 점에서 품행장애와 구별된다.',
    answer: '사회 규범',
    explanation: 'ODD는 사회 규범 위반과 타인의 기본 권리 침해가 없다는 점이 품행장애(CD)와의 핵심 변별 기준이다.',
    difficulty: 1,
    options: null,
    wrong_explanations: null,
  },
  {
    id: 'ebd-q18',
    subject: 'emotional-behavioral',
    chapter: '품행장애',
    type: 'fill_in',
    question: '품행장애 발달 경로 중 사소한 공격 → 신체적 싸움 → 폭력으로 이어지는 경로를 ___ 경로라 한다.',
    answer: '외현',
    explanation: '품행장애 3가지 발달 경로: 외현 경로(공격→싸움→폭력), 내재 경로(내재화 행동→기물 파괴→비행), 권위 갈등 경로(고집→반항→권위 회피).',
    difficulty: 2,
    options: null,
    wrong_explanations: null,
  },
  {
    id: 'ebd-q19',
    subject: 'emotional-behavioral',
    chapter: '품행장애',
    type: 'fill_in',
    question: '품행장애 발달 경로 중 사소한 내재화 행동 → 기물 파괴 → 심각한 비행으로 이어지는 경로를 ___ 경로라 한다.',
    answer: '내재',
    explanation: '내재 경로는 겉으로 드러나지 않는 내재화 행동에서 시작해 기물 파괴를 거쳐 비행으로 발전한다. 외현 경로(공격→폭력)와 혼동하지 않아야 한다.',
    difficulty: 2,
    options: null,
    wrong_explanations: null,
  },

  // ── 인지행동중재 ──
  {
    id: 'ebd-q20',
    subject: 'emotional-behavioral',
    chapter: '인지행동중재',
    type: 'fill_in',
    question: 'CBI 자기 관리 훈련 중 사전에 선정된 준거와 자신의 행동을 비교하는 기법을 ___(이)라 한다.',
    answer: '자기 평가',
    explanation: 'CBI 자기 관리 4가지: 자기 교수(내적 언어), 자기 기록(스스로 측정·기록), 자기 평가(준거와 비교), 자기 강화(목표 달성 시 스스로 보상).',
    difficulty: 2,
    options: null,
    wrong_explanations: null,
  },
  {
    id: 'ebd-q21',
    subject: 'emotional-behavioral',
    chapter: '인지행동중재',
    type: 'fill_in',
    question: 'CBI 자기 관리 훈련 중 목표 달성 시 스스로 선택한 강화제를 제공하는 기법을 ___(이)라 한다.',
    answer: '자기 강화',
    explanation: '자기 강화는 외부 통제 없이 스스로 보상을 결정하고 제공한다. 강화 기준을 지나치게 낮게 설정하지 않도록 지도가 필요하다.',
    difficulty: 2,
    options: null,
    wrong_explanations: null,
  },
  {
    id: 'ebd-q22',
    subject: 'emotional-behavioral',
    chapter: '인지행동중재',
    type: 'fill_in',
    question: 'REBT에서 선행사건(A)이 아닌 A에 대한 ___(이) 부정적 결과(C)를 결정한다.',
    answer: '신념,B',
    explanation: 'REBT(합리적 정서 행동 치료)의 핵심: A→C가 아닌 A→B→C 구조. 비합리적 신념(B)을 논박(D)하여 합리적 신념으로 바꿀 때 효과(E)가 나타난다.',
    difficulty: 2,
    options: null,
    wrong_explanations: null,
  },
  {
    id: 'ebd-q23',
    subject: 'emotional-behavioral',
    chapter: '인지행동중재',
    type: 'fill_in',
    question: '자기 교수 5단계 중 교사가 큰 소리로 자기 교수를 시범 보이는 1단계를 ___(이)라 한다.',
    answer: '인지적 모델링',
    explanation: '자기 교수 5단계: ①인지적 모델링(교사 시범) → ②모델의 외현적 지도 → ③아동의 외현적 자기 교수 → ④외현적 자기 교수의 용암 → ⑤내면적 자기 교수.',
    difficulty: 2,
    options: null,
    wrong_explanations: null,
  },
  {
    id: 'ebd-q24',
    subject: 'emotional-behavioral',
    chapter: '인지행동중재',
    type: 'fill_in',
    question: '자기 교수 5단계 중 학생이 내적 언어로만 수행하는 마지막 단계를 ___(이)라 한다.',
    answer: '내면적 자기 교수',
    explanation: '내면적 자기 교수는 자기 교수의 최종 목표 단계다. 4단계(용암)에서는 속삭이는 목소리로 점차 줄여가다가 5단계에서 완전히 내면화된다.',
    difficulty: 2,
    options: null,
    wrong_explanations: null,
  },

  // ── 기타(ADHD·틱) ──
  {
    id: 'ebd-q25',
    subject: 'emotional-behavioral',
    chapter: '기타',
    type: 'fill_in',
    question: '뚜렛 장애는 여러 개의 운동 틱과 하나 이상의 ___ 틱이 동시에 나타나는 장애다.',
    answer: '음성',
    explanation: '뚜렛 장애의 핵심: 운동 틱 + 음성 틱 동시 존재. 만성 틱 장애는 운동·음성 중 하나만 나타난다. 두 장애 모두 1년 이상 지속이 기준이다.',
    difficulty: 1,
    options: null,
    wrong_explanations: null,
  },
  {
    id: 'ebd-q26',
    subject: 'emotional-behavioral',
    chapter: '기타',
    type: 'fill_in',
    question: '뚜렛 장애는 운동 틱과 음성 틱이 ___ 이상 지속되어야 진단된다.',
    answer: '1년',
    explanation: '틱 장애 지속 기간: 잠정적 틱(1년 미만), 만성 틱·뚜렛(1년 이상). 뚜렛은 만성 틱과 달리 운동 + 음성 틱이 모두 있어야 한다.',
    difficulty: 1,
    options: null,
    wrong_explanations: null,
  },
];

async function main() {
  console.log('=== 정서행동장애 fill_in 재구성 ===\n');

  // Step 1: 기존 문항 삭제
  console.log(`[1/2] 기존 ${DELETE_IDS.length}문항 삭제...`);
  const { error: delError } = await sb
    .from('quiz_questions')
    .delete()
    .in('id', DELETE_IDS);

  if (delError) {
    console.error('❌ 삭제 실패:', delError.message);
    process.exit(1);
  }
  console.log(`✅ 삭제 완료\n`);

  // Step 2: 새 문항 삽입
  console.log(`[2/2] 새 문항 ${QUESTIONS.length}개 삽입...`);
  let success = 0;
  const errors = [];

  for (const q of QUESTIONS) {
    const { error } = await sb.from('quiz_questions').insert(q);
    if (error) {
      errors.push({ id: q.id, error: error.message });
      console.error(`  ❌ ${q.id}: ${error.message}`);
    } else {
      success++;
      console.log(`  ✅ ${q.id} (${q.chapter}) — A: "${q.answer}"`);
    }
  }

  console.log('\n==============================');
  console.log(`  성공: ${success}/${QUESTIONS.length}`);
  if (errors.length > 0) {
    console.log(`  실패: ${errors.length}건`);
    for (const e of errors) console.log(`    - ${e.id}: ${e.error}`);
  } else {
    console.log('  실패: 0건 ✅');
  }
}

main().catch(err => {
  console.error('스크립트 오류:', err);
  process.exit(1);
});
