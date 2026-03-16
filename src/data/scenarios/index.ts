import type { Scenario } from '@/types/scenario';

import bds01 from './bds-01-fba-self-injury.json';
import bds02 from './bds-02-inclusive-education.json';
import bds03 from './bds-03-pbs-aggression.json';
import spacedDro01 from './spaced-dro-01-classroom.json';
import spacedDro02 from './spaced-dro-02-playground.json';
import spacedDro03 from './spaced-dro-03-cafeteria.json';

export const ALL_SCENARIOS: readonly Scenario[] = [
  bds01 as Scenario,
  bds02 as Scenario,
  bds03 as Scenario,
  spacedDro01 as Scenario,
  spacedDro02 as Scenario,
  spacedDro03 as Scenario,
];

/** BDS 시나리오만 (기존 단일 시나리오) */
export const BDS_SCENARIOS: readonly Scenario[] = [
  bds01 as Scenario,
  bds02 as Scenario,
  bds03 as Scenario,
];

/** 스페이스드 시나리오만 */
export const SPACED_SCENARIOS: readonly Scenario[] = [
  spacedDro01 as Scenario,
  spacedDro02 as Scenario,
  spacedDro03 as Scenario,
];

export function getScenarioById(id: string): Scenario | undefined {
  return ALL_SCENARIOS.find((s) => s.id === id);
}

export function getScenariosBySubject(subject: string): readonly Scenario[] {
  return ALL_SCENARIOS.filter((s) => s.subject === subject);
}

export { SCENARIO_GROUPS, getGroupById, getGroupByScenarioId } from './groups';
