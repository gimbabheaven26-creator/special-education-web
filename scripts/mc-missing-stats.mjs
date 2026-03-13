/**
 * mc-missing-stats.mjs
 * Analyze multiple-choice questions missing wrong_explanations, grouped by subject.
 *
 * Usage: SUPABASE_SERVICE_KEY=<key> node scripts/mc-missing-stats.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ssluhxvbyzqmdkbjwoke.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SERVICE_KEY) {
  throw new Error('SUPABASE_SERVICE_KEY environment variable is required');
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function fetchAllMCQuestions() {
  const allRows = [];
  let from = 0;
  const PAGE_SIZE = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('id, subject, wrong_explanations')
      .eq('type', 'multiple')
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      throw new Error(`Supabase query failed: ${error.message}`);
    }

    allRows.push(...data);

    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return allRows;
}

function isEmptyExplanations(val) {
  if (val === null || val === undefined) return true;
  if (typeof val === 'object' && Object.keys(val).length === 0) return true;
  return false;
}

async function main() {
  const rows = await fetchAllMCQuestions();

  // Group by subject
  const bySubject = {};
  for (const row of rows) {
    const slug = row.subject;
    if (!bySubject[slug]) {
      bySubject[slug] = { total: 0, withExpl: 0, withoutExpl: 0, missingIds: [] };
    }
    bySubject[slug].total += 1;

    if (isEmptyExplanations(row.wrong_explanations)) {
      bySubject[slug].withoutExpl += 1;
      bySubject[slug].missingIds.push(row.id);
    } else {
      bySubject[slug].withExpl += 1;
    }
  }

  // Sort subjects alphabetically
  const subjects = Object.keys(bySubject).sort();

  // Summary table
  let totalAll = 0;
  let withAll = 0;
  let withoutAll = 0;

  console.log('\n=== Multiple-Choice Questions: wrong_explanations Coverage ===\n');
  console.log(
    'Subject'.padEnd(30) +
    'Total'.padStart(8) +
    'Has'.padStart(8) +
    'Missing'.padStart(8) +
    'Coverage'.padStart(10)
  );
  console.log('-'.repeat(64));

  for (const slug of subjects) {
    const s = bySubject[slug];
    const pct = s.total > 0 ? ((s.withExpl / s.total) * 100).toFixed(1) : '0.0';
    console.log(
      slug.padEnd(30) +
      String(s.total).padStart(8) +
      String(s.withExpl).padStart(8) +
      String(s.withoutExpl).padStart(8) +
      `${pct}%`.padStart(10)
    );
    totalAll += s.total;
    withAll += s.withExpl;
    withoutAll += s.withoutExpl;
  }

  console.log('-'.repeat(64));
  const totalPct = totalAll > 0 ? ((withAll / totalAll) * 100).toFixed(1) : '0.0';
  console.log(
    'TOTAL'.padEnd(30) +
    String(totalAll).padStart(8) +
    String(withAll).padStart(8) +
    String(withoutAll).padStart(8) +
    `${totalPct}%`.padStart(10)
  );

  // Missing IDs by subject
  console.log('\n=== IDs Missing wrong_explanations (by subject) ===\n');
  for (const slug of subjects) {
    const ids = bySubject[slug].missingIds;
    if (ids.length === 0) {
      console.log(`[${slug}] — none missing`);
    } else {
      console.log(`[${slug}] (${ids.length} missing):`);
      console.log(`  ${ids.join(', ')}`);
    }
  }

  console.log(`\nTotal MC questions missing wrong_explanations: ${withoutAll} / ${totalAll}\n`);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
