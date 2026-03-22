import { computeAnalytics } from '@/lib/kice-analytics';
import AnalyticsClient from './AnalyticsClient';

export default function KiceAnalyticsPage() {
  const data = computeAnalytics();
  return <AnalyticsClient data={data} />;
}
