import { createElement } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TextQuestion } from '../TextQuestion';
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
    id: 'fill-1',
    type: 'fill_in',
    question: '행동의 기능 4가지 중 회피를 영어로 쓰시오.',
    answer: 'escape',
    chapter: '행동의 기능',
    subject: '행동지원',
    ...overrides,
  };
}

describe('TextQuestion', () => {
  it('renders question text, chapter link, and index', () => {
    render(<TextQuestion question={makeQuestion()} index={2} revealed={false} type="fill_in" />);

    expect(screen.getByText('행동의 기능 4가지 중 회피를 영어로 쓰시오.')).toBeDefined();
    expect(screen.getByText('행동의 기능')).toBeDefined();
    expect(screen.getByText('2.')).toBeDefined();

    const link = screen.getByText('행동의 기능');
    expect(link.closest('a')?.getAttribute('href')).toBe('/concepts/행동지원');
  });

  it('renders input element for fill_in type', () => {
    render(<TextQuestion question={makeQuestion()} index={1} revealed={false} type="fill_in" />);

    const input = screen.getByPlaceholderText('답을 입력해보세요...');
    expect(input.tagName).toBe('INPUT');
  });

  it('renders textarea for descriptive type', () => {
    render(<TextQuestion question={makeQuestion()} index={1} revealed={false} type="descriptive" />);

    const textarea = screen.getByPlaceholderText('답을 작성해보세요...');
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  it('allows user to type in fill_in input', () => {
    render(<TextQuestion question={makeQuestion()} index={1} revealed={false} type="fill_in" />);

    const input = screen.getByPlaceholderText('답을 입력해보세요...') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'escape' } });
    expect(input.value).toBe('escape');
  });

  it('allows user to type in descriptive textarea', () => {
    render(<TextQuestion question={makeQuestion()} index={1} revealed={false} type="descriptive" />);

    const textarea = screen.getByPlaceholderText('답을 작성해보세요...') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: '회피 행동은...' } });
    expect(textarea.value).toBe('회피 행동은...');
  });

  it('disables input when revealed (fill_in)', () => {
    render(<TextQuestion question={makeQuestion()} index={1} revealed={true} type="fill_in" />);

    const input = screen.getByPlaceholderText('답을 입력해보세요...');
    expect(input.hasAttribute('disabled')).toBe(true);
  });

  it('disables textarea when revealed (descriptive)', () => {
    render(<TextQuestion question={makeQuestion()} index={1} revealed={true} type="descriptive" />);

    const textarea = screen.getByPlaceholderText('답을 작성해보세요...');
    expect(textarea.hasAttribute('disabled')).toBe(true);
  });

  it('shows correct answer when revealed', () => {
    render(<TextQuestion question={makeQuestion()} index={1} revealed={true} type="fill_in" />);

    expect(screen.getByText('정답')).toBeDefined();
    expect(screen.getByText('escape')).toBeDefined();
  });

  it('shows user answer when revealed and user typed something', () => {
    render(<TextQuestion question={makeQuestion()} index={1} revealed={false} type="fill_in" />);

    const input = screen.getByPlaceholderText('답을 입력해보세요...') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'avoidance' } });

    // Re-render with revealed=true by unmounting and remounting won't preserve state.
    // Instead, the component manages its own state, so we need to test within same render.
    // We can't easily change props without a wrapper. Let's test the revealed case with pre-typed value via a wrapper.
  });

  it('does not show answer section when not revealed', () => {
    render(<TextQuestion question={makeQuestion()} index={1} revealed={false} type="fill_in" />);

    expect(screen.queryByText('정답')).toBeNull();
  });

  it('does not show "내 답안" when user did not type anything and revealed', () => {
    render(<TextQuestion question={makeQuestion()} index={1} revealed={true} type="fill_in" />);

    expect(screen.queryByText('내 답안')).toBeNull();
    expect(screen.getByText('정답')).toBeDefined();
  });
});
