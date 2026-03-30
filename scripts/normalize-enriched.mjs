/**
 * 2022 enriched 데이터 정규화 스크립트
 *
 * 3과목(국어/수학/진로직업)의 서로 다른 JSON 스키마를 통일 포맷으로 변환.
 * 출력: data/curriculum/2022-enriched/normalized/*.json
 *
 * 통일 스키마:
 * {
 *   subject, curriculum, grade_group, grade_group_code, source, extracted_date,
 *   total_standards,
 *   domains: [{
 *     domain, domain_code, sub_domain (nullable),
 *     standards: [{
 *       code, content,
 *       content_elements: { knowledge_understanding, process_skills, values_attitudes },
 *       considerations: string[],
 *       curriculum_levels: [{ knowledge_understanding, process_skills, values_attitudes }],
 *       achievement_pool: { columns: string[], items: string[][] },
 *       teaching_references: Array<{ title: string, items: string[] } | string>
 *     }]
 *   }]
 * }
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const enrichedDir = join(__dirname, '..', 'data', 'curriculum', '2022-enriched');
const outDir = join(enrichedDir, 'normalized');

mkdirSync(outDir, { recursive: true });

function loadJson(filename) {
  return JSON.parse(readFileSync(join(enrichedDir, filename), 'utf-8'));
}

// ─── 국어 정규화 ───

function normalizeKorean(raw) {
  const domains = raw.domains.map(d => ({
    domain: d.domain,
    domain_code: d.domain_code,
    sub_domain: null,
    standards: d.standards.map(s => ({
      code: s.code,
      content: s.title, // title → content
      content_elements: normalizeContentElements(s.content_elements, 'korean'),
      considerations: Array.isArray(s.considerations) ? s.considerations : [s.considerations],
      curriculum_levels: normalizeCurriculumLevels(s.curriculum_levels, 'korean'),
      achievement_pool: normalizePoolKorean(s.achievement_pool),
      teaching_references: normalizeTeachingRefs(s.teaching_references),
    })),
  }));

  let total = 0;
  domains.forEach(d => { total += d.standards.length; });

  return {
    subject: raw.subject,
    curriculum: raw.curriculum || '2022 개정 특수교육 기본 교육과정',
    grade_group: '중학교 1~3학년',
    grade_group_code: '9',
    source: raw.source,
    extracted_date: raw.extracted_at || raw.extracted_date,
    total_standards: total,
    domains,
  };
}

function normalizePoolKorean(pool) {
  if (!pool) return { columns: [], items: [] };

  const columns = pool.columns || [];

  // Korean: { columns, rows: [{ "열헤더1": [...], "열헤더2": [...] }] }
  if (pool.rows && Array.isArray(pool.rows)) {
    // rows는 하나의 객체 (또는 여러 row 객체) — columns 각각에 대해 배열 수집
    const items = columns.map(colHeader => {
      const allItems = [];
      for (const row of pool.rows) {
        const vals = row[colHeader];
        if (Array.isArray(vals)) {
          allItems.push(...vals);
        }
      }
      return allItems;
    });
    return { columns, items };
  }

  // fallback: key-value 직접 (이전 스키마 추정에서)
  const items = columns.map(col => {
    const vals = pool[col];
    return Array.isArray(vals) ? vals : [];
  });
  return { columns, items };
}

// ─── 수학 정규화 ───

function normalizeMath(raw) {
  const domains = [];
  raw.domains.forEach(d => {
    if (d.sub_domains) {
      d.sub_domains.forEach(sd => {
        domains.push({
          domain: d.domain,
          domain_code: extractDomainCode(d.domain, raw.subject),
          sub_domain: sd.sub_domain || sd.name || null,
          standards: sd.standards.map(s => ({
            code: normalizeCode(s.code),
            content: s.description, // description → content
            content_elements: normalizeContentElements(s.content_elements, 'math'),
            considerations: Array.isArray(s.considerations) ? s.considerations : s.considerations ? [s.considerations] : [],
            curriculum_levels: normalizeCurriculumLevels(s.curriculum_levels, 'math'),
            achievement_pool: normalizePoolMath(s.achievement_pool),
            teaching_references: normalizeTeachingRefs(s.teaching_references),
          })),
        });
      });
    } else {
      domains.push({
        domain: d.domain,
        domain_code: extractDomainCode(d.domain, raw.subject),
        sub_domain: null,
        standards: (d.standards || []).map(s => ({
          code: normalizeCode(s.code),
          content: s.description,
          content_elements: normalizeContentElements(s.content_elements, 'math'),
          considerations: Array.isArray(s.considerations) ? s.considerations : s.considerations ? [s.considerations] : [],
          curriculum_levels: normalizeCurriculumLevels(s.curriculum_levels, 'math'),
          achievement_pool: normalizePoolMath(s.achievement_pool),
          teaching_references: normalizeTeachingRefs(s.teaching_references),
        })),
      });
    }
  });

  let total = 0;
  domains.forEach(d => { total += d.standards.length; });

  return {
    subject: raw.subject,
    curriculum: '2022 개정 특수교육 기본 교육과정',
    grade_group: '중학교 1~3학년',
    grade_group_code: '9',
    source: raw.source,
    extracted_date: raw.extracted_date,
    total_standards: total,
    domains,
  };
}

function normalizePoolMath(pool) {
  if (!pool) return { columns: [], items: [] };

  const columns = pool.columns || [];

  // Math: { columns, items: [{ col1: [...], col2: [...] }], additional_items?: {...} }
  if (pool.items && Array.isArray(pool.items) && pool.items.length > 0) {
    const first = pool.items[0];
    // col1, col2, col3... 순서대로
    const colKeys = Object.keys(first).filter(k => k.startsWith('col')).sort();
    const items = colKeys.map(k => {
      const vals = first[k];
      return Array.isArray(vals) ? vals : [];
    });

    // additional_items가 있으면 마지막 컬럼에 추가
    if (pool.additional_items) {
      const addKeys = Object.keys(pool.additional_items).filter(k => k.startsWith('col')).sort();
      addKeys.forEach((k, i) => {
        const idx = Math.min(i, items.length - 1);
        const addVals = pool.additional_items[k];
        if (Array.isArray(addVals)) {
          items[idx].push(...addVals);
        }
      });
    }

    return { columns, items };
  }

  // items가 flat string[] (진로직업 9진로04-03 같은 경우)
  if (pool.items && Array.isArray(pool.items) && typeof pool.items[0] === 'string') {
    return { columns, items: [pool.items] };
  }

  return { columns, items: [] };
}

// ─── 진로직업 정규화 ───

function normalizeCareer(raw) {
  const domains = raw.domains.map(d => ({
    domain: d.domain,
    domain_code: d.domain_code,
    sub_domain: null,
    standards: d.standards.map(s => ({
      code: s.code,
      content: s.content, // content는 이미 content
      content_elements: normalizeContentElements(s.content_elements, 'career'),
      considerations: Array.isArray(s.considerations) ? s.considerations : s.considerations ? [s.considerations] : [],
      curriculum_levels: normalizeCurriculumLevels(s.curriculum_levels, 'career'),
      achievement_pool: normalizePoolCareer(s.achievement_pool),
      teaching_references: normalizeTeachingRefs(s.teaching_references),
    })),
  }));

  let total = 0;
  domains.forEach(d => { total += d.standards.length; });

  return {
    subject: raw.subject,
    curriculum: raw.curriculum || '2022 개정 특수교육 기본 교육과정',
    grade_group: raw.grade_group,
    grade_group_code: raw.grade_group_code || '9',
    source: raw.enrichment_source || raw.source,
    extracted_date: raw.extracted_date,
    total_standards: total,
    domains,
  };
}

function normalizePoolCareer(pool) {
  if (!pool) return { columns: [], items: [] };

  const columns = pool.columns || [];

  // Case 1: items format (flat string[]) — 9진로04-03
  if (pool.items && Array.isArray(pool.items) && typeof pool.items[0] === 'string') {
    return { columns, items: [pool.items] };
  }

  // Case 2: items with col objects (like math) — 9진로04-03 variant
  if (pool.items && Array.isArray(pool.items) && pool.items.length > 0 && typeof pool.items[0] === 'object') {
    const first = pool.items[0];
    const colKeys = Object.keys(first).filter(k => k.startsWith('col')).sort();
    const items = colKeys.map(k => Array.isArray(first[k]) ? first[k] : []);
    return { columns, items };
  }

  // Case 3: col1, col2, col3... at top level (most common)
  const colKeys = Object.keys(pool)
    .filter(k => /^col\d+$/.test(k))
    .sort((a, b) => parseInt(a.replace('col', '')) - parseInt(b.replace('col', '')));

  if (colKeys.length > 0) {
    const items = colKeys.map(k => Array.isArray(pool[k]) ? pool[k] : []);
    return { columns, items };
  }

  // Case 4: col2_by_row, col3_by_row — flatten row-grouped data
  const byRowKeys = Object.keys(pool)
    .filter(k => k.includes('_by_row'))
    .sort();

  if (byRowKeys.length > 0) {
    // col1 (flat) + col2_by_row + col3_by_row...
    const items = [];

    // 일반 col 먼저
    const normalCols = Object.keys(pool)
      .filter(k => /^col\d+$/.test(k))
      .sort((a, b) => parseInt(a.replace('col', '')) - parseInt(b.replace('col', '')));

    normalCols.forEach(k => {
      items.push(Array.isArray(pool[k]) ? pool[k] : []);
    });

    // by_row 컬럼: 모든 row의 값을 flat으로 합침
    byRowKeys.forEach(k => {
      const rowObj = pool[k];
      const flatVals = [];
      if (typeof rowObj === 'object' && !Array.isArray(rowObj)) {
        Object.keys(rowObj).sort().forEach(rowKey => {
          const vals = rowObj[rowKey];
          if (Array.isArray(vals)) flatVals.push(...vals);
        });
      }
      items.push(flatVals);
    });

    return { columns, items };
  }

  return { columns, items: [] };
}

// ─── 교수학습 참고자료 정규화 ───

function normalizeTeachingRefs(refs) {
  if (!refs || !Array.isArray(refs)) return [];

  return refs.map(r => {
    // { title, items } 형태 (국어)
    if (typeof r === 'object' && r.title) {
      return { title: r.title, items: Array.isArray(r.items) ? r.items : [] };
    }
    // 문자열 형태 (진로)
    if (typeof r === 'string') {
      return { title: r, items: [] };
    }
    return { title: String(r), items: [] };
  });
}

// ─── 공통 유틸 ───

function normalizeContentElements(ce, subject) {
  if (!ce) return { knowledge_understanding: '', process_skills: '', values_attitudes: '' };

  const mapping = {
    korean: { k: '지식이해', p: '과정기능', v: '가치태도' },
    math: { k: 'knowledge_understanding', p: 'process_skills', v: 'value_attitude' },
    career: { k: 'knowledge', p: 'process', v: 'values' },
  };

  const m = mapping[subject] || mapping.math;
  return {
    knowledge_understanding: ce[m.k] || '',
    process_skills: ce[m.p] || '',
    values_attitudes: ce[m.v] || '',
  };
}

function normalizeCurriculumLevels(levels, subject) {
  if (!levels) return [];

  // Korean/Math: object[] with subject-specific keys
  if (Array.isArray(levels)) {
    return levels.map(lv => {
      if (subject === 'korean') {
        return {
          knowledge_understanding: lv['지식이해'] || lv.knowledge_understanding || '',
          process_skills: lv['과정기능'] || lv.process_skills || '',
          values_attitudes: lv['가치태도'] || lv.values_attitudes || '',
        };
      }
      // math
      return {
        knowledge_understanding: lv.knowledge_understanding || '',
        process_skills: lv.process_skills || '',
        values_attitudes: lv.value_attitude || lv.values_attitudes || '',
      };
    });
  }

  // Career: { knowledge: [...], process: [...], values: [...] }
  if (typeof levels === 'object' && !Array.isArray(levels)) {
    const kArr = levels.knowledge || [];
    const pArr = levels.process || [];
    const vArr = levels.values || [];
    const maxLen = Math.max(kArr.length, pArr.length, vArr.length);
    const result = [];
    for (let i = 0; i < maxLen; i++) {
      result.push({
        knowledge_understanding: kArr[i] || '',
        process_skills: pArr[i] || '',
        values_attitudes: vArr[i] || '',
      });
    }
    return result;
  }

  return [];
}

const DOMAIN_CODE_MAP = {
  '수와 연산': '01', '도형': '02', '측정': '03', '규칙성': '04', '자료와 가능성': '05',
};

function extractDomainCode(domain, subject) {
  if (subject === '수학') return DOMAIN_CODE_MAP[domain] || '00';
  return '00';
}

function normalizeCode(code) {
  // 09수학04-01 → 9수학04-01
  return code.replace(/^0(\d)/, '$1');
}

// ─── 실행 ───

const korean = normalizeKorean(loadJson('korean-middle.json'));
const math = normalizeMath(loadJson('math-middle.json'));
const career = normalizeCareer(loadJson('career-middle.json'));

function writeOutput(data, filename) {
  const path = join(outDir, filename);
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8');

  let stdCount = 0;
  data.domains.forEach(d => { stdCount += d.standards.length; });

  // 검증: pool이 비어있는 항목
  const emptyPools = [];
  data.domains.forEach(d => {
    d.standards.forEach(s => {
      const pool = s.achievement_pool;
      if (!pool || pool.items.length === 0 || pool.items.every(col => col.length === 0)) {
        emptyPools.push(s.code);
      }
    });
  });

  console.log(`✓ ${filename}: ${stdCount}개 성취기준`);
  if (emptyPools.length > 0) {
    console.log(`  ⚠ 빈 pool: ${emptyPools.join(', ')}`);
  }
}

writeOutput(korean, 'korean-middle.json');
writeOutput(math, 'math-middle.json');
writeOutput(career, 'career-middle.json');

// 통합 파일 (전체 74개)
const combined = {
  curriculum: '2022 개정 특수교육 기본 교육과정',
  grade_group: '중학교 1~3학년',
  grade_group_code: '9',
  extracted_date: '2026-03-29',
  total_standards: korean.total_standards + math.total_standards + career.total_standards,
  subjects: [korean, math, career],
};

const combinedPath = join(outDir, 'all-subjects.json');
writeFileSync(combinedPath, JSON.stringify(combined, null, 2), 'utf-8');
console.log(`✓ all-subjects.json: ${combined.total_standards}개 통합`);
console.log(`\n✓ 정규화 완료: ${outDir}`);
