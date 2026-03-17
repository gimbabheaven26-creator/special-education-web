import { getCommunityQuestions } from '@/lib/community-db';
import { getSubjects } from '@/lib/db';
import CommunityClient from './CommunityClient';

export default async function CommunityPage() {
  const [questions, subjects] = await Promise.all([
    getCommunityQuestions({ sort: 'latest' }),
    getSubjects(),
  ]);
  return (
    <CommunityClient
      initialQuestions={questions}
      subjects={subjects.map((s) => ({ slug: s.slug, title: s.title }))}
    />
  );
}
