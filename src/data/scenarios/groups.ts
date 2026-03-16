import type { ScenarioGroup } from '@/types/scenario';

export const SCENARIO_GROUPS: readonly ScenarioGroup[] = [
  {
    groupId: 'dro-variations',
    principle: 'DRO (다른 행동의 차별강화)',
    description: '같은 DRO 원리를 교실→운동장→급식실로 맥락을 바꿔가며 연습합니다. 난이도가 점진적으로 높아지며, DRI/DRA와의 비교도 심화됩니다.',
    scenarioIds: [
      'spaced-dro-01-classroom',
      'spaced-dro-02-playground',
      'spaced-dro-03-cafeteria',
    ],
  },
];

export function getGroupById(groupId: string): ScenarioGroup | undefined {
  return SCENARIO_GROUPS.find((g) => g.groupId === groupId);
}

export function getGroupByScenarioId(scenarioId: string): ScenarioGroup | undefined {
  return SCENARIO_GROUPS.find((g) => g.scenarioIds.includes(scenarioId));
}
