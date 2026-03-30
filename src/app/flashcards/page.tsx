export const dynamic = 'force-dynamic';

import { getSubjects } from '@/lib/db';
import FlashcardsClient from './FlashcardsClient';

export default async function FlashcardsPage() {
  const subjects = await getSubjects();

  return <FlashcardsClient subjects={subjects} />;
}
