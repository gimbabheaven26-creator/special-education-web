/**
 * quiz_questions answer/wrong_explanations 정합성 수정 (불변식 기반).
 *
 * 안전 원칙: "올바른 문항은 wrong_explanations 키 == {0..n-1} ∖ {answer}(0-인덱스)".
 * 후보 변환을 순서대로 적용하되, 결과가 이 불변식을 만족할 때만 채택한다.
 * 어떤 후보도 불변식을 못 맞추면 해당 행은 건드리지 않고 UNKNOWN으로 보고한다.
 * 정상 행은 변환 결과가 현재값과 동일 → 무변경(스킵).
 *
 * 실행:
 *   node scripts/fix-quiz-data.mjs           # DRY RUN (변경 미적용, 전체 출력)
 *   APPLY=1 node scripts/fix-quiz-data.mjs   # 실제 적용
 */
import { getClient, fetchAll } from './lib/supabase-client.mjs';

const APPLY = process.env.APPLY === '1';
const sb = getClient();

const isInt = (s) => typeof s === 'string' && /^\d+$/.test(s);
const norm = (s) => String(s).replace(/^\s*[①②③④⑤0-9]+[).\.\s]*/, '').replace(/\s+/g, ' ').trim();

function findOptionIndex(value, options) {
  const v = String(value);
  let idx = options.findIndex((o) => String(o) === v);
  if (idx >= 0) return idx;
  const nv = norm(v);
  return options.findIndex((o) => norm(o) === nv);
}

/** 불변식: we 키 집합 == {0..n-1} ∖ {answerIdx} */
function satisfiesInvariant(answerIdx, weObj, n) {
  if (!(answerIdx >= 0 && answerIdx < n)) return false;
  const keys = Object.keys(weObj);
  const expected = new Set();
  for (let i = 0; i < n; i++) if (i !== answerIdx) expected.add(String(i));
  return keys.length === expected.size && keys.every((k) => expected.has(k));
}

/** multiple 행에 대한 후보 변환들 → {answerIdx, we} | null */
function candidates(answer, we, opts) {
  const n = opts.length;
  const out = [];

  // C1: answer가 선택지 텍스트 + we 키도 텍스트 → 인덱스
  if (!isInt(answer)) {
    const ai = findOptionIndex(answer, opts);
    if (ai >= 0) {
      const newWe = {}; let ok = true;
      for (const [k, v] of Object.entries(we)) {
        const ki = isInt(k) && +k < n ? +k : findOptionIndex(k, opts);
        if (ki < 0) { ok = false; break; }
        newWe[String(ki)] = v;
      }
      if (ok) out.push({ answerIdx: ai, we: newWe });
    }
  }

  // C2: answer 0-인덱스 유효 + we 0-인덱스 → 정답 키만 제거 (정상행/WE_ANSWER_KEY)
  if (isInt(answer) && +answer >= 0 && +answer < n) {
    if (Object.keys(we).every((k) => isInt(k) && +k >= 0 && +k < n)) {
      const newWe = {};
      for (const [k, v] of Object.entries(we)) if (+k !== +answer) newWe[k] = v;
      out.push({ answerIdx: +answer, we: newWe });
    }
  }

  // C3: 전체 1-인덱스 → 모두 -1 시프트
  if (isInt(answer) && +answer >= 1) {
    const ai = +answer - 1;
    const newWe = {}; let ok = true;
    for (const [k, v] of Object.entries(we)) {
      if (!isInt(k)) { ok = false; break; }
      const nk = +k - 1;
      if (nk < 0 || nk >= n) { ok = false; break; }
      newWe[String(nk)] = v;
    }
    if (ok) out.push({ answerIdx: ai, we: newWe });
  }

  // C4: answer 0-인덱스 유효 + we만 1-인덱스(정답 포함) → we -1 시프트 후 정답 키 제거
  if (isInt(answer) && +answer >= 0 && +answer < n) {
    const newWe = {}; let ok = true;
    for (const [k, v] of Object.entries(we)) {
      if (!isInt(k)) { ok = false; break; }
      const nk = +k - 1;
      if (nk < 0 || nk >= n) { ok = false; break; }
      newWe[String(nk)] = v;
    }
    if (ok) {
      delete newWe[String(+answer)];
      out.push({ answerIdx: +answer, we: newWe });
    }
  }

  // C5: answer가 1-인덱스/오답이고 we는 이미 0-인덱스 여집합 → (answer-1)이 정답.
  //     we 구조(설명 없는 인덱스)가 진짜 정답을 드러내는 경우. 불변식 검증으로만 채택.
  if (isInt(answer) && +answer >= 1) {
    out.push({ answerIdx: +answer - 1, we: { ...we } });
  }

  // C6: we 키가 순차(0..n-2)로 정답을 건너뛰고 매겨진 경우 → 비정답 인덱스로 재배치
  {
    const ai = isInt(answer) && +answer >= 0 && +answer < n ? +answer : findOptionIndex(answer, opts);
    const keys = Object.keys(we);
    const sorted = keys.map(Number).sort((a, b) => a - b);
    const isSequential = keys.length === n - 1 && keys.every((k) => isInt(k)) &&
      sorted.every((v, j) => v === j);
    if (ai >= 0 && ai < n && isSequential) {
      const nonAnswer = [];
      for (let i = 0; i < n; i++) if (i !== ai) nonAnswer.push(i);
      const newWe = {};
      nonAnswer.forEach((optIdx, j) => { newWe[String(optIdx)] = we[String(j)]; });
      out.push({ answerIdx: ai, we: newWe });
    }
  }

  return out;
}

const rows = await fetchAll(sb, 'quiz_questions', 'id, type, question, options, answer, wrong_explanations');

const changes = [];
const unknown = [];

for (const q of rows) {
  // ── OX: answer = options[idx] ──
  if (q.type === 'ox') {
    if (q.answer === 'O' || q.answer === 'X') continue;
    const opts = Array.isArray(q.options) ? q.options : ['O', 'X'];
    if (isInt(q.answer) && +q.answer < opts.length) {
      const fixed = opts[+q.answer];
      if (fixed === 'O' || fixed === 'X') {
        changes.push({ id: q.id, type: 'ox', from: { answer: q.answer }, to: { answer: fixed } });
        continue;
      }
    }
    unknown.push({ id: q.id, type: 'ox', answer: q.answer });
    continue;
  }

  if (q.type !== 'multiple' || !Array.isArray(q.options)) continue;
  const n = q.options.length;
  const we = q.wrong_explanations && typeof q.wrong_explanations === 'object' ? q.wrong_explanations : {};
  const weEmpty = Object.keys(we).length === 0;
  const answerValid = isInt(q.answer) && +q.answer >= 0 && +q.answer < n;

  // 정상 행 스킵: answer 유효 + (WE 없음[contract상 NULL 허용] 또는 WE가 여집합 불변식 충족)
  if (answerValid && (weEmpty || satisfiesInvariant(+q.answer, we, n))) continue;

  // 후보 중 채택: answer 유효 + (WE 비었으면 결과 WE도 비어야, 아니면 불변식 충족)
  const accept = (c) => c.answerIdx >= 0 && c.answerIdx < n &&
    (weEmpty ? Object.keys(c.we).length === 0 : satisfiesInvariant(c.answerIdx, c.we, n));
  let picked = null;
  for (const c of candidates(q.answer, we, q.options)) {
    if (accept(c)) { picked = c; break; }
  }

  if (!picked) { unknown.push({ id: q.id, type: 'multiple', n, answer: q.answer, weKeys: Object.keys(we) }); continue; }

  const newAnswer = String(picked.answerIdx);
  const changed = newAnswer !== q.answer || JSON.stringify(picked.we) !== JSON.stringify(we);
  if (!changed) continue;
  changes.push({ id: q.id, type: 'multiple', from: { answer: q.answer, weKeys: Object.keys(we) }, to: { answer: newAnswer, weKeys: Object.keys(picked.we) }, _we: picked.we });
}

console.log(`총 ${rows.length}개 분석 | 변경 ${changes.length}건 | UNKNOWN ${unknown.length}건\n`);
console.log('=== 변경 목록 ===');
for (const c of changes) {
  if (c.type === 'ox') console.log(`  [ox] ${c.id}: answer "${c.from.answer}" → "${c.to.answer}"`);
  else console.log(`  [mc] ${c.id}: answer "${c.from.answer}"→"${c.to.answer}" | WE [${c.from.weKeys}]→[${c.to.weKeys}]`);
}
if (unknown.length) {
  console.log('\n=== UNKNOWN (미변경, 수동 검토) ===');
  for (const u of unknown) console.log(`  ${u.id}:`, JSON.stringify(u));
}

if (!APPLY) {
  console.log('\n[DRY RUN] 적용하려면: APPLY=1 node scripts/fix-quiz-data.mjs');
  process.exit(0);
}

console.log('\n[APPLY] 업데이트 실행...');
let ok = 0, fail = 0;
for (const c of changes) {
  const payload = c.type === 'ox' ? { answer: c.to.answer } : { answer: c.to.answer, wrong_explanations: c._we };
  const { error } = await sb.from('quiz_questions').update(payload).eq('id', c.id);
  if (error) { console.error(`  FAIL ${c.id}: ${error.message}`); fail++; } else ok++;
}
console.log(`완료: 성공 ${ok}, 실패 ${fail}`);
