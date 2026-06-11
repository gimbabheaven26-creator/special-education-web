import { createElement } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextStepNudge } from '../NextStepNudge';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) =>
    createElement('a', { href, ...props }, children),
}));

describe('NextStepNudge', () => {
  it('renders nothing when steps is empty', () => {
    const { container } = render(<NextStepNudge steps={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders each step as a link with href and label', () => {
    render(
      <NextStepNudge
        steps={[
          { href: '/wrong-notes', label: '오답노트에서 3문제 정리하기', emoji: '📋' },
          { href: '/concepts/행동수정', label: '개념부터 다시 정리하기', emoji: '📖' },
        ]}
      />,
    );
    const wrongLink = screen.getByText('오답노트에서 3문제 정리하기').closest('a');
    expect(wrongLink?.getAttribute('href')).toBe('/wrong-notes');
    const conceptLink = screen.getByText('개념부터 다시 정리하기').closest('a');
    expect(conceptLink?.getAttribute('href')).toBe('/concepts/행동수정');
  });

  it('renders section title', () => {
    render(<NextStepNudge steps={[{ href: '/concepts', label: '개념 보기', emoji: '📖' }]} />);
    expect(screen.getByText('다음 단계')).toBeDefined();
  });
});
