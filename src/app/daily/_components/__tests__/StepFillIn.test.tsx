import { createElement } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StepFillIn } from '../StepFillIn';
import type { DailyQuestion } from '@/types/daily';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) =>
    createElement('a', { href, ...props }, children),
}));

vi.mock('@/lib/concept-urls', () => ({
  getConceptUrl: (s: string) => '/concepts/' + s,
}));

function makeFillInQuestion(id: string): DailyQuestion {
  return {
    id,
    type: 'fill_in',
    question: `단답형 문제 ${id}`,
    answer: `답 ${id}`,
    chapter: '챕터A',
    subject: '행동지원',
  };
}

describe('StepFillIn', () => {
  const questions = [makeFillInQuestion('f-1'), makeFillInQuestion('f-2')];

  const defaultProps = {
    fillInQuestions: questions,
    revealed: false,
    step2Done: false,
    onFinishStep2: vi.fn(),
    onProceedToStep3: vi.fn(),
  };

  it('renders instruction text', () => {
    render(<StepFillIn {...defaultProps} />);
    expect(screen.getByText(/문제를 읽고 답을 생각해보세요/)).toBeDefined();
  });

  it('renders all fill-in questions', () => {
    render(<StepFillIn {...defaultProps} />);

    expect(screen.getByText('단답형 문제 f-1')).toBeDefined();
    expect(screen.getByText('단답형 문제 f-2')).toBeDefined();
  });

  it('renders questions as input (not textarea)', () => {
    render(<StepFillIn {...defaultProps} />);

    const inputs = screen.getAllByPlaceholderText('답을 입력해보세요...');
    expect(inputs).toHaveLength(2);
    expect(inputs[0].tagName).toBe('INPUT');
  });

  it('renders answer reveal button when not done', () => {
    render(<StepFillIn {...defaultProps} />);
    expect(screen.getByText('답안 확인')).toBeDefined();
  });

  it('calls onFinishStep2 when answer reveal button is clicked', () => {
    const onFinishStep2 = vi.fn();
    render(<StepFillIn {...defaultProps} onFinishStep2={onFinishStep2} />);

    fireEvent.click(screen.getByText('답안 확인'));
    expect(onFinishStep2).toHaveBeenCalledOnce();
  });

  it('hides answer reveal button when step2 is done', () => {
    render(<StepFillIn {...defaultProps} step2Done={true} revealed={true} />);
    expect(screen.queryByText('답안 확인')).toBeNull();
  });

  it('shows retry and proceed buttons after step2 is done', () => {
    render(<StepFillIn {...defaultProps} step2Done={true} revealed={true} />);

    expect(screen.getByText(/단답형 한번 더/)).toBeDefined();
    expect(screen.getByText(/서술형으로 넘어가기/)).toBeDefined();
  });

  it('calls onProceedToStep3(true) when retry button is clicked', () => {
    const onProceedToStep3 = vi.fn();
    render(
      <StepFillIn {...defaultProps} step2Done={true} revealed={true} onProceedToStep3={onProceedToStep3} />,
    );

    fireEvent.click(screen.getByText(/단답형 한번 더/));
    expect(onProceedToStep3).toHaveBeenCalledWith(true);
  });

  it('calls onProceedToStep3(false) when proceed button is clicked', () => {
    const onProceedToStep3 = vi.fn();
    render(
      <StepFillIn {...defaultProps} step2Done={true} revealed={true} onProceedToStep3={onProceedToStep3} />,
    );

    fireEvent.click(screen.getByText(/서술형으로 넘어가기/));
    expect(onProceedToStep3).toHaveBeenCalledWith(false);
  });

  it('does not show retry/proceed buttons before step2 is done', () => {
    render(<StepFillIn {...defaultProps} />);

    expect(screen.queryByText(/단답형 한번 더/)).toBeNull();
    expect(screen.queryByText(/서술형으로 넘어가기/)).toBeNull();
  });

  it('disables inputs when revealed', () => {
    render(<StepFillIn {...defaultProps} revealed={true} />);

    const inputs = screen.getAllByPlaceholderText('답을 입력해보세요...');
    for (const input of inputs) {
      expect(input.hasAttribute('disabled')).toBe(true);
    }
  });
});
