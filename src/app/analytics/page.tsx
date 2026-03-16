import { computeAnalytics } from '@/lib/kice-analytics';
import AnalyticsClient from '../kice/analytics/AnalyticsClient';

export default function AnalyticsPage() {
  const data = computeAnalytics();
  return <AnalyticsClient data={data} />;
}
