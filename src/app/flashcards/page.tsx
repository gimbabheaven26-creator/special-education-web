export const dynamic = 'force-dynamic';

import { getCachedSubjects } from '@/lib/db';
import FlashcardsClient from './FlashcardsClient';

export default async function FlashcardsPage() {
  const subjects = await getCachedSubjects();

  return <FlashcardsClient subjects={subjects} />;
}
