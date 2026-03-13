/**
 * KICE 기출문제 문항별 키워드 분석
 *
 * 문항 단위로 분리 → 키워드 매핑 → 패턴 분석
 * - 각 문항이 어떤 키워드 조합으로 구성되었는지
 * - 전년도 문제 키워드 → 다음 해 문제/정답 키워드 이동
 * - 자주 함께 출현하는 키워드 쌍 (공출현 분석)
 *
 * Usage: node scripts/kice-question-keyword-analysis.mjs
 */

import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

// ─────────────────────────────────────────────────
// 키워드 사전 (kice-keyword-analysis.mjs에서 가져옴)
// ─────────────────────────────────────────────────

const KEYWORD_DICTIONARY = [
  '지적장애', '자폐성장애', '자폐', '자폐스펙트럼', '청각장애', '시각장애',
  '지체장애', '학습장애', '정서행동장애', '정서·행동장애', '건강장애',
  '의사소통장애', '발달지체', '중도중복장애', '중복장애',
  '다운증후군', '프래더-윌리', '프래더윌리', '엔젤만', '윌리엄스', '클라인펠터',
  '뇌성마비', '경직형', '무정위운동형', '실조형', '혼합형',
  '원시반사', 'GMFCS', '근긴장도', '사지마비', '양마비', '편마비',
  '결석발작', '소발작', '대발작', '간질', '뇌전증',
  '점자', '약자', '수표', '점자정보단말기', '묵자', '확대문자',
  '보행훈련', '방향정위', '지팡이보행', '안내법', '핸드트레일링',
  '상부보호법', '하부보호법', '랜드마크', '단서',
  '시력', '시야', '광각', '수동', '지수', '안전', '맹',
  '시기능', '추적', '추종', '주시', '고정',
  '청력도', '청력검사', '순음청력검사', '어음청취역치', '어음명료도',
  '6분법', '4분법', '데시벨', 'dB',
  '인공와우', '보청기', '수신기', '전극', '변환기',
  '수어', '지문자', '구화', '독화', '청능훈련', '잔존청력',
  '의사소통', 'AAC', '보완대체의사소통', '보완대체', '상징체계',
  '반향어', '기능적의사소통', '화용론', '의미론', '구문론', '음운론', '형태론',
  '자발화', '발화', '평균발화길이', 'MLU',
  'EMT', '환경중심언어중재', '강화된환경중심',
  'ABA', '응용행동분석', '행동분석',
  '강화', '정적강화', '부적강화', '강화계획', '연속강화', '간헐강화',
  '소거', '소거저항', '소거폭발',
  '벌', '정적벌', '부적벌',
  '차별강화', 'DRL', 'DRO', 'DRI', 'DRA', 'DRH',
  '행동연쇄', '전진연쇄', '후진연쇄', '총과제제시',
  '촉구', '용암', '시간지연', '최소촉구', '최대촉구',
  '토큰', '토큰경제',
  '자기점검', '자기관리', '자기교수', '자기강화', '자기평가',
  '기능적행동평가', 'FBA', '기능분석', '선행사건', '배경사건', '후속결과',
  '도피', '회피', '관심끌기', '자동강화', '접근',
  'PBS', '긍정적행동지원', '보편적지원', '표적집단지원', '개별화지원',
  '사회적타당도', '행동계약',
  '직접교수', 'DTT', '개별시도교수', 'PRT', '중심축반응훈련',
  '자연적교수', '우연교수', '삽입교수',
  'TEACCH', '구조화된교수', '시각적구조화',
  '사회상황이야기', '파워카드', '비디오모델링',
  '관찰학습', '반두라', '주의', '파지', '재생', '동기화',
  '자기교수법', '자기조절', '인지전략',
  'SRSD', 'POW', 'WWW',
  'CAI', '컴퓨터보조교수', '개인교수형', '시뮬레이션',
  '협력학습', 'TAI', '팀보조개별학습',
  '교수적수정', '교수적합화', '교수환경', '교수내용', '교수방법', '평가방법',
  '보조공학', '스위치', '스캐닝', '화상키보드',
  '교육과정', '기본교육과정', '공통교육과정', '선택중심교육과정',
  '성취기준', '교육과정편성', '교육과정운영',
  '개별화교육', 'IEP', '개별화교육계획', '개별화교육지원팀',
  '자유학기제', '학교스포츠클럽', '집중이수제', '복식학급',
  '2022개정', '2015개정', '교육과정개정',
  '범교과학습주제', '디지털리터러시', '디지털기초소양',
  '전문교과', '기본교과',
  'K-WISC', 'SIS', 'CBM', '교육과정중심측정',
  '준거참조', '규준참조', '표준화검사',
  '타당도', '신뢰도', '내용타당도', '구인타당도', '공인타당도',
  '관찰기록', '사건기록', '지속시간기록', '간격기록', '순간시간표집',
  '일치도', '관찰자간일치도',
  'RTI', '중재반응모델', '불일치모델',
  '진단', '선별', '적격성판별', '수행수준',
  '포트폴리오', '대안평가', '평가조정',
  '통합교육', '통합학급', '협력교수', '공동교수',
  '교수-지원', '스테이션', '병행교수', '대안교수', '팀교수',
  'UDL', '보편적학습설계', '다양한표상수단', '다양한행동표현수단', '다양한참여수단',
  '또래지원', '또래교수', '또래중재',
  '초학문적', '간학문적', '다학문적',
  '전환교육', '전환계획', '전환평가',
  '자기결정', '자기옹호', '자기인식',
  '직업교육', '직업재활', '직업평가',
  '지원고용', '보호고용', '경쟁고용',
  '지역사회중심교수', 'CBI',
  '개인중심계획', 'PCP',
  '일반화', '자극일반화', '반응일반화', '유지',
  '할펀', '브롤린', '콜라', 'LCCE',
  '자연적지원',
  '진로연계교육', '평생학습',
  '특수교육법', '장애인등에대한특수교육법',
  '장애인복지법', '장애인차별금지법',
  '시행령', '시행규칙',
  '특수교육운영위원회', '특수교육지원센터',
  '순회교육', '특수학급', '특수학교',
  '특성화특수학교', '통합학급',
  '배치', '선정', '진단평가',
  '장애인권리협약', '합리적편의', '정당한편의',
  '건강장애', '원격수업', '병원학교',
  '감각통합', '감각처리', '감각프로파일',
  '공동관심', '마음이론', '실행기능', '중앙통합',
  '사회적기술', '사회성', '사회적상호작용',
  'KWCAG', '웹접근성',
  '보치아', '특수체육',
  'STNR', 'ATNR', 'TLR', '긴장성반사',
  '전방지지', '가위자세', '외전근',
];

// ─────────────────────────────────────────────────
// PDF 파싱 + 문항 분리
// ─────────────────────────────────────────────────

async function extractTextFromPdf(pdfPath) {
  const buf = new Uint8Array(fs.readFileSync(pdfPath));
  const parser = new PDFParse(buf);
  await parser.load();
  const result = await parser.getText();
  parser.destroy();
  return result.text;
}

function splitIntoQuestions(text, year, session) {
  // 문항 번호 패턴: "숫자." 또는 "숫자 ."
  // PDF에서 탭/공백이 들어가므로 유연하게 매칭
  const questionPattern = /(?:^|\n)\s*(\d{1,2})\s*[.．]\s/gm;

  const starts = [];
  let match;
  while ((match = questionPattern.exec(text)) !== null) {
    const qNum = parseInt(match[1], 10);
    if (qNum >= 1 && qNum <= 14) {
      starts.push({ index: match.index, number: qNum });
    }
  }

  // 중복 번호 제거 (같은 번호가 여러 번 매칭될 수 있음)
  const deduped = [];
  const seen = new Set();
  for (const s of starts) {
    if (!seen.has(s.number)) {
      seen.add(s.number);
      deduped.push(s);
    }
  }

  const questions = [];
  for (let i = 0; i < deduped.length; i++) {
    const start = deduped[i].index;
    const end = i + 1 < deduped.length ? deduped[i + 1].index : text.length;
    const rawText = text.slice(start, end).trim();

    // 배점 추출
    const pointsMatch = rawText.match(/[[\[【(]\s*(\d{1,2})\s*점\s*[\]】)]/);
    const points = pointsMatch ? parseInt(pointsMatch[1], 10) : 0;

    // 유형 판별
    let type = 'descriptive';
    if (points === 2) type = 'fill_in';
    else if (points >= 10) type = 'essay';

    questions.push({
      id: `${year}-${session}-Q${deduped[i].number}`,
      year,
      session,
      number: deduped[i].number,
      points,
      type,
      rawText,
    });
  }

  return questions;
}

// ─────────────────────────────────────────────────
// 키워드 매칭 (문항 단위)
// ─────────────────────────────────────────────────

function normalizeText(text) {
  return text
    .replace(/\s+/g, '')
    .replace(/[·‧・]/g, '')
    .replace(/[-‐‑–—]/g, '')
    .replace(/[（）\(\)]/g, '')
    .toLowerCase();
}

function normalizeKeyword(kw) {
  return kw
    .replace(/\s+/g, '')
    .replace(/[·‧・]/g, '')
    .replace(/[-‐‑–—]/g, '')
    .replace(/[（）\(\)]/g, '')
    .toLowerCase();
}

function extractKeywordsFromText(text) {
  const normalized = normalizeText(text);
  const found = [];

  for (const kw of KEYWORD_DICTIONARY) {
    const normalizedKw = normalizeKeyword(kw);
    if (normalizedKw.length < 2) continue;

    const escaped = normalizedKw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const matches = normalized.match(new RegExp(escaped, 'g'));
    if (matches && matches.length > 0) {
      found.push({ keyword: kw, count: matches.length });
    }
  }

  // 빈도순 정렬
  return found.sort((a, b) => b.count - a.count);
}

// ─────────────────────────────────────────────────
// 전체 파싱 + 분석
// ─────────────────────────────────────────────────

async function parseAllExams(baseDir) {
  const years = fs.readdirSync(baseDir).filter(d => /^\d{4}$/.test(d)).sort();
  const allQuestions = [];

  for (const year of years) {
    const yearDir = path.join(baseDir, year);
    const files = fs.readdirSync(yearDir).filter(f => f.endsWith('.pdf'));

    for (const file of files) {
      const session = file.includes('전공A') ? 'A' : file.includes('전공B') ? 'B' : '?';
      const filePath = path.join(yearDir, file);

      console.log(`  파싱: ${year}/${file}...`);
      try {
        const text = await extractTextFromPdf(filePath);
        const questions = splitIntoQuestions(text, parseInt(year), session);

        for (const q of questions) {
          q.keywords = extractKeywordsFromText(q.rawText);
          allQuestions.push(q);
        }

        console.log(`    → ${questions.length}문항, 키워드 매핑 완료`);
      } catch (e) {
        console.error(`  ❌ 실패: ${year}/${file} - ${e.message}`);
      }
    }
  }

  return allQuestions;
}

// ─────────────────────────────────────────────────
// 공출현 분석 (Co-occurrence)
// ─────────────────────────────────────────────────

function analyzeCooccurrence(allQuestions) {
  const pairCounts = {};

  for (const q of allQuestions) {
    const kwList = q.keywords.map(k => k.keyword);

    // 모든 키워드 쌍
    for (let i = 0; i < kwList.length; i++) {
      for (let j = i + 1; j < kwList.length; j++) {
        const pair = [kwList[i], kwList[j]].sort().join(' + ');
        pairCounts[pair] = (pairCounts[pair] || 0) + 1;
      }
    }
  }

  return Object.entries(pairCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([pair, count]) => ({ pair, count }));
}

// ─────────────────────────────────────────────────
// 전년도 문제 키워드 → 다음 해 문제 키워드 이동 분석
// ─────────────────────────────────────────────────

function analyzeKeywordMigration(allQuestions) {
  // 연도별 문항 그룹
  const byYear = {};
  for (const q of allQuestions) {
    if (!byYear[q.year]) byYear[q.year] = [];
    byYear[q.year].push(q);
  }

  const years = Object.keys(byYear).map(Number).sort();
  const migrations = [];

  for (let i = 0; i < years.length - 1; i++) {
    const curYear = years[i];
    const nextYear = years[i + 1];
    const curQuestions = byYear[curYear];
    const nextQuestions = byYear[nextYear];

    // 올해 각 문항의 키워드 → 다음 해 어떤 문항에서 다시 나오는지
    const connections = [];

    for (const cq of curQuestions) {
      for (const nq of nextQuestions) {
        const cKws = new Set(cq.keywords.map(k => k.keyword));
        const nKws = new Set(nq.keywords.map(k => k.keyword));

        const shared = [...cKws].filter(kw => nKws.has(kw));
        if (shared.length >= 2) {  // 2개 이상 공유 키워드가 있는 경우만
          connections.push({
            from: cq.id,
            to: nq.id,
            sharedKeywords: shared,
            sharedCount: shared.length,
          });
        }
      }
    }

    // 공유 키워드 수 순으로 정렬
    connections.sort((a, b) => b.sharedCount - a.sharedCount);

    migrations.push({
      from: curYear,
      to: nextYear,
      connections: connections.slice(0, 20),  // 상위 20개만
      totalConnections: connections.length,
    });
  }

  return migrations;
}

// ─────────────────────────────────────────────────
// 보고서 생성
// ─────────────────────────────────────────────────

function generateReport(allQuestions, cooccurrence, migrations) {
  const lines = [];

  lines.push('# KICE 기출문제 문항별 키워드 분석');
  lines.push('');
  lines.push(`> 분석 일자: ${new Date().toISOString().split('T')[0]}`);
  lines.push(`> 총 문항 수: ${allQuestions.length}`);
  lines.push('');

  // === 1. 연도별 문항-키워드 매핑 ===
  const byYear = {};
  for (const q of allQuestions) {
    if (!byYear[q.year]) byYear[q.year] = [];
    byYear[q.year].push(q);
  }

  const years = Object.keys(byYear).map(Number).sort();

  for (const year of years) {
    lines.push(`## ${year}년`);
    lines.push('');

    const questions = byYear[year].sort((a, b) => {
      if (a.session !== b.session) return a.session.localeCompare(b.session);
      return a.number - b.number;
    });

    lines.push('| 문항 | 배점 | 유형 | 핵심 키워드 |');
    lines.push('|------|:---:|------|-----------|');

    for (const q of questions) {
      const kwStr = q.keywords
        .slice(0, 8)
        .map(k => `**${k.keyword}**(${k.count})`)
        .join(', ');
      const typeLabel = q.type === 'fill_in' ? '기입' : q.type === 'essay' ? '논술' : '서술';
      lines.push(`| ${q.session}-${q.number} | ${q.points}점 | ${typeLabel} | ${kwStr || '-'} |`);
    }
    lines.push('');
  }

  // === 2. 키워드 공출현 TOP 50 ===
  lines.push('## 키워드 공출현 분석 (같은 문항에 함께 등장하는 키워드 쌍)');
  lines.push('');
  lines.push('> 두 키워드가 같은 문항에서 함께 출현한 횟수. 출제자의 "조합 패턴"을 보여줌.');
  lines.push('');
  lines.push('| 순위 | 키워드 쌍 | 공출현 횟수 |');
  lines.push('|------|---------|:--------:|');

  for (let i = 0; i < cooccurrence.length; i++) {
    const { pair, count } = cooccurrence[i];
    lines.push(`| ${i + 1} | ${pair} | ${count} |`);
  }
  lines.push('');

  // === 3. 전년도 → 다음 해 문항 연결 ===
  lines.push('## 전년도 → 다음 해 문항 키워드 연결');
  lines.push('');
  lines.push('> 전년도 특정 문항의 키워드가 다음 해 어떤 문항에서 다시 출현하는지.');
  lines.push('> 2개 이상 키워드를 공유하는 문항 쌍만 표시.');
  lines.push('');

  for (const mig of migrations) {
    lines.push(`### ${mig.from}→${mig.to} (총 ${mig.totalConnections}개 연결)`);
    lines.push('');

    if (mig.connections.length === 0) {
      lines.push('2개 이상 키워드를 공유하는 문항 쌍 없음.');
      lines.push('');
      continue;
    }

    lines.push('| 전년 문항 | 다음해 문항 | 공유 키워드 | 수 |');
    lines.push('|---------|---------|-----------|:--:|');

    for (const conn of mig.connections.slice(0, 15)) {
      const kwStr = conn.sharedKeywords.slice(0, 5).join(', ');
      const extra = conn.sharedKeywords.length > 5 ? ` 외 ${conn.sharedKeywords.length - 5}개` : '';
      lines.push(`| ${conn.from} | ${conn.to} | ${kwStr}${extra} | ${conn.sharedCount} |`);
    }
    lines.push('');
  }

  // === 4. 문항별 키워드 다양성 통계 ===
  lines.push('## 문항별 키워드 다양성');
  lines.push('');
  lines.push('> 문항당 포함된 고유 키워드 수 — 값이 클수록 복합 문항');
  lines.push('');

  // 연도별 평균 키워드 수 추이
  lines.push('| 연도 | 평균 키워드/문항 | 최대 | 최소 |');
  lines.push('|------|:-------------:|:---:|:---:|');

  for (const year of years) {
    const qs = byYear[year];
    const kwCounts = qs.map(q => q.keywords.length);
    const avg = (kwCounts.reduce((s, v) => s + v, 0) / kwCounts.length).toFixed(1);
    const max = Math.max(...kwCounts);
    const min = Math.min(...kwCounts);
    lines.push(`| ${year} | ${avg} | ${max} | ${min} |`);
  }
  lines.push('');

  // 가장 키워드가 많은 문항 TOP 10 (복합도 높은 문항)
  lines.push('### 키워드 밀도 TOP 10 (가장 복합적인 문항)');
  lines.push('');

  const sortedByDensity = [...allQuestions].sort((a, b) => b.keywords.length - a.keywords.length);
  lines.push('| 문항 | 키워드 수 | 키워드 목록 |');
  lines.push('|------|:------:|-----------|');

  for (const q of sortedByDensity.slice(0, 10)) {
    const kwStr = q.keywords.slice(0, 10).map(k => k.keyword).join(', ');
    const extra = q.keywords.length > 10 ? ` 외 ${q.keywords.length - 10}개` : '';
    lines.push(`| ${q.id} | ${q.keywords.length} | ${kwStr}${extra} |`);
  }
  lines.push('');

  // === 5. 특정 키워드가 "문제 지문"에서 "정답 키워드"로 전환되는 패턴 ===
  lines.push('## "지문 키워드 → 정답 키워드" 전환 후보 분석');
  lines.push('');
  lines.push('> 기입형(2점) 문항에서 출현하는 키워드는 "정답"일 가능성이 높음.');
  lines.push('> 서술형(4점) 문항 지문에서 출현하는 키워드가 다음 해 기입형에서 나오면,');
  lines.push('> "작년 지문에서 본 용어가 올해 정답이 됐다"는 패턴.');
  lines.push('');

  for (let i = 0; i < years.length - 1; i++) {
    const curYear = years[i];
    const nextYear = years[i + 1];

    // 올해 서술형 키워드
    const curDescKws = new Set();
    for (const q of byYear[curYear]) {
      if (q.type === 'descriptive' || q.type === 'essay') {
        for (const k of q.keywords) {
          curDescKws.add(k.keyword);
        }
      }
    }

    // 다음 해 기입형 키워드
    const nextFillKws = new Set();
    for (const q of byYear[nextYear]) {
      if (q.type === 'fill_in') {
        for (const k of q.keywords) {
          nextFillKws.add(k.keyword);
        }
      }
    }

    // 교집합: 올해 서술형 지문 → 다음 해 기입형 정답 후보
    const overlap = [...curDescKws].filter(kw => nextFillKws.has(kw));

    if (overlap.length > 0) {
      lines.push(`### ${curYear} 서술형 → ${nextYear} 기입형 공유 키워드 (${overlap.length}개)`);
      lines.push('');
      lines.push(`${overlap.join(', ')}`);
      lines.push('');
    }
  }

  // === 6. 2025 서술형 키워드 → 2027 기입형 예측 ===
  lines.push('## 2026 서술형 키워드 → 2027 기입형 정답 후보 예측');
  lines.push('');

  const desc2026Kws = {};
  if (byYear[2026]) {
    for (const q of byYear[2026]) {
      if (q.type === 'descriptive' || q.type === 'essay') {
        for (const k of q.keywords) {
          desc2026Kws[k.keyword] = (desc2026Kws[k.keyword] || 0) + k.count;
        }
      }
    }
  }

  const predCandidates = Object.entries(desc2026Kws)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30);

  if (predCandidates.length > 0) {
    lines.push('> 2026년 서술형 문항에서 빈출된 키워드 = 2027 기입형 정답 후보');
    lines.push('');
    lines.push('| 키워드 | 2026 서술형 출현 횟수 |');
    lines.push('|--------|:----------------:|');
    for (const [kw, count] of predCandidates) {
      lines.push(`| ${kw} | ${count} |`);
    }
  }
  lines.push('');

  return lines.join('\n');
}

// ─────────────────────────────────────────────────
// 메인
// ─────────────────────────────────────────────────

async function main() {
  const baseDir = path.resolve('data/kice-기출');
  const outputDir = path.resolve('docs');

  console.log('=== KICE 문항별 키워드 분석 시작 ===\n');

  // 1. 전체 파싱
  console.log('[1/4] PDF 파싱 + 문항 분리 + 키워드 매핑...');
  const allQuestions = await parseAllExams(baseDir);
  console.log(`\n총 ${allQuestions.length}문항 분석 완료\n`);

  // 2. 공출현 분석
  console.log('[2/4] 키워드 공출현 분석...');
  const cooccurrence = analyzeCooccurrence(allQuestions);

  // 3. 전년도→다음해 이동 분석
  console.log('[3/4] 연도 간 문항 키워드 연결 분석...');
  const migrations = analyzeKeywordMigration(allQuestions);

  // 4. 보고서 생성
  console.log('[4/4] 보고서 생성...');
  const report = generateReport(allQuestions, cooccurrence, migrations);

  const outputPath = path.join(outputDir, 'kice-question-keyword-analysis.md');
  fs.writeFileSync(outputPath, report, 'utf-8');
  console.log(`\n보고서 저장: ${outputPath}`);

  // JSON 원본도 저장
  const jsonData = allQuestions.map(q => ({
    id: q.id,
    year: q.year,
    session: q.session,
    number: q.number,
    points: q.points,
    type: q.type,
    keywords: q.keywords,
    // rawText는 너무 크므로 제외
  }));

  const jsonPath = path.join(outputDir, 'kice-question-keyword-data.json');
  fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf-8');
  console.log(`원본 데이터 저장: ${jsonPath}`);

  console.log('\n=== 분석 완료 ===');
}

main().catch(e => {
  console.error('오류:', e);
  process.exit(1);
});
