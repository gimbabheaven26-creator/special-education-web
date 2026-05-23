import type { Metadata } from 'next';

import { getAllQuizzes } from '@/lib/db/quiz';
import {
  practiceSessions,
  type PracticeModeId,
} from '@/lib/sew-next/prototype-data';
import {
  buildSewNextPracticeSession,
  getQbankFiltersFromSearchParams,
} from '@/lib/sew-next/qbank';
import { buildMockExamSession } from '@/lib/sew-next/mock-exam';
import { PracticeSessionClient } from './PracticeSessionClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'SEW Next Practice',
  description: 'SEW Next의 문제풀이, 해설, AI 코칭, 복습 예약을 연결한 세션 프로토타입입니다.',
};

interface NextPracticePageProps {
  searchParams?: {
    mode?: string;
    domain?: string;
    difficulty?: string;
    format?: string;
  };
}

const modes = new Set<PracticeModeId>(['adaptive', 'custom', 'mock', 'review']);

function getMode(value: string | undefined): PracticeModeId {
  return value && modes.has(value as PracticeModeId) ? (value as PracticeModeId) : 'adaptive';
}

export default async function NextPracticePage({ searchParams }: NextPracticePageProps) {
  const mode = getMode(searchParams?.mode);
  let session = practiceSessions[mode];

  if (mode === 'custom') {
    const quizzes = await getAllQuizzes();
    session = buildSewNextPracticeSession({
      mode,
      quizzes,
      filters: getQbankFiltersFromSearchParams(searchParams ?? {}),
      fallback: practiceSessions.custom,
    });
  }

  if (mode === 'mock') {
    const quizzes = await getAllQuizzes();
    session = buildMockExamSession({
      quizzes,
      fallback: practiceSessions.mock,
    });
  }

  return <PracticeSessionClient session={session} />;
}
