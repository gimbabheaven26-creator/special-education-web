export const dynamic = 'force-dynamic';

import { getSubjects } from '@/lib/db';
import SearchClient from './SearchClient';

export default async function SearchPage() {
  const subjects = await getSubjects();

  return <SearchClient subjects={subjects} />;
}
