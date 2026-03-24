/**
 * 기출 키워드 → 개념학습 URL 매핑
 *
 * 도서관 비유: 기출 키워드가 책 색인(index)이라면,
 * 이 모듈은 색인에서 해당 챕터 페이지를 바로 찾아주는 역할.
 */
import { getAllSubjects, getSubjectFiles } from './concepts';
import { CONCEPTS_FOLDER_TO_SLUG, getConceptUrl } from './concept-urls';

export interface KeywordConceptLink {
  readonly conceptTitle: string;
  readonly url: string;
}

/**
 * 모든 개념 MDX의 kiceKeywords를 순회하여
 * keyword(소문자) → { conceptTitle, url } 매핑을 생성한다.
 *
 * 같은 키워드가 여러 개념에 있으면 첫 번째 매칭만 사용.
 * 서버 컴포넌트에서 빌드 타임에 호출한다.
 */
export function buildKeywordConceptMap(): Record<string, KeywordConceptLink> {
  const map: Record<string, KeywordConceptLink> = {};

  const folders = getAllSubjects();
  for (const folder of folders) {
    const slug = CONCEPTS_FOLDER_TO_SLUG[folder];
    if (!slug) continue;

    const files = getSubjectFiles(folder);
    for (const file of files) {
      for (const kw of file.kiceKeywords) {
        const normalized = kw.trim().toLowerCase();
        if (normalized && !(normalized in map)) {
          map[normalized] = {
            conceptTitle: file.title,
            url: getConceptUrl(slug, file.slug),
          };
        }
      }
    }
  }

  return map;
}
