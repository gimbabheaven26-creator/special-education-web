import { SLUG_TO_CONCEPTS_FOLDER } from '@/lib/content/concept-urls';
import { getSubjectTitle } from '@/lib/study/study-planner';

const CHAPTER_LABEL_OVERRIDES: Record<string, string> = {
  aba: '응용행동분석',
  aac: '보완대체의사소통',
  'assistive-tech': '보조공학',
  'assistive-technology': '특수교육공학',
  braille: '점자',
  cbm: '교육과정중심측정',
  ebd: '정서행동장애',
  fba: '기능적 행동평가',
  'functional-assessment': '기능적 행동평가',
  intervention: '중재',
  'orientation-mobility': '보행훈련',
  pbs: '긍정적 행동지원',
  'positive-behavior-support': '긍정적 행동지원',
  'special-education-act': '특수교육법',
  'visual-training': '시각 활용 훈련',
};

function humanizeSlug(value: string): string {
  return value
    .split(/[-_]+/)
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ');
}

export function hasSlugLikeToken(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return /^[a-z0-9]+(?:[-_][a-z0-9]+)+$/.test(trimmed) || /^[a-z]{2,}$/.test(trimmed);
}

export function getSubjectDisplayName(slug: string): string {
  const examTitle = getSubjectTitle(slug);
  return (examTitle !== slug ? examTitle : undefined) || SLUG_TO_CONCEPTS_FOLDER[slug] || humanizeSlug(slug);
}

export function getChapterDisplayName(
  slug: string,
  titleMap?: Readonly<Record<string, string>>,
): string {
  return titleMap?.[slug] || CHAPTER_LABEL_OVERRIDES[slug] || humanizeSlug(slug);
}
