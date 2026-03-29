import { createElement } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CompletionScreen } from '../CompletionScreen';
import type { DailyQuestion } from '@/types/daily';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) =>
    createElement('a', { href, ...props }, children),
}));

vi.mock('@/components/RecommendedChapters', () => ({
  RecommendedChapters: () => createElement('div', { 'data-testid': 'recommended' }),
}));

function makeOxQ(id: string, answer: string): DailyQuestion {
  return { id, type: 'ox', question: `Q ${id}`, answer, chapter: `Ch-${id}`, subject: 'test' };
}

describe('CompletionScreen', () => {
  const questions = [makeOxQ('1', 'O'), makeOxQ('2', 'X'), makeOxQ('3', 'O')];

  it('renders timeslot label', () => {
    render(
      <CompletionScreen
        timeslotLabel="오전"
        oxQuestions={questions}
        oxAnswers={{ '1': 'O', '2': 'X', '3': 'O' }}
      />,
    );
    expect(screen.getByText('오전 학습 완료!')).toBeDefined();
  });

  it('shows 100% feedback for perfect score', () => {
    render(
      <CompletionScreen
        timeslotLabel="오전"
        oxQuestions={questions}
        oxAnswers={{ '1': 'O', '2': 'X', '3': 'O' }}
      />,
    );
    expect(screen.getByText('100%')).toBeDefined();
    expect(screen.getByText(/거의 완벽/)).toBeDefined();
  });

  it('shows encouraging feedback for low score', () => {
    render(
      <CompletionScreen
        timeslotLabel="오후"
        oxQuestions={questions}
        oxAnswers={{ '1': 'X', '2': 'O', '3': 'X' }}
      />,
    );
    // 0/3 = 0%
    expect(screen.getByText('0%')).toBeDefined();
    expect(screen.getByText(/큰 진전/)).toBeDefined();
  });

  it('shows wrong chapters when provided', () => {
    render(
      <CompletionScreen
        timeslotLabel="오전"
        oxQuestions={questions}
        oxAnswers={{ '1': 'X', '2': 'X', '3': 'X' }}
        wrongChapters={['통합교육', '행동지원']}
      />,
    );
    expect(screen.getByText('복습 추천 챕터')).toBeDefined();
    expect(screen.getByText('통합교육')).toBeDefined();
    expect(screen.getByText('행동지원')).toBeDefined();
  });

  it('deduplicates wrong chapters', () => {
    render(
      <CompletionScreen
        timeslotLabel="오전"
        oxQuestions={questions}
        oxAnswers={{ '1': 'X', '2': 'X', '3': 'X' }}
        wrongChapters={['통합교육', '통합교육', '행동지원']}
      />,
    );
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
  });

  it('hides wrong chapters when empty', () => {
    render(
      <CompletionScreen
        timeslotLabel="오전"
        oxQuestions={questions}
        oxAnswers={{ '1': 'O', '2': 'X', '3': 'O' }}
        wrongChapters={[]}
      />,
    );
    expect(screen.queryByText('복습 추천 챕터')).toBeNull();
  });

  it('renders navigation links', () => {
    render(
      <CompletionScreen
        timeslotLabel="오전"
        oxQuestions={questions}
        oxAnswers={{ '1': 'O', '2': 'X', '3': 'O' }}
      />,
    );
    expect(screen.getByText('홈으로 돌아가기')).toBeDefined();
    expect(screen.getByText('오답노트 확인하기')).toBeDefined();
    expect(screen.getByText('개념학습 보기')).toBeDefined();
  });

  it('renders RecommendedChapters widget', () => {
    render(
      <CompletionScreen
        timeslotLabel="오전"
        oxQuestions={questions}
        oxAnswers={{ '1': 'O', '2': 'X', '3': 'O' }}
      />,
    );
    expect(screen.getByTestId('recommended')).toBeDefined();
  });
});
