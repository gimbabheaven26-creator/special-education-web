import { notFound } from 'next/navigation';
import { getScenarioById, ALL_SCENARIOS } from '@/data/scenarios';
import ScenarioClient from './ScenarioClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return ALL_SCENARIOS.map((s) => ({ id: s.id }));
}

export default async function ScenarioPage({ params }: PageProps) {
  const { id } = await params;
  const scenario = getScenarioById(id);

  if (!scenario) {
    notFound();
  }

  return <ScenarioClient scenario={scenario} />;
}
