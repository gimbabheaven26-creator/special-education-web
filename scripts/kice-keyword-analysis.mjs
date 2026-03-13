/**
 * KICE 특수교육 임용고시 기출문제 키워드 분석 스크립트
 *
 * 기능:
 * 1. 22개 PDF 전체 텍스트 추출
 * 2. 특수교육 전문 키워드 추출 + 빈도 통계
 * 3. 연도별 키워드 출현 매트릭스
 * 4. 전년도 출제 키워드 → 다음 해 정답 크로스 분석
 *
 * Usage: node scripts/kice-keyword-analysis.mjs
 */

import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

// ─────────────────────────────────────────────────
// 특수교육 전문 키워드 사전
// 일상어 제외, 시험에서 채점 기준이 되는 핵심 용어 중심
// ─────────────────────────────────────────────────

const KEYWORD_DICTIONARY = [
  // === 장애 유형 ===
  '지적장애', '자폐성장애', '자폐', '자폐스펙트럼', '청각장애', '시각장애',
  '지체장애', '학습장애', '정서행동장애', '정서·행동장애', '건강장애',
  '의사소통장애', '발달지체', '중도중복장애', '중복장애',

  // === 증후군 / 의학 ===
  '다운증후군', '프래더-윌리', '프래더윌리', '엔젤만', '윌리엄스', '클라인펠터',
  '뇌성마비', '경직형', '무정위운동형', '실조형', '혼합형',
  '원시반사', 'GMFCS', '근긴장도', '사지마비', '양마비', '편마비',
  '결석발작', '소발작', '대발작', '간질', '뇌전증',

  // === 시각장애 관련 ===
  '점자', '약자', '수표', '점자정보단말기', '묵자', '확대문자',
  '보행훈련', '방향정위', '지팡이보행', '안내법', '핸드트레일링',
  '상부보호법', '하부보호법', '랜드마크', '단서',
  '시력', '시야', '광각', '수동', '지수', '안전', '맹',
  '시기능', '추적', '추종', '주시', '고정',

  // === 청각장애 관련 ===
  '청력도', '청력검사', '순음청력검사', '어음청취역치', '어음명료도',
  '6분법', '4분법', '데시벨', 'dB',
  '인공와우', '보청기', '수신기', '전극', '변환기',
  '수어', '지문자', '구화', '독화', '청능훈련', '잔존청력',

  // === 의사소통 / 언어 ===
  '의사소통', 'AAC', '보완대체의사소통', '보완대체', '상징체계',
  '반향어', '기능적의사소통', '화용론', '의미론', '구문론', '음운론', '형태론',
  '자발화', '발화', '평균발화길이', 'MLU',
  'EMT', '환경중심언어중재', '강화된환경중심',

  // === 행동지원 / ABA ===
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

  // === 교수법 / 중재 ===
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

  // === 교육과정 ===
  '교육과정', '기본교육과정', '공통교육과정', '선택중심교육과정',
  '성취기준', '교육과정편성', '교육과정운영',
  '개별화교육', 'IEP', '개별화교육계획', '개별화교육지원팀',
  '자유학기제', '학교스포츠클럽', '집중이수제', '복식학급',
  '2022개정', '2015개정', '교육과정개정',
  '범교과학습주제', '디지털리터러시', '디지털기초소양',
  '전문교과', '기본교과',

  // === 진단 / 평가 ===
  'K-WISC', 'SIS', 'CBM', '교육과정중심측정',
  '준거참조', '규준참조', '표준화검사',
  '타당도', '신뢰도', '내용타당도', '구인타당도', '공인타당도',
  '관찰기록', '사건기록', '지속시간기록', '간격기록', '순간시간표집',
  '일치도', '관찰자간일치도',
  'RTI', '중재반응모델', '불일치모델',
  '진단', '선별', '적격성판별', '수행수준',
  '포트폴리오', '대안평가', '평가조정',

  // === 통합교육 ===
  '통합교육', '통합학급', '협력교수', '공동교수',
  '교수-지원', '스테이션', '병행교수', '대안교수', '팀교수',
  'UDL', '보편적학습설계', '다양한표상수단', '다양한행동표현수단', '다양한참여수단',
  '또래지원', '또래교수', '또래중재',
  '초학문적', '간학문적', '다학문적',

  // === 전환교육 ===
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

  // === 법령 ===
  '특수교육법', '장애인등에대한특수교육법',
  '장애인복지법', '장애인차별금지법',
  '시행령', '시행규칙',
  '특수교육운영위원회', '특수교육지원센터',
  '순회교육', '특수학급', '특수학교',
  '특성화특수학교', '통합학급',
  '배치', '선정', '진단평가',
  '장애인권리협약', '합리적편의', '정당한편의',
  '건강장애', '원격수업', '병원학교',

  // === 기타 핵심 ===
  '감각통합', '감각처리', '감각프로파일',
  '공동관심', '마음이론', '실행기능', '중앙통합',
  '사회적기술', '사회성', '사회적상호작용',
  'KWCAG', '웹접근성',
  '보치아', '특수체육',
  'STNR', 'ATNR', 'TLR', '긴장성반사',
  '전방지지', '가위자세', '외전근',
];

// ─────────────────────────────────────────────────
// PDF 파싱
// ─────────────────────────────────────────────────

async function extractTextFromPdf(pdfPath) {
  const buf = new Uint8Array(fs.readFileSync(pdfPath));
  const parser = new PDFParse(buf);
  await parser.load();
  const result = await parser.getText();
  parser.destroy();
  return result.text;
}

async function extractAllPdfs(baseDir) {
  const years = fs.readdirSync(baseDir).filter(d => /^\d{4}$/.test(d)).sort();
  const allData = [];

  for (const year of years) {
    const yearDir = path.join(baseDir, year);
    const files = fs.readdirSync(yearDir).filter(f => f.endsWith('.pdf'));

    for (const file of files) {
      const session = file.includes('전공A') ? 'A' : file.includes('전공B') ? 'B' : 'unknown';
      const filePath = path.join(yearDir, file);

      console.log(`  파싱: ${year}/${file}...`);
      try {
        const text = await extractTextFromPdf(filePath);
        allData.push({ year: parseInt(year), session, text, file });
      } catch (e) {
        console.error(`  ❌ 파싱 실패: ${year}/${file} - ${e.message}`);
      }
    }
  }

  return allData;
}

// ─────────────────────────────────────────────────
// 키워드 매칭
// ─────────────────────────────────────────────────

function normalizeText(text) {
  return text
    .replace(/\s+/g, '')  // 공백 제거 (PDF 파싱 시 단어 중간에 공백 삽입되는 경우)
    .replace(/[·‧・]/g, '')  // 가운데점 제거
    .replace(/[-‐‑–—]/g, '')  // 하이픈 계열 제거
    .replace(/[（）\(\)]/g, '')  // 괄호 제거
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

function countKeywords(text, keywords) {
  const normalizedText = normalizeText(text);
  const counts = {};

  for (const kw of keywords) {
    const normalizedKw = normalizeKeyword(kw);
    if (normalizedKw.length < 2) continue;

    // 정규식 특수문자 이스케이프
    const escaped = normalizedKw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const matches = normalizedText.match(new RegExp(escaped, 'g'));
    const count = matches ? matches.length : 0;

    if (count > 0) {
      // 원본 키워드를 키로 사용
      counts[kw] = (counts[kw] || 0) + count;
    }
  }

  return counts;
}

// ─────────────────────────────────────────────────
// 분석
// ─────────────────────────────────────────────────

function analyzeYearlyKeywords(allData, keywords) {
  const yearlyData = {};

  for (const { year, session, text } of allData) {
    const key = `${year}`;
    if (!yearlyData[key]) {
      yearlyData[key] = { year, texts: [], keywordCounts: {} };
    }
    yearlyData[key].texts.push({ session, text });
  }

  // 연도별 키워드 카운트
  for (const [key, data] of Object.entries(yearlyData)) {
    const combinedText = data.texts.map(t => t.text).join('\n');
    data.keywordCounts = countKeywords(combinedText, keywords);
  }

  return yearlyData;
}

function buildCrossYearAnalysis(yearlyData) {
  const years = Object.keys(yearlyData).map(Number).sort();
  const crossPatterns = [];

  for (let i = 0; i < years.length - 1; i++) {
    const currentYear = years[i];
    const nextYear = years[i + 1];

    const currentKws = yearlyData[String(currentYear)].keywordCounts;
    const nextKws = yearlyData[String(nextYear)].keywordCounts;

    // 올해 출현한 키워드 중 다음 해에도 출현한 것
    const carried = {};
    const newInNext = {};
    const droppedFromCurrent = {};

    for (const [kw, count] of Object.entries(currentKws)) {
      if (nextKws[kw]) {
        carried[kw] = { current: count, next: nextKws[kw] };
      } else {
        droppedFromCurrent[kw] = count;
      }
    }

    for (const [kw, count] of Object.entries(nextKws)) {
      if (!currentKws[kw]) {
        newInNext[kw] = count;
      }
    }

    crossPatterns.push({
      from: currentYear,
      to: nextYear,
      carriedCount: Object.keys(carried).length,
      newCount: Object.keys(newInNext).length,
      droppedCount: Object.keys(droppedFromCurrent).length,
      carried,
      newKeywords: newInNext,
      droppedKeywords: droppedFromCurrent,
    });
  }

  return crossPatterns;
}

// ─────────────────────────────────────────────────
// 출력
// ─────────────────────────────────────────────────

function generateReport(yearlyData, crossPatterns) {
  const lines = [];
  const years = Object.keys(yearlyData).map(Number).sort();

  lines.push('# KICE 특수교육 임용고시 키워드 분석 보고서');
  lines.push('');
  lines.push(`> 분석 일자: ${new Date().toISOString().split('T')[0]}`);
  lines.push(`> 분석 대상: ${years[0]}~${years[years.length - 1]}년 전공A/B`);
  lines.push(`> 키워드 사전: ${KEYWORD_DICTIONARY.length}개 용어`);
  lines.push('');

  // === 1. 전체 키워드 빈도 TOP 50 ===
  lines.push('## 1. 전체 키워드 빈도 TOP 50');
  lines.push('');

  const totalCounts = {};
  for (const data of Object.values(yearlyData)) {
    for (const [kw, count] of Object.entries(data.keywordCounts)) {
      totalCounts[kw] = (totalCounts[kw] || 0) + count;
    }
  }

  const sorted = Object.entries(totalCounts).sort((a, b) => b[1] - a[1]);
  lines.push('| 순위 | 키워드 | 총 출현 횟수 | 출현 연도 수 |');
  lines.push('|------|--------|:----------:|:----------:|');

  for (let i = 0; i < Math.min(50, sorted.length); i++) {
    const [kw, count] = sorted[i];
    const yearCount = years.filter(y => yearlyData[String(y)].keywordCounts[kw]).length;
    lines.push(`| ${i + 1} | ${kw} | ${count} | ${yearCount}/${years.length} |`);
  }
  lines.push('');

  // === 2. 연도별 키워드 출현 매트릭스 (TOP 30) ===
  lines.push('## 2. 연도별 키워드 출현 매트릭스 (TOP 30)');
  lines.push('');

  const top30 = sorted.slice(0, 30).map(s => s[0]);
  const header = '| 키워드 | ' + years.map(y => `${y}` ).join(' | ') + ' |';
  const divider = '|--------|' + years.map(() => ':---:').join('|') + '|';
  lines.push(header);
  lines.push(divider);

  for (const kw of top30) {
    const row = years.map(y => {
      const count = yearlyData[String(y)].keywordCounts[kw] || 0;
      return count > 0 ? String(count) : '-';
    });
    lines.push(`| ${kw} | ${row.join(' | ')} |`);
  }
  lines.push('');

  // === 3. 연도별 키워드 수 통계 ===
  lines.push('## 3. 연도별 고유 키워드 수');
  lines.push('');
  lines.push('| 연도 | 고유 키워드 수 | 총 출현 횟수 |');
  lines.push('|------|:----------:|:----------:|');

  for (const y of years) {
    const kws = yearlyData[String(y)].keywordCounts;
    const unique = Object.keys(kws).length;
    const total = Object.values(kws).reduce((s, v) => s + v, 0);
    lines.push(`| ${y} | ${unique} | ${total} |`);
  }
  lines.push('');

  // === 4. 전년도 → 다음 해 키워드 이동 패턴 ===
  lines.push('## 4. 전년도 → 다음 해 키워드 이동 패턴');
  lines.push('');
  lines.push('> 전년도에 출제된 키워드가 다음 해에도 출현하는지, 새로 등장하는 키워드는 무엇인지 분석');
  lines.push('');

  lines.push('### 4.1 이동 요약');
  lines.push('');
  lines.push('| 기간 | 유지 | 새로 등장 | 사라짐 | 유지율 |');
  lines.push('|------|:---:|:-------:|:-----:|:-----:|');

  for (const cp of crossPatterns) {
    const totalCurrent = cp.carriedCount + cp.droppedCount;
    const retentionRate = totalCurrent > 0
      ? ((cp.carriedCount / totalCurrent) * 100).toFixed(1) + '%'
      : '-';
    lines.push(`| ${cp.from}→${cp.to} | ${cp.carriedCount} | ${cp.newCount} | ${cp.droppedCount} | ${retentionRate} |`);
  }
  lines.push('');

  // === 5. 새로 등장한 키워드 (연도별) ===
  lines.push('### 4.2 각 연도에 새로 등장한 키워드');
  lines.push('');

  for (const cp of crossPatterns) {
    const newKws = Object.entries(cp.newKeywords).sort((a, b) => b[1] - a[1]);
    if (newKws.length === 0) continue;

    lines.push(`#### ${cp.to}년 신규 (${cp.from}년에 없던 키워드)`);
    lines.push('');
    lines.push(`| 키워드 | 출현 횟수 |`);
    lines.push(`|--------|:-------:|`);
    for (const [kw, count] of newKws.slice(0, 20)) {
      lines.push(`| ${kw} | ${count} |`);
    }
    if (newKws.length > 20) {
      lines.push(`| ... 외 ${newKws.length - 20}개 | |`);
    }
    lines.push('');
  }

  // === 6. 사라진 키워드 (연도별) ===
  lines.push('### 4.3 각 연도에 사라진 키워드');
  lines.push('');

  for (const cp of crossPatterns) {
    const dropped = Object.entries(cp.droppedKeywords).sort((a, b) => b[1] - a[1]);
    if (dropped.length === 0) continue;

    lines.push(`#### ${cp.to}년에 사라짐 (${cp.from}년에 있었으나 ${cp.to}년에 없음)`);
    lines.push('');
    lines.push(`| 키워드 | ${cp.from}년 출현 횟수 |`);
    lines.push(`|--------|:---------------:|`);
    for (const [kw, count] of dropped.slice(0, 15)) {
      lines.push(`| ${kw} | ${count} |`);
    }
    if (dropped.length > 15) {
      lines.push(`| ... 외 ${dropped.length - 15}개 | |`);
    }
    lines.push('');
  }

  // === 7. 연속 출현 키워드 (매년 빠지지 않는 핵심) ===
  lines.push('## 5. 매년 출현하는 핵심 키워드 (개근 키워드)');
  lines.push('');

  const alwaysPresent = sorted.filter(([kw]) =>
    years.every(y => yearlyData[String(y)].keywordCounts[kw] > 0)
  );

  if (alwaysPresent.length > 0) {
    lines.push(`총 ${alwaysPresent.length}개 키워드가 ${years.length}개년 모두 출현:`);
    lines.push('');
    lines.push('| 키워드 | 총 출현 횟수 | 연평균 |');
    lines.push('|--------|:----------:|:-----:|');
    for (const [kw, count] of alwaysPresent) {
      lines.push(`| ${kw} | ${count} | ${(count / years.length).toFixed(1)} |`);
    }
  } else {
    lines.push('모든 연도에 출현하는 키워드 없음.');
  }
  lines.push('');

  // === 8. 2년 연속 출현 후 다음 해 출현 확률 ===
  lines.push('## 6. 2년 연속 출현 → 다음 해 출현 확률');
  lines.push('');
  lines.push('> 2년 연속 출현한 키워드가 3년차에도 나올 확률');
  lines.push('');

  let twoYearConsecutive = 0;
  let threeYearConsecutive = 0;

  for (let i = 0; i < years.length - 2; i++) {
    const y1 = String(years[i]);
    const y2 = String(years[i + 1]);
    const y3 = String(years[i + 2]);

    for (const kw of Object.keys(yearlyData[y1].keywordCounts)) {
      if (yearlyData[y2].keywordCounts[kw]) {
        twoYearConsecutive++;
        if (yearlyData[y3].keywordCounts[kw]) {
          threeYearConsecutive++;
        }
      }
    }
  }

  const probability = twoYearConsecutive > 0
    ? ((threeYearConsecutive / twoYearConsecutive) * 100).toFixed(1)
    : 0;

  lines.push(`- 2년 연속 출현 건수: ${twoYearConsecutive}`);
  lines.push(`- 그 중 3년차에도 출현: ${threeYearConsecutive}`);
  lines.push(`- **확률: ${probability}%**`);
  lines.push('');

  // 구체적 예시
  lines.push('### 최근 2년(2025-2026) 연속 출현 → 2027 예측 후보');
  lines.push('');

  const lastTwo = years.slice(-2).map(String);
  if (lastTwo.length === 2) {
    const y1data = yearlyData[lastTwo[0]]?.keywordCounts || {};
    const y2data = yearlyData[lastTwo[1]]?.keywordCounts || {};

    const candidates = [];
    for (const kw of Object.keys(y1data)) {
      if (y2data[kw]) {
        candidates.push({
          keyword: kw,
          count2025: y1data[kw],
          count2026: y2data[kw],
        });
      }
    }

    candidates.sort((a, b) => (b.count2025 + b.count2026) - (a.count2025 + a.count2026));

    lines.push('| 키워드 | 2025 출현 | 2026 출현 | 합계 |');
    lines.push('|--------|:-------:|:-------:|:---:|');
    for (const c of candidates.slice(0, 30)) {
      lines.push(`| ${c.keyword} | ${c.count2025} | ${c.count2026} | ${c.count2025 + c.count2026} |`);
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

  console.log('=== KICE 특수교육 키워드 분석 시작 ===\n');

  // 1. PDF 전체 파싱
  console.log('[1/4] PDF 텍스트 추출...');
  const allData = await extractAllPdfs(baseDir);
  console.log(`\n총 ${allData.length}개 PDF 파싱 완료\n`);

  // 2. 연도별 키워드 분석
  console.log('[2/4] 키워드 분석...');
  const yearlyData = analyzeYearlyKeywords(allData, KEYWORD_DICTIONARY);

  // 3. 크로스 분석
  console.log('[3/4] 연도 간 크로스 분석...');
  const crossPatterns = buildCrossYearAnalysis(yearlyData);

  // 4. 보고서 생성
  console.log('[4/4] 보고서 생성...');
  const report = generateReport(yearlyData, crossPatterns);

  const outputPath = path.join(outputDir, 'kice-keyword-analysis.md');
  fs.writeFileSync(outputPath, report, 'utf-8');
  console.log(`\n보고서 저장: ${outputPath}`);

  // JSON 원본 데이터도 저장
  const jsonOutput = {
    generatedAt: new Date().toISOString(),
    keywordDictionarySize: KEYWORD_DICTIONARY.length,
    yearlyData: Object.fromEntries(
      Object.entries(yearlyData).map(([k, v]) => [k, {
        year: v.year,
        keywordCounts: v.keywordCounts,
      }])
    ),
    crossPatterns,
  };

  const jsonPath = path.join(outputDir, 'kice-keyword-data.json');
  fs.writeFileSync(jsonPath, JSON.stringify(jsonOutput, null, 2), 'utf-8');
  console.log(`원본 데이터 저장: ${jsonPath}`);

  console.log('\n=== 분석 완료 ===');
}

main().catch(e => {
  console.error('오류:', e);
  process.exit(1);
});
