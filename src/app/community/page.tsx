import type { Metadata } from 'next';
import { getCommunityQuestions } from '@/lib/db/community-db';
import { getQuestionOfTheDay } from '@/lib/kice/kice';
import { getKSTDate } from '@/lib/date-utils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '커뮤니티 문제',
  description: '수험생이 직접 출제한 문제를 풀고 공유하세요.',
};
import { getSubjects } from '@/lib/db';
import CommunityClient from './CommunityClient';
import { TodayChallenge } from './TodayChallenge';
import { WeeklyRanking } from './WeeklyRanking';

export default async function CommunityPage() {
  const [questions, subjects] = await Promise.all([
    getCommunityQuestions({ sort: 'latest' }),
    getSubjects(),
  ]);

  const dateStr = getKSTDate();
  const todayQuestion = getQuestionOfTheDay(dateStr);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* 오늘의 도전 */}
      {todayQuestion && (
        <TodayChallenge
          question={todayQuestion.question}
          year={todayQuestion.year}
          session={todayQuestion.session}
          dateStr={dateStr}
        />
      )}

      {/* 주간 학습 랭킹 */}
      <WeeklyRanking />

      {/* 커뮤니티 문제 피드 */}
      <CommunityClient
        initialQuestions={questions}
        subjects={subjects.map((s) => ({ slug: s.slug, title: s.title }))}
      />
    </div>
  );
}
