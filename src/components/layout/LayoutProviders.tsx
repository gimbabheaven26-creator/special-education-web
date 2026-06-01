'use client';

import { usePathname } from 'next/navigation';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Header } from '@/components/layout/Header';
import { BottomTabBar } from '@/components/layout/BottomTabBar';
import { ConditionalReviewPanel } from '@/components/layout/ConditionalReviewPanel';
import { StudySessionTracker } from '@/components/StudySessionTracker';
import { SyncManager } from '@/components/SyncManager';
import { BetaFeedbackWidget } from '@/components/BetaFeedbackWidget';

export function LayoutProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isIeumjinRoute = pathname === '/';

  if (isIeumjinRoute) {
    return <ThemeProvider>{children}</ThemeProvider>;
  }

  return (
    <ThemeProvider>
      <Header />
      {children}
      <BottomTabBar />
      <ConditionalReviewPanel />
      <StudySessionTracker />
      <SyncManager />
      <BetaFeedbackWidget />
    </ThemeProvider>
  );
}
