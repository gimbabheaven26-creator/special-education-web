import type { Scenario } from '@/types/scenario';

import bds01 from './bds-01-fba-self-injury.json';
import bds02 from './bds-02-inclusive-education.json';
import bds03 from './bds-03-pbs-aggression.json';

export const ALL_SCENARIOS: readonly Scenario[] = [
  bds01 as Scenario,
  bds02 as Scenario,
  bds03 as Scenario,
];

export function getScenarioById(id: string): Scenario | undefined {
  return ALL_SCENARIOS.find((s) => s.id === id);
}

export function getScenariosBySubject(subject: string): readonly Scenario[] {
  return ALL_SCENARIOS.filter((s) => s.subject === subject);
}
