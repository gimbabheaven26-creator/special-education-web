import { getSubjects } from '@/lib/db';
import CreateClient from './CreateClient';

export default async function CreatePage() {
  const subjects = await getSubjects();
  return (
    <CreateClient
      subjects={subjects.map((s) => ({
        slug: s.slug,
        title: s.title,
        chapters: s.chapters.map((c) => ({ slug: c.slug, title: c.title })),
      }))}
    />
  );
}
