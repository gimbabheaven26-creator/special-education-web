/**
 * PII(개인식별정보) 필터 — AI 전송 전 학생/교사 식별정보 제거
 */

const SCHOOL_PATTERN = /[가-힣]+(?:초등|중|고등)?학교/g;
const PHONE_PATTERN = /\d{2,3}-\d{3,4}-\d{4}/g;
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const ADDRESS_PATTERN =
  /(?:서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)[시도]?\s*[가-힣]+[시군구]/g;

/** 텍스트에서 PII 패턴을 제거하고 [정보제거]로 대체 */
export function stripPii(text: string, studentName?: string): string {
  let result = text
    .replace(SCHOOL_PATTERN, '[학교명]')
    .replace(PHONE_PATTERN, '[전화번호]')
    .replace(EMAIL_PATTERN, '[이메일]')
    .replace(ADDRESS_PATTERN, '[주소]');

  // 학생 이름 targeted 치환 (2자 이상일 때만 — 1자는 오탐 위험)
  if (studentName && studentName.length >= 2) {
    result = result.replaceAll(studentName, '[학생]');
  }

  return result;
}

/** 객체의 모든 string 값에서 PII 제거 */
export function stripPiiFromObject<T>(obj: T): T {
  if (typeof obj === 'string') return stripPii(obj) as T;
  if (Array.isArray(obj)) return obj.map(stripPiiFromObject) as T;
  if (obj && typeof obj === 'object') {
    const result = { ...obj };
    for (const key of Object.keys(result) as (keyof T & string)[]) {
      result[key] = stripPiiFromObject(result[key]);
    }
    return result;
  }
  return obj;
}
