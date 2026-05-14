import { createElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConceptActionPanel } from '../ConceptActionPanel';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) =>
    createElement('a', { href, ...props }, children),
}));

describe('ConceptActionPanel', () => {
  it('renders KICE and quiz actions when both are available', () => {
    render(
      <ConceptActionPanel
        title="특수교육법 총칙"
        subjectTitle="관련 법령"
        quizHref="/quiz/laws"
        kiceRefCount={18}
        firstKiceHref="/kice?year=2026#q-1"
      />,
    );

    expect(screen.getByText('특수교육법 총칙을 기출과 문제로 확인해보세요')).toBeDefined();
    expect(screen.getByText('관련 법령 · 연결된 기출 18건')).toBeDefined();
    expect(screen.getByRole('link', { name: /기출 18건 확인/ }).getAttribute('href')).toBe('/kice?year=2026#q-1');
    expect(screen.getByRole('link', { name: /관련 퀴즈 풀기/ }).getAttribute('href')).toBe('/quiz/laws');
  });

  it('renders nothing when there is no follow-up action', () => {
    const { container } = render(
      <ConceptActionPanel
        title="개념"
        subjectTitle="과목"
        quizHref={null}
        kiceRefCount={0}
        firstKiceHref={null}
      />,
    );

    expect(container.firstChild).toBeNull();
  });
});
