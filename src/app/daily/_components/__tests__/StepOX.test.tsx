import { createElement } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StepOX } from '../StepOX';
import type { DailyQuestion } from '@/types/daily';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) =>
    createElement('a', { href, ...props }, children),
}));

vi.mock('@/lib/content/concept-urls', () => ({
  getConceptUrl: (s: string) => '/concepts/' + s,
}));

function makeOXQuestion(id: string, answer: string, chapter = '행동지원'): DailyQuestion {
  return {
    id,
    type: 'ox',
    question: `문제 ${id}`,
    answer,
    chapter,
    subject: '행동지원',
  };
}

function makeQuestions(count: number): DailyQuestion[] {
  return Array.from({ length: count }, (_, i) =>
    makeOXQuestion(`ox-${i + 1}`, i % 2 === 0 ? 'O' : 'X', i < 3 ? '챕터A' : '챕터B'),
  );
}

describe('StepOX', () => {
  const questions = makeQuestions(3);

  const defaultProps = {
    oxQuestions: questions,
    oxAnswers: {} as Record<string, 'O' | 'X'>,
    onAnswer: vi.fn(),
    revealed: false,
    allOxAnswered: false,
    step1Done: false,
    wrongChaptersStep1: [] as string[],
    onFinishStep1: vi.fn(),
    onProceedToStep2: vi.fn(),
  };

  it('renders all OX questions', () => {
    render(<StepOX {...defaultProps} />);

    expect(screen.getByText('문제 ox-1')).toBeDefined();
    expect(screen.getByText('문제 ox-2')).toBeDefined();
    expect(screen.getByText('문제 ox-3')).toBeDefined();
  });

  it('renders grading button when step1 is not done', () => {
    render(<StepOX {...defaultProps} />);
    expect(screen.getByText('채점하기')).toBeDefined();
  });

  it('grading button is disabled when not all questions are answered', () => {
    render(<StepOX {...defaultProps} allOxAnswered={false} />);

    const button = screen.getByText('채점하기');
    expect(button.hasAttribute('disabled')).toBe(true);
  });

  it('grading button is enabled when all questions are answered', () => {
    render(<StepOX {...defaultProps} allOxAnswered={true} />);

    const button = screen.getByText('채점하기');
    expect(button.hasAttribute('disabled')).toBe(false);
  });

  it('calls onFinishStep1 when grading button is clicked', () => {
    const onFinishStep1 = vi.fn();
    render(<StepOX {...defaultProps} allOxAnswered={true} onFinishStep1={onFinishStep1} />);

    fireEvent.click(screen.getByText('채점하기'));
    expect(onFinishStep1).toHaveBeenCalledOnce();
  });

  it('hides grading button when step1 is done', () => {
    render(<StepOX {...defaultProps} step1Done={true} revealed={true} />);
    expect(screen.queryByText('채점하기')).toBeNull();
  });

  it('shows score after grading (all correct)', () => {
    const answers: Record<string, 'O' | 'X'> = {
      'ox-1': 'O',
      'ox-2': 'X',
      'ox-3': 'O',
    };
    render(
      <StepOX
        {...defaultProps}
        oxAnswers={answers}
        step1Done={true}
        revealed={true}
      />,
    );

    expect(screen.getByText(/정답: 3 \/ 3/)).toBeDefined();
  });

  it('shows score with wrong answers', () => {
    const answers: Record<string, 'O' | 'X'> = {
      'ox-1': 'X', // wrong (correct is O)
      'ox-2': 'X', // correct
      'ox-3': 'X', // wrong (correct is O)
    };
    render(
      <StepOX
        {...defaultProps}
        oxAnswers={answers}
        step1Done={true}
        revealed={true}
      />,
    );

    expect(screen.getByText(/정답: 1 \/ 3/)).toBeDefined();
  });

  it('shows wrong chapters when there are wrong answers', () => {
    render(
      <StepOX
        {...defaultProps}
        step1Done={true}
        revealed={true}
        wrongChaptersStep1={['챕터A', '챕터B']}
      />,
    );

    expect(screen.getByText(/취약 챕터/)).toBeDefined();
    expect(screen.getByText(/취약 챕터/).textContent).toContain('챕터A');
    expect(screen.getByText(/취약 챕터/).textContent).toContain('챕터B');
  });

  it('does not show wrong chapters when all answers are correct', () => {
    render(
      <StepOX
        {...defaultProps}
        step1Done={true}
        revealed={true}
        wrongChaptersStep1={[]}
      />,
    );

    expect(screen.queryByText(/취약 챕터/)).toBeNull();
  });

  it('shows retry and proceed buttons when there are wrong chapters', () => {
    render(
      <StepOX
        {...defaultProps}
        step1Done={true}
        revealed={true}
        wrongChaptersStep1={['챕터A']}
      />,
    );

    expect(screen.getByText(/틀린 영역 OX 다시 풀기/)).toBeDefined();
    expect(screen.getByText(/단답형으로 넘어가기/)).toBeDefined();
  });

  it('calls onProceedToStep2(true) when retry button is clicked', () => {
    const onProceedToStep2 = vi.fn();
    render(
      <StepOX
        {...defaultProps}
        step1Done={true}
        revealed={true}
        wrongChaptersStep1={['챕터A']}
        onProceedToStep2={onProceedToStep2}
      />,
    );

    fireEvent.click(screen.getByText(/틀린 영역 OX 다시 풀기/));
    expect(onProceedToStep2).toHaveBeenCalledWith(true);
  });

  it('calls onProceedToStep2(false) when proceed button is clicked (with wrong chapters)', () => {
    const onProceedToStep2 = vi.fn();
    render(
      <StepOX
        {...defaultProps}
        step1Done={true}
        revealed={true}
        wrongChaptersStep1={['챕터A']}
        onProceedToStep2={onProceedToStep2}
      />,
    );

    fireEvent.click(screen.getByText(/단답형으로 넘어가기/));
    expect(onProceedToStep2).toHaveBeenCalledWith(false);
  });

  it('shows only proceed button when all answers are correct', () => {
    render(
      <StepOX
        {...defaultProps}
        step1Done={true}
        revealed={true}
        wrongChaptersStep1={[]}
      />,
    );

    expect(screen.queryByText(/틀린 영역 OX 다시 풀기/)).toBeNull();
    expect(screen.getByText(/단답형으로 넘어가기/)).toBeDefined();
  });

  it('calls onProceedToStep2(false) when proceed button is clicked (all correct)', () => {
    const onProceedToStep2 = vi.fn();
    render(
      <StepOX
        {...defaultProps}
        step1Done={true}
        revealed={true}
        wrongChaptersStep1={[]}
        onProceedToStep2={onProceedToStep2}
      />,
    );

    fireEvent.click(screen.getByText(/단답형으로 넘어가기/));
    expect(onProceedToStep2).toHaveBeenCalledWith(false);
  });
});
