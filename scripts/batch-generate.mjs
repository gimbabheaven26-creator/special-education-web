/**
 * scripts/batch-generate.mjs
 *
 * M4 Phase 1-3: 배치 문항 생성 — 과목+키워드+난이도 지정 대량 초안 생성.
 * admin API를 통해 Gemini 초안을 생성하고 ai_status='draft'로 DB에 저장한다.
 *
 * Usage:
 *   node scripts/batch-generate.mjs --subject introduction --type ox --count 5
 *   node scripts/batch-generate.mjs --subject introduction --type multiple --keyword "IEP" --difficulty 2 --count 3
 *   node scripts/batch-generate.mjs --config batch-config.json
 *   node scripts/batch-generate.mjs --subject introduction --type ox --count 5 --dry-run
 */

import { parseArgs } from './lib/cli-utils.mjs';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const args = parseArgs({
  subject: { type: 'string', description: '과목 slug' },
  type: { type: 'string', description: '문제 유형 (ox, multiple, fill_in, descriptive, scenario_composite)', choices: ['ox', 'multiple', 'fill_in', 'descriptive', 'scenario_composite'] },
  keyword: { type: 'string', description: '핵심 키워드' },
  chapter: { type: 'string', description: '챕터 slug' },
  difficulty: { type: 'number', default: 2, description: '난이도 1-3' },
  count: { type: 'number', default: 5, description: '생성할 문항 수' },
  config: { type: 'string', description: '배치 설정 JSON 파일 경로' },
  'dry-run': { type: 'boolean', default: false, description: '생성만 하고 저장 안 함' },
  'base-url': { type: 'string', default: 'http://localhost:3000', description: 'API base URL' },
});

function loadEnv() {
  try {
    const content = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8');
    for (const line of content.split('\n')) {
      const match = line.match(/^([A-Z_]+)=(.+)$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].trim();
      }
    }
  } catch { /* ignore */ }
}

loadEnv();
const API_KEY = process.env.ADMIN_API_KEY;
if (!API_KEY) {
  console.error('ADMIN_API_KEY not set');
  process.exit(1);
}

const BASE_URL = args.baseUrl;
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_KEY}`,
};

async function generateDrafts(params) {
  const res = await fetch(`${BASE_URL}/api/admin/quiz/generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`Generate failed: ${res.status}`);
  return res.json();
}

async function saveDraft(draft, params, onDuplicate) {
  const body = {
    type: params.type,
    question: draft.question_text,
    answer: draft.correct_answer,
    subject: params.subject,
    chapter: params.chapter || params.subject,
    explanation: draft.explanation,
    difficulty: params.difficulty,
    options: draft.options,
    ai_status: 'draft',
    ai_generated_at: new Date().toISOString(),
  };

  if (draft.case_context) body.case_context = draft.case_context;
  if (draft.sub_questions) body.sub_questions = draft.sub_questions;

  const res = await fetch(`${BASE_URL}/api/admin/quiz`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Save failed: ${res.status} ${err.error || ''}`);
  }
  const result = await res.json();
  if (result.duplicateWarning && onDuplicate) {
    onDuplicate(result.duplicateWarning);
  }
  return result;
}

async function runBatch(params) {
  const { subject, type, keyword, chapter, difficulty, count } = params;
  const maxPerCall = type === 'scenario_composite' ? 1 : Math.min(count, 5);
  const calls = Math.ceil(count / maxPerCall);

  console.log(`\n  과목: ${subject} | 유형: ${type} | 난이도: ${difficulty} | 목표: ${count}개`);
  if (keyword) console.log(`  키워드: ${keyword}`);

  let generated = 0;
  let saved = 0;
  let mockCount = 0;

  for (let i = 0; i < calls && generated < count; i++) {
    const remaining = count - generated;
    const batchSize = Math.min(maxPerCall, remaining);

    try {
      const result = await generateDrafts({
        type, subject, chapter, keyword, difficulty,
        count: batchSize,
      });

      if (result.mock) mockCount++;

      for (const draft of result.drafts || []) {
        generated++;
        const tag = result.mock ? '[mock]' : '[AI]';
        console.log(`  ${tag} ${generated}/${count}: ${draft.question_text.slice(0, 60)}...`);

        if (!args.dryRun) {
          try {
            const saved_quiz = await saveDraft(draft, params, (dupes) => {
              console.log(`    ⚠️  유사 문항 발견: ${dupes.join(', ')}`);
            });
            saved++;
            console.log(`    → 저장: ${saved_quiz.id} (ai_status=draft)`);
          } catch (e) {
            console.error(`    → 저장 실패: ${e.message}`);
          }
        }
      }
    } catch (e) {
      console.error(`  ❌ 생성 실패 (batch ${i + 1}): ${e.message}`);
    }

    if (i < calls - 1) await new Promise(r => setTimeout(r, 1000));
  }

  return { generated, saved, mockCount };
}

async function main() {
  console.log('='.repeat(60));
  console.log('  배치 문항 생성');
  console.log(`  ${args.dryRun ? '🔍 DRY RUN (저장 안 함)' : '💾 실제 저장 모드'}`);
  console.log('='.repeat(60));

  let batches;

  if (args.config) {
    const configPath = resolve(process.cwd(), args.config);
    const configContent = readFileSync(configPath, 'utf-8');
    batches = JSON.parse(configContent);
    if (!Array.isArray(batches)) batches = [batches];
  } else {
    if (!args.subject || !args.type) {
      console.error('--subject와 --type은 필수 (또는 --config 사용)');
      process.exit(1);
    }
    batches = [{
      subject: args.subject,
      type: args.type,
      keyword: args.keyword || null,
      chapter: args.chapter || null,
      difficulty: args.difficulty,
      count: args.count,
    }];
  }

  let totalGenerated = 0;
  let totalSaved = 0;
  let totalMock = 0;

  for (const batch of batches) {
    const result = await runBatch(batch);
    totalGenerated += result.generated;
    totalSaved += result.saved;
    totalMock += result.mockCount;
  }

  console.log('\n' + '='.repeat(60));
  console.log(`  결과: 생성 ${totalGenerated} | 저장 ${totalSaved} | mock ${totalMock}회`);
  if (totalMock > 0) {
    console.log('  ⚠️  Gemini API 미연결 — mock 데이터 사용됨. GEMINI_API_KEY 확인 필요.');
  }
  console.log('='.repeat(60));
}

main().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
