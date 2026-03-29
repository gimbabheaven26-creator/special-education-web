import { createElement } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OXQuestion } from '../OXQuestion';
import type { DailyQuestion } from '@/types/daily';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) =>
    createElement('a', { href, ...props }, children),
}));

vi.mock('@/lib/concept-urls', () => ({
  getConceptUrl: (s: string) => '/concepts/' + s,
}));

function makeQuestion(overrides?: Partial<DailyQuestion>): DailyQuestion {
  return {
    id: 'ox-1',
    type: 'ox',
    question: '긍정적 행동지원은 응용행동분석에 기반한다.',
    answer: 'O',
    chapter: '긍정적 행동지원',
    subject: '행동지원',
    explanation: 'PBS는 ABA에 근거한다.',
    ...overrides,
  };
}

describe('OXQuestion', () => {
  const defaultProps = {
    question: makeQuestion(),
    index: 1,
    userAnswer: null as 'O' | 'X' | null,
    onAnswer: vi.fn(),
    revealed: false,
    correctAnswer: 'O',
  };

  it('renders question text and chapter link', () => {
    render(<OXQuestion {...defaultProps} />);

    expect(screen.getByText('긍정적 행동지원은 응용행동분석에 기반한다.')).toBeDefined();
    expect(screen.getByText('긍정적 행동지원')).toBeDefined();

    const link = screen.getByText('긍정적 행동지원');
    expect(link.closest('a')?.getAttribute('href')).toBe('/concepts/행동지원');
  });

  it('renders index number', () => {
    render(<OXQuestion {...defaultProps} index={3} />);
    expect(screen.getByText('3.')).toBeDefined();
  });

  it('renders O and X buttons', () => {
    render(<OXQuestion {...defaultProps} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    expect(buttons[0].textContent).toBe('O');
    expect(buttons[1].textContent).toBe('X');
  });

  it('calls onAnswer when O button is clicked', () => {
    const onAnswer = vi.fn();
    render(<OXQuestion {...defaultProps} onAnswer={onAnswer} />);

    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(onAnswer).toHaveBeenCalledWith('ox-1', 'O');
  });

  it('calls onAnswer when X button is clicked', () => {
    const onAnswer = vi.fn();
    render(<OXQuestion {...defaultProps} onAnswer={onAnswer} />);

    fireEvent.click(screen.getAllByRole('button')[1]);
    expect(onAnswer).toHaveBeenCalledWith('ox-1', 'X');
  });

  it('disables buttons when revealed', () => {
    render(<OXQuestion {...defaultProps} revealed={true} userAnswer="O" />);

    const buttons = screen.getAllByRole('button');
    expect(buttons[0].hasAttribute('disabled')).toBe(true);
    expect(buttons[1].hasAttribute('disabled')).toBe(true);
  });

  it('shows correct answer text when revealed', () => {
    render(<OXQuestion {...defaultProps} revealed={true} userAnswer="O" />);

    expect(screen.getByText('O', { selector: 'span' })).toBeDefined();
    expect(screen.getByText(/PBS는 ABA에 근거한다/)).toBeDefined();
  });

  it('does not show answer section when not revealed', () => {
    render(<OXQuestion {...defaultProps} />);
    expect(screen.queryByText(/정답:/)).toBeNull();
  });

  it('applies correct styling for correct answer when revealed', () => {
    const { container } = render(
      <OXQuestion {...defaultProps} revealed={true} userAnswer="O" correctAnswer="O" />,
    );

    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).toContain('border-green');
  });

  it('applies incorrect styling for wrong answer when revealed', () => {
    const { container } = render(
      <OXQuestion {...defaultProps} revealed={true} userAnswer="X" correctAnswer="O" />,
    );

    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).toContain('border-red');
  });

  it('does not show explanation when question has no explanation', () => {
    const q = makeQuestion({ explanation: undefined });
    render(<OXQuestion {...defaultProps} question={q} revealed={true} userAnswer="O" />);

    const answerText = screen.getByText(/정답:/).textContent ?? '';
    expect(answerText).not.toContain('—');
  });
});
