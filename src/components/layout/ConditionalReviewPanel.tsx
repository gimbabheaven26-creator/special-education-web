'use client';

import dynamic from 'next/dynamic';

const ReviewPanel = dynamic(
  () => import('@/components/ReviewPanel').then((mod) => mod.ReviewPanel),
  { ssr: false }
);

export function ConditionalReviewPanel() {
  return <ReviewPanel />;
}
