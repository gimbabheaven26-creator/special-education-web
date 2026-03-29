import { createElement } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StepDescriptive } from '../StepDescriptive';
import type { DailyQuestion } from '@/types/daily';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) =>
    createElement('a', { href, ...props }, children),
}));

vi.mock('@/lib/concept-urls', () => ({
  getConceptUrl: (s: string) => '/concepts/' + s,
}));

function makeDescriptiveQuestion(id: string): DailyQuestion {
  return {
    id,
    type: 'descriptive',
    question: `서술형 문제 ${id}`,
    answer: `정답 키워드 ${id}`,
    chapter: '통합교육',
    subject: '통합교육',
  };
}

describe('StepDescriptive', () => {
  const questions = [makeDescriptiveQuestion('d-1'), makeDescriptiveQuestion('d-2')];

  const defaultProps = {
    descriptiveQuestions: questions,
    revealed: false,
    step3Done: false,
    onReveal: vi.fn(),
    onFinishStep3: vi.fn(),
  };

  it('renders instruction text', () => {
    render(<StepDescriptive {...defaultProps} />);
    expect(screen.getByText(/핵심 키워드를 포함하여 서술/)).toBeDefined();
  });

  it('renders all descriptive questions', () => {
    render(<StepDescriptive {...defaultProps} />);

    expect(screen.getByText('서술형 문제 d-1')).toBeDefined();
    expect(screen.getByText('서술형 문제 d-2')).toBeDefined();
  });

  it('renders questions as textarea (not input)', () => {
    render(<StepDescriptive {...defaultProps} />);

    const textareas = screen.getAllByPlaceholderText('답을 작성해보세요...');
    expect(textareas).toHaveLength(2);
    expect(textareas[0].tagName).toBe('TEXTAREA');
  });

  it('renders keyword reveal button when not revealed and not done', () => {
    render(<StepDescriptive {...defaultProps} />);
    expect(screen.getByText('정답 키워드 확인')).toBeDefined();
  });

  it('calls onReveal when keyword reveal button is clicked', () => {
    const onReveal = vi.fn();
    render(<StepDescriptive {...defaultProps} onReveal={onReveal} />);

    fireEvent.click(screen.getByText('정답 키워드 확인'));
    expect(onReveal).toHaveBeenCalledOnce();
  });

  it('hides keyword reveal button when revealed', () => {
    render(<StepDescriptive {...defaultProps} revealed={true} />);
    expect(screen.queryByText('정답 키워드 확인')).toBeNull();
  });

  it('shows finish button after reveal (but not done)', () => {
    render(<StepDescriptive {...defaultProps} revealed={true} step3Done={false} />);
    expect(screen.getByText(/오늘 학습 완료/)).toBeDefined();
  });

  it('calls onFinishStep3 when finish button is clicked', () => {
    const onFinishStep3 = vi.fn();
    render(
      <StepDescriptive {...defaultProps} revealed={true} step3Done={false} onFinishStep3={onFinishStep3} />,
    );

    fireEvent.click(screen.getByText(/오늘 학습 완료/));
    expect(onFinishStep3).toHaveBeenCalledOnce();
  });

  it('hides finish button when step3 is done', () => {
    render(<StepDescriptive {...defaultProps} revealed={true} step3Done={true} />);
    expect(screen.queryByText(/오늘 학습 완료/)).toBeNull();
  });

  it('hides keyword reveal button when step3 is done (even if not revealed)', () => {
    render(<StepDescriptive {...defaultProps} revealed={false} step3Done={true} />);
    // With step3Done=true and revealed=false: the condition !step3Done && !revealed is false
    expect(screen.queryByText('정답 키워드 확인')).toBeNull();
  });

  it('disables textareas when revealed', () => {
    render(<StepDescriptive {...defaultProps} revealed={true} />);

    const textareas = screen.getAllByPlaceholderText('답을 작성해보세요...');
    for (const textarea of textareas) {
      expect(textarea.hasAttribute('disabled')).toBe(true);
    }
  });

  it('shows correct answers when revealed', () => {
    render(<StepDescriptive {...defaultProps} revealed={true} />);

    // The TextQuestion component shows the answer when revealed
    const answerLabels = screen.getAllByText('정답');
    expect(answerLabels).toHaveLength(2);

    expect(screen.getByText('정답 키워드 d-1')).toBeDefined();
    expect(screen.getByText('정답 키워드 d-2')).toBeDefined();
  });

  it('does not show answers when not revealed', () => {
    render(<StepDescriptive {...defaultProps} />);
    expect(screen.queryByText('정답 키워드 d-1')).toBeNull();
  });
});
