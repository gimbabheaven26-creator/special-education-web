import { getSubjects } from '@/lib/db';
import AddFlashcardClient from './AddFlashcardClient';

export default async function AddFlashcardPage() {
  const subjects = await getSubjects();

  return <AddFlashcardClient subjects={subjects} />;
}
