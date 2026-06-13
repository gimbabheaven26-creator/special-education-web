/**
 * 객관식 options 텍스트의 선두 원문자 프리픽스(①②③④⑤)를 제거한다.
 * UI(MultipleChoice)가 "index+1." 번호를 직접 렌더하므로, 텍스트에 박힌
 * 원문자와 이중 번호가 표시되는 것을 방지. answer/wrong_explanations는
 * 인덱스 기반이라 영향 없음.
 *
 *   node scripts/normalize-option-prefixes.mjs           # DRY RUN
 *   APPLY=1 node scripts/normalize-option-prefixes.mjs   # 적용
 */
import { getClient, fetchAll } from './lib/supabase-client.mjs';

const APPLY = process.env.APPLY === '1';
const sb = getClient();
const MARKERS = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'];

/**
 * 진짜 "표시용 프리픽스"만 식별: 모든 선택지가 위치에 맞는 마커(0→①, 1→②…)로
 * 시작하고 그 뒤에 공백 + 실제 내용이 있어야 한다.
 * 〈보기〉형(①을 내용에서 참조: "①은 ...", "①" 단독)은 제외된다.
 */
function isPositionalPrefix(options) {
  return options.every((o, i) => {
    if (i >= MARKERS.length) return false;
    return new RegExp(`^\\s*${MARKERS[i]}\\s+\\S`).test(String(o));
  });
}

const rows = await fetchAll(sb, 'quiz_questions', 'id, type, options');
const changes = [];
const skipped = [];
for (const q of rows) {
  if (q.type !== 'multiple' || !Array.isArray(q.options)) continue;
  const hasAnyMarker = q.options.some((o) => MARKERS.some((m) => String(o).includes(m)));
  if (!hasAnyMarker) continue;
  if (!isPositionalPrefix(q.options)) { skipped.push(q.id); continue; }
  const newOptions = q.options.map((o, i) => String(o).replace(new RegExp(`^\\s*${MARKERS[i]}\\s+`), '').trim());
  changes.push({ id: q.id, before: q.options, after: newOptions });
}

console.log(`프리픽스 제거 대상: ${changes.length}건 | 마커 있으나 제외(보기형 등): ${skipped.length}건`);
for (const c of changes.slice(0, 6)) {
  console.log(`  ${c.id}: [${c.before.length}opt] "${c.before[0].slice(0, 38)}" → "${c.after[0].slice(0, 38)}"`);
}
if (skipped.length) console.log(`  제외 예시: ${skipped.slice(0, 10).join(', ')}`);

if (!APPLY) { console.log('\n[DRY RUN] 적용: APPLY=1 node scripts/normalize-option-prefixes.mjs'); process.exit(0); }

let ok = 0, fail = 0;
for (const c of changes) {
  const { error } = await sb.from('quiz_questions').update({ options: c.after }).eq('id', c.id);
  if (error) { console.error(`  FAIL ${c.id}: ${error.message}`); fail++; } else ok++;
}
console.log(`완료: 성공 ${ok}, 실패 ${fail}`);
