import type { CurriculumLevel } from '@/types/achievement-standards'
import type { TargetLevel } from '@/lib/schemas/iep-plan'

const AXIS_LABELS: Record<string, string> = {
  knowledge_understanding: '지식·이해',
  process_skills: '과정·기능',
  values_attitudes: '가치·태도',
}

export function getAxisLabel(axis: string): string {
  return AXIS_LABELS[axis] || axis
}

/**
 * curriculum_levels 행 수와 선택된 인덱스로 target_level 추천.
 *
 * 로직:
 * - 각 축에서 선택한 인덱스의 상대 위치(0~1)를 계산
 * - 상위(index 0) = 우수, 하위(마지막 index) = 기초
 * - 3축 평균 → 기초/보통/우수 매핑
 *
 * @param selectedIndices 3축 각각의 선택 인덱스
 * @param totalRows curriculum_levels 총 행 수
 * @returns 추천 target_level
 */
export function recommendTargetLevel(
  selectedIndices: number[],
  totalRows: number
): TargetLevel {
  if (totalRows <= 1) return '보통'

  const relativePositions = selectedIndices.map(
    (idx) => idx / (totalRows - 1)
  )
  const avgPosition =
    relativePositions.reduce((a, b) => a + b, 0) / relativePositions.length

  // 0 = 상위(우수), 1 = 하위(기초)
  if (avgPosition <= 0.33) return '우수'
  if (avgPosition <= 0.66) return '보통'
  return '기초'
}

/**
 * curriculum_levels에서 특정 축의 모든 수준 텍스트를 추출.
 * 상위(index 0) → 하위(마지막) 순서.
 */
export function getAxisOptions(
  levels: CurriculumLevel[],
  axis: keyof CurriculumLevel
): string[] {
  return levels
    .map((lv) => lv[axis])
    .filter((text) => text && text.trim() !== '')
}

/**
 * 추천 근거 텍스트 생성.
 */
export function getRecommendationReason(
  selectedIndices: number[],
  totalRows: number,
  target: TargetLevel
): string {
  const positions = selectedIndices.map((idx) => {
    if (totalRows <= 1) return '중간'
    const ratio = idx / (totalRows - 1)
    if (ratio <= 0.33) return '상위'
    if (ratio <= 0.66) return '중간'
    return '하위'
  })

  const axes = ['지식·이해', '과정·기능', '가치·태도']
  const details = positions
    .map((pos, i) => `${axes[i] || ''} ${pos}`)
    .join(', ')

  return `3축 평가 결과 (${details}) → '${target}' 수준 추천`
}
