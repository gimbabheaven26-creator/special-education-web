import { getSubjects, getQuizCount } from '@/lib/db';
import { getKiceCounts } from '@/lib/structure-utils';
import StructureClient from './StructureClient';
import { AdminOnly } from '@/components/AdminOnly';

export default async function StructurePage() {
  const [subjects, quizCounts, kiceCounts] = await Promise.all([
    getSubjects(),
    getQuizCount(),
    Promise.resolve(getKiceCounts()),
  ]);

  return (
    <AdminOnly>
      <StructureClient
        subjects={subjects}
        quizCounts={quizCounts}
        kiceCounts={kiceCounts}
      />
    </AdminOnly>
  );
}
