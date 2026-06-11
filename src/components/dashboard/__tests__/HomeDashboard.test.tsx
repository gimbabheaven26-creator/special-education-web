import { createElement } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HomeDashboard } from '../HomeDashboard';

vi.mock('@/components/OnboardingGate', () => ({
  OnboardingGate: () => createElement('div', { 'data-testid': 'onboarding-gate' }),
}));
vi.mock('@/components/dashboard/FocusBanner', () => ({
  FocusBanner: () => createElement('div', { 'data-testid': 'focus-banner' }),
}));
vi.mock('@/components/dashboard/MissionBlockList', () => ({
  MissionBlockList: () => createElement('div', { 'data-testid': 'mission-list' }),
}));
vi.mock('@/components/dashboard/DailyReviewCard', () => ({
  DailyReviewCard: () => createElement('div', { 'data-testid': 'daily-review-card' }),
}));

describe('HomeDashboard', () => {
  it('mounts DailyReviewCard so SRS reviews surface on home', () => {
    render(<HomeDashboard />);
    expect(screen.getByTestId('daily-review-card')).toBeDefined();
  });

  it('keeps existing dashboard blocks', () => {
    render(<HomeDashboard />);
    expect(screen.getByTestId('focus-banner')).toBeDefined();
    expect(screen.getByTestId('mission-list')).toBeDefined();
  });
});
