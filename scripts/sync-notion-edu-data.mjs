/**
 * sync-notion-edu-data.mjs
 * Supabase quiz_questions → Notion 교육 데이터 관리 DB 자동 동기화
 *
 * 사용법:
 *   node scripts/sync-notion-edu-data.mjs           # 전체 동기화
 *   node scripts/sync-notion-edu-data.mjs --dry-run  # 변경 내용만 출력 (실제 반영 X)
 *   node scripts/sync-notion-edu-data.mjs --subject introduction  # 특정 과목만
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// ── 환경 변수 ──────────────────────────────────────────────────────────────
const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
const get = (k) => env.match(new RegExp(`^${k}=(.+)$`, 'm'))?.[1]?.trim();

const SUPABASE_URL = get('NEXT_PUBLIC_SUPABASE_URL');
const SUPABASE_KEY = get('SUPABASE_SERVICE_ROLE_KEY');
const NOTION_TOKEN = get('NOTION_API_KEY');
const NOTION_DB_ID = '324d1034-8f3f-811c-bc05-c61d6fce632f'; // 교육 데이터 관리

const DRY_RUN = process.argv.includes('--dry-run');
const TARGET_SUBJECT = process.argv.includes('--subject')
  ? process.argv[process.argv.indexOf('--subject') + 1]
  : null;

// ── 과목 메타데이터 ────────────────────────────────────────────────────────
const SUBJECTS = {
  introduction:          { name: '특수교육학 개론',  prefix: 'intro' },
  'behavior-support':    { name: '행동지원',          prefix: 'bs'    },
  'visual-impairment':   { name: '시각장애',          prefix: 'vi'    },
  'hearing-impairment':  { name: '청각장애',          prefix: 'hi'    },
  'communication-disorder': { name: '의사소통장애',   prefix: 'cd'    },
  'physical-disability': { name: '지체·중복장애',     prefix: 'pd'    },
  curriculum:            { name: '교육과정',          prefix: 'cur'   },
  transition:            { name: '전환교육',          prefix: 'trans' },
  'inclusive-education': { name: '통합교육',          prefix: 'ie'    },
  assessment:            { name: '진단·평가',         prefix: 'assess'},
  laws:                  { name: '법령',              prefix: 'laws'  },
};

// ── Supabase ───────────────────────────────────────────────────────────────
const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function fetchStats() {
  // Supabase REST API 기본 limit=1000, 페이지네이션으로 전체 로드
  let data = [], page = 0;
  while (true) {
    const { data: chunk, error } = await sb
      .from('quiz_questions')
      .select('subject, type')
      .range(page * 1000, (page + 1) * 1000 - 1);
    if (error) throw new Error(`Supabase 오류: ${error.message}`);
    if (!chunk || chunk.length === 0) break;
    data = data.concat(chunk);
    page++;
  }

  const { data: chapters, error: ce } = await sb
    .from('chapters')
    .select('subject_slug');
  if (ce) throw new Error(`chapters 오류: ${ce.message}`);

  const stats = {};
  for (const slug of Object.keys(SUBJECTS)) {
    stats[slug] = { total: 0, multiple: 0, ox: 0, fill_in: 0, descriptive: 0, chapters: 0 };
  }
  data.forEach((r) => {
    if (!stats[r.subject]) return;
    stats[r.subject].total++;
    stats[r.subject][r.type] = (stats[r.subject][r.type] || 0) + 1;
  });
  chapters?.forEach((r) => {
    if (stats[r.subject_slug]) stats[r.subject_slug].chapters++;
  });

  return stats;
}

// ── Notion API ─────────────────────────────────────────────────────────────
async function notionRequest(method, path, body) {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${NOTION_TOKEN}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Notion ${method} ${path}: ${json.message}`);
  return json;
}

async function findNotionPage(subjectName) {
  const result = await notionRequest('POST', '/search', {
    query: subjectName,
    filter: { value: 'page', property: 'object' },
  });
  return result.results?.find(
    (p) =>
      p.parent?.database_id?.replace(/-/g, '') === NOTION_DB_ID.replace(/-/g, '') &&
      p.properties?.['과목명']?.title?.[0]?.plain_text === subjectName
  );
}

function buildProperties(subjectName, stat, slug) {
  const today = new Date().toISOString().split('T')[0];
  return {
    '과목명': { title: [{ text: { content: subjectName } }] },
    '총 문제 수': { number: stat.total },
    '객관식': { number: stat.multiple },
    'OX': { number: stat.ox },
    '단답형': { number: stat.fill_in },
    '서술형': { number: stat.descriptive },
    '챕터 수': { number: stat.chapters },
    'Supabase': {
      url: `${SUPABASE_URL}/project/default/editor?schema=public&table=quiz_questions&filter=subject%3Aeq%3A${slug}`,
    },
    '마지막 갱신': { date: { start: today } },
  };
}

// ── 메인 ──────────────────────────────────────────────────────────────────
async function main() {
  if (!NOTION_TOKEN) {
    console.error('❌ NOTION_API_KEY가 .env.local에 없어. 추가 후 재실행.');
    process.exit(1);
  }

  console.log(`\n🔄 Supabase → Notion 교육 데이터 동기화 시작${DRY_RUN ? ' [DRY-RUN]' : ''}\n`);

  const stats = await fetchStats();
  const targets = TARGET_SUBJECT
    ? { [TARGET_SUBJECT]: SUBJECTS[TARGET_SUBJECT] }
    : SUBJECTS;

  let created = 0, updated = 0, skipped = 0;

  for (const [slug, meta] of Object.entries(targets)) {
    if (!meta) { console.log(`⚠️  알 수 없는 subject: ${slug}`); continue; }
    const stat = stats[slug];
    const props = buildProperties(meta.name, stat, slug);

    process.stdout.write(`  ${meta.name.padEnd(14)} total=${String(stat.total).padStart(3)} `);

    if (DRY_RUN) {
      console.log(`[dry] multiple=${stat.multiple} ox=${stat.ox} fill_in=${stat.fill_in} descriptive=${stat.descriptive} chapters=${stat.chapters}`);
      continue;
    }

    try {
      const existing = await findNotionPage(meta.name);
      if (existing) {
        await notionRequest('PATCH', `/pages/${existing.id}`, { properties: props });
        console.log('✅ 업데이트');
        updated++;
      } else {
        await notionRequest('POST', '/pages', {
          parent: { database_id: NOTION_DB_ID },
          properties: props,
        });
        console.log('🆕 생성');
        created++;
      }
    } catch (e) {
      console.log(`❌ ${e.message}`);
      skipped++;
    }

    // Notion rate limit 방지
    await new Promise((r) => setTimeout(r, 350));
  }

  if (!DRY_RUN) {
    console.log(`\n완료: 생성 ${created}건 / 업데이트 ${updated}건 / 실패 ${skipped}건`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
