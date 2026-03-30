/** Supabase subject slug → concepts 폴더명 매핑 (클라이언트/서버 공용) */
export const SLUG_TO_CONCEPTS_FOLDER: Record<string, string> = {
  'behavior-support': '행동수정',
  'curriculum': '교육과정',
  'inclusive-education': '통합교육',
  'assessment': '진단평가',
  'transition': '전환교육',
  'visual-impairment': '시각장애',
  'hearing-impairment': '청각장애',
  'physical-disability': '지체장애',
  'communication-disorder': '의사소통장애',
  'introduction': '특수교육학 개론',
  'laws': '관련 법령',
  'aac': 'AAC',
  'autism': '자폐성장애',
  'emotional-behavioral': '정서행동장애',
  'intellectual-disability': '지적장애',
  'assistive-technology': '특수교육공학',
  'learning-disability': '학습장애',
};

/** concepts 폴더명 → Supabase subject slug 역방향 매핑 */
export const CONCEPTS_FOLDER_TO_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(SLUG_TO_CONCEPTS_FOLDER).map(([slug, folder]) => [folder, slug]),
);

/** 영어 subject slug → /concepts/한글폴더 URL 생성 유틸 */
export function getConceptUrl(subjectSlug: string, conceptSlug?: string): string {
  const folder = SLUG_TO_CONCEPTS_FOLDER[subjectSlug];
  if (!folder) return '/concepts';
  const base = `/concepts/${folder}`;
  return conceptSlug ? `${base}/${conceptSlug}` : base;
}
