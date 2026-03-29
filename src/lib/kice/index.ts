// KICE exam domain — exam data loading, analytics
// Re-exports: `import { ... } from '@/lib/kice'`

export { getAvailableExams, getDefaultExamEntry, getExam } from './kice';

export { computeAnalytics } from './kice-analytics';
export type { AnalyticsData } from './kice-analytics';
