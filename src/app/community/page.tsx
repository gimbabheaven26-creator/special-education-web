import type { Metadata } from 'next';
import { getCommunityQuestions } from '@/lib/db/community-db';

export const metadata: Metadata = {
  title: '커뮤니티 문제',
  description: '수험생이 직접 출제한 문제를 풀고 공유하세요.',
};
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
