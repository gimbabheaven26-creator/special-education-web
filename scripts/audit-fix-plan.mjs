/**
 * 읽기 전용 분석: quiz_questions의 answer/options/wrong_explanations 위반을
 * 카테고리별로 분류하고 결정적 변환안을 제안한다. (DB 수정 없음)
 *
 * 카테고리:
 *  - OX_NUMERIC      : type=ox, answer가 "0"/"1" → 문장 진위 판단 필요 (수동)
 *  - MC_TEXT_ANSWER  : type=multiple, answer가 선택지 원문 텍스트 → 인덱스로 변환 (결정적)
 *  - MC_ONE_INDEXED  : type=multiple, 4지선다인데 1-인덱스(answer/키가 1..N) → -1 시프트 (결정적)
 *  - MC_5CHOICE_OK   : type=multiple, 5지선다 + answer/키 0~4 정합 → contract 개정 대상 (수정 불요)
 *  - WE_TEXT_KEY     : wrong_explanations 키가 텍스트 → 인덱스로 변환 (결정적)
 *  - WE_ANSWER_KEY   : wrong_explanations에 정답 인덱스 포함 → 제거 (결정적)
 *  - UNKNOWN         : 자동 분류 불가 → 수동 검토
 */
import { getClient } from './lib/supabase-client.mjs';
import { fetchAll } from './lib/supabase-client.mjs';
import { writeFileSync } from 'fs';

const sb = getClient();

function isIntStr(s) { return typeof s === 'string' && /^\d+$/.test(s); }

/** 선택지 텍스트에서 ①②③ 같은 프리픽스를 제거하고 정규화 */
function norm(s) {
  return String(s).replace(/^\s*[①②③④⑤0-9]+[).\.\s]*/, '').replace(/\s+/g, ' ').trim();
}

/** answer/key 텍스트가 어떤 옵션 인덱스인지 찾기 (정확/정규화 매칭) */
function findOptionIndex(value, options) {
  const v = String(value);
  let idx = options.findIndex((o) => String(o) === v);
  if (idx >= 0) return idx;
  const nv = norm(v);
  idx = options.findIndex((o) => norm(o) === nv);
  return idx; // -1 if not found
}

const rows = await fetchAll(sb, 'quiz_questions', 'id, type, question, options, answer, wrong_explanations');
console.log(`총 ${rows.length}개 문항 분석\n`);

const plan = { OX_NUMERIC: [], MC_TEXT_ANSWER: [], MC_ONE_INDEXED: [], MC_5CHOICE_OK: [], WE_TEXT_KEY: [], WE_ANSWER_KEY: [], UNKNOWN: [] };

for (const q of rows) {
  const opts = Array.isArray(q.options) ? q.options : null;
  const we = q.wrong_explanations && typeof q.wrong_explanations === 'object' ? q.wrong_explanations : null;
  const weKeys = we ? Object.keys(we) : [];

  // ── OX ──
  if (q.type === 'ox') {
    if (q.answer !== 'O' && q.answer !== 'X') {
      plan.OX_NUMERIC.push({ id: q.id, question: q.question, answer: q.answer });
    }
    continue;
  }

  // ── multiple ──
  if (q.type === 'multiple' && opts) {
    const n = opts.length;
    const answerIsValidIdx = isIntStr(q.answer) && +q.answer >= 0 && +q.answer < n;

    // answer가 선택지 텍스트
    if (!isIntStr(q.answer)) {
      const idx = findOptionIndex(q.answer, opts);
      const weFix = {};
      let weOk = true;
      for (const [k, v] of Object.entries(we || {})) {
        if (isIntStr(k) && +k < n) { weFix[k] = v; continue; }
        const ki = findOptionIndex(k, opts);
        if (ki < 0) { weOk = false; break; }
        weFix[String(ki)] = v;
      }
      if (idx >= 0 && weOk) {
        plan.MC_TEXT_ANSWER.push({ id: q.id, n, from: q.answer, toAnswer: String(idx), weFrom: weKeys, weTo: Object.keys(weFix) });
      } else {
        plan.UNKNOWN.push({ id: q.id, reason: 'text answer/we not matched', answer: q.answer, weKeys, n });
      }
      continue;
    }

    // answer가 숫자
    const aNum = +q.answer;
    // 5지선다 + 0~4 정합 → 정상 (contract 개정 대상)
    if (n === 5 && aNum >= 0 && aNum <= 4) {
      // WE 키도 0~4 숫자인지 확인
      const allNumericInRange = weKeys.every((k) => isIntStr(k) && +k >= 0 && +k < 5);
      if (allNumericInRange && !weKeys.includes(q.answer)) {
        plan.MC_5CHOICE_OK.push({ id: q.id, answer: q.answer, weKeys });
      } else if (weKeys.includes(q.answer)) {
        plan.WE_ANSWER_KEY.push({ id: q.id, answer: q.answer, weKeys });
      } else {
        plan.UNKNOWN.push({ id: q.id, reason: '5choice we non-numeric', weKeys, n });
      }
      continue;
    }

    // 4지선다인데 answer가 범위 밖(예: "4") → 1-인덱스 의심
    if (n === 4 && !answerIsValidIdx) {
      // 1-인덱스 가정: answer "4"→idx 3, WE 키 1,2,3 → 0,1,2
      if (aNum >= 1 && aNum <= n) {
        const weAll1Indexed = weKeys.every((k) => isIntStr(k) && +k >= 1 && +k <= n && +k !== aNum);
        if (weAll1Indexed) {
          plan.MC_ONE_INDEXED.push({
            id: q.id, n, fromAnswer: q.answer, toAnswer: String(aNum - 1),
            weFrom: weKeys, weTo: weKeys.map((k) => String(+k - 1)),
          });
          continue;
        }
      }
      plan.UNKNOWN.push({ id: q.id, reason: '4choice answer out of range', answer: q.answer, weKeys, n });
      continue;
    }

    // answer는 정상이지만 WE 키 문제
    if (we) {
      const badKeys = weKeys.filter((k) => !(isIntStr(k) && +k >= 0 && +k < n));
      if (weKeys.includes(q.answer)) {
        plan.WE_ANSWER_KEY.push({ id: q.id, answer: q.answer, weKeys });
      } else if (badKeys.length) {
        // 텍스트 키 → 인덱스
        const weFix = {};
        let ok = true;
        for (const [k, v] of Object.entries(we)) {
          if (isIntStr(k) && +k < n) { weFix[k] = v; continue; }
          const ki = findOptionIndex(k, opts);
          if (ki < 0) { ok = false; break; }
          weFix[String(ki)] = v;
        }
        if (ok) plan.WE_TEXT_KEY.push({ id: q.id, n, weFrom: weKeys, weTo: Object.keys(weFix) });
        else plan.UNKNOWN.push({ id: q.id, reason: 'we text key not matched', weKeys, n });
      }
    }
  }
}

console.log('카테고리별 건수:');
for (const [k, v] of Object.entries(plan)) console.log(`  ${k}: ${v.length}`);

console.log('\n=== OX_NUMERIC (수동 진위 판단 필요) ===');
for (const o of plan.OX_NUMERIC) console.log(`  ${o.id} [answer=${o.answer}] ${o.question.slice(0, 70)}`);

writeFileSync('scripts/.fix-plan.json', JSON.stringify(plan, null, 2));
console.log('\n→ scripts/.fix-plan.json 저장');
