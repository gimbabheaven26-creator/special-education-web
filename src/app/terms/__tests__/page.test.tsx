import { createElement } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import TermsPage from '../page';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) =>
    createElement('a', { href, ...props }, children),
}));

describe('TermsPage', () => {
  it('renders the FBA term lens with source and exam DNA signals', () => {
    render(<TermsPage searchParams={{ q: '기능적 행동평가' }} />);

    expect(screen.getByRole('heading', { name: '기능적 행동평가' })).toBeDefined();
    expect(screen.getByText('source-linked')).toBeDefined();
    expect(screen.getByText('NISE · 383398')).toBeDefined();
    expect(screen.getAllByText(/2019 전공A 14번/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/20분 이음/).length).toBeGreaterThan(0);
    expect(screen.getByText('FBA 20분 실전 이음')).toBeDefined();
    expect(screen.getByLabelText('기출 답안')).toBeDefined();
  });
});
