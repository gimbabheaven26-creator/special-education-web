'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

const ReviewPanel = dynamic(
  () => import('@/components/ReviewPanel').then((mod) => mod.ReviewPanel),
  { ssr: false }
);

const REVIEW_ROUTES = ['/quiz', '/subjects', '/worksheets'];

export function ConditionalReviewPanel() {
  const pathname = usePathname();
  const shouldShow = REVIEW_ROUTES.some((route) => pathname.startsWith(route));

  if (!shouldShow) return null;

  return <ReviewPanel />;
}
