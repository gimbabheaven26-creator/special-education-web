import { getSubjects, getQuizCount } from '@/lib/db';
import { getKiceCounts } from '@/lib/structure-utils';
import StructureClient from './StructureClient';

export default async function StructurePage() {
  const [subjects, quizCounts, kiceCounts] = await Promise.all([
    getSubjects(),
    getQuizCount(),
    Promise.resolve(getKiceCounts()),
  ]);

  return (
    <StructureClient
      subjects={subjects}
      quizCounts={quizCounts}
      kiceCounts={kiceCounts}
    />
  );
}
