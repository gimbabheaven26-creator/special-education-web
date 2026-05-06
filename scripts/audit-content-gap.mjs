/**
 * scripts/audit-content-gap.mjs
 *
 * M4 Phase 0-2: 퀴즈 현황 감사 + KICE 갭 재측정.
 * 3113+ 퀴즈의 과목별/타입별/난이도별 분포를 집계하고
 * KICE 출제 비율(cloudy-kice-gap-analysis.md 기준)과 비교한다.
 *
 * Usage: node scripts/audit-content-gap.mjs [--json]
 */

import { getClient, fetchAll } from './lib/supabase-client.mjs';
import { parseArgs } from './lib/cli-utils.mjs';

const args = parseArgs({
  json: { type: 'boolean', default: false, description: 'JSON 출력' },
});

const KICE_RATIOS = {
  introduction: 0.24,
  laws: 0.20,
  curriculum: 0.13,
  assessment: 0.12,
  transition: 0.12,
  'behavior-support': 0.11,
  'inclusive-education': 0.08,
  'visual-impairment': 0,
  'hearing-impairment': 0,
  'physical-disability': 0,
  'communication-disorder': 0,
};

const SUBJECT_LABELS = {
  introduction: '특수교육학 개론',
  laws: '법령',
  curriculum: '교육과정',
  assessment: '진단/평가',
  transition: '전환교육',
  'behavior-support': '행동지원',
  'inclusive-education': '통합교육',
  'visual-impairment': '시각장애',
  'hearing-impairment': '청각장애',
  'physical-disability': '지체장애',
  'communication-disorder': '의사소통장애',
};

const sb = getClient();

const quizzes = await fetchAll(sb, 'quiz_questions', 'id,subject,type,difficulty');

const total = quizzes.length;

const bySubject = {};
const byType = {};
const byDifficulty = {};

for (const q of quizzes) {
  bySubject[q.subject] = (bySubject[q.subject] || 0) + 1;
  byType[q.type] = (byType[q.type] || 0) + 1;
  byDifficulty[q.difficulty ?? 'null'] = (byDifficulty[q.difficulty ?? 'null'] || 0) + 1;
}

const gapAnalysis = Object.entries(KICE_RATIOS)
  .map(([subject, kiceRatio]) => {
    const count = bySubject[subject] || 0;
    const quizRatio = count / total;
    const gap = quizRatio - kiceRatio;
    return {
      subject,
      label: SUBJECT_LABELS[subject] || subject,
      count,
      quizRatio: +(quizRatio * 100).toFixed(1),
      kiceRatio: +(kiceRatio * 100).toFixed(1),
      gap: +(gap * 100).toFixed(1),
      severity: gap < -0.10 ? 'CRITICAL' : gap < -0.05 ? 'HIGH' : gap < 0 ? 'MEDIUM' : 'OK',
    };
  })
  .sort((a, b) => a.gap - b.gap);

if (args.json) {
  const result = { total, bySubject, byType, byDifficulty, gapAnalysis };
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  process.exit(0);
}

console.log('='.repeat(70));
console.log(`  퀴즈 현황 감사 — ${new Date().toISOString().slice(0, 10)}`);
console.log(`  총 문항: ${total}개`);
console.log('='.repeat(70));

console.log('\n📊 과목별 분포 + KICE 갭');
console.log('-'.repeat(70));
console.log(
  'Subject'.padEnd(24) +
  'Count'.padStart(6) +
  'Quiz%'.padStart(8) +
  'KICE%'.padStart(8) +
  'Gap'.padStart(8) +
  '  Severity'
);
console.log('-'.repeat(70));
for (const g of gapAnalysis) {
  const icon = g.severity === 'CRITICAL' ? '🔴' : g.severity === 'HIGH' ? '🟡' : g.severity === 'MEDIUM' ? '⚪' : '✅';
  console.log(
    g.label.padEnd(24) +
    String(g.count).padStart(6) +
    `${g.quizRatio}%`.padStart(8) +
    `${g.kiceRatio}%`.padStart(8) +
    `${g.gap > 0 ? '+' : ''}${g.gap}%`.padStart(8) +
    `  ${icon} ${g.severity}`
  );
}

const unknownSubjects = Object.keys(bySubject).filter(s => !KICE_RATIOS.hasOwnProperty(s));
if (unknownSubjects.length > 0) {
  console.log(`\n⚠️  미분류 과목: ${unknownSubjects.map(s => `${s}(${bySubject[s]})`).join(', ')}`);
}

console.log('\n📋 타입별 분포');
console.log('-'.repeat(40));
Object.entries(byType)
  .sort((a, b) => b[1] - a[1])
  .forEach(([type, count]) => {
    const pct = ((count / total) * 100).toFixed(1);
    console.log(`  ${type.padEnd(22)} ${String(count).padStart(5)}  (${pct}%)`);
  });

console.log('\n📈 난이도별 분포');
console.log('-'.repeat(40));
Object.entries(byDifficulty)
  .sort((a, b) => a[0].localeCompare(b[0]))
  .forEach(([diff, count]) => {
    const pct = ((count / total) * 100).toFixed(1);
    console.log(`  난이도 ${diff.padEnd(6)} ${String(count).padStart(5)}  (${pct}%)`);
  });

const criticalGaps = gapAnalysis.filter(g => g.severity === 'CRITICAL' || g.severity === 'HIGH');
if (criticalGaps.length > 0) {
  console.log('\n🚨 우선 보강 필요');
  console.log('-'.repeat(40));
  for (const g of criticalGaps) {
    const needed = Math.ceil(total * (g.kiceRatio / 100) - g.count);
    console.log(`  ${g.label}: ${needed > 0 ? `+${needed}문항 추가 필요` : '비율 OK'} (현재 ${g.count}, KICE 기준 ${Math.ceil(total * g.kiceRatio / 100)})`);
  }
}

console.log('\n' + '='.repeat(70));
