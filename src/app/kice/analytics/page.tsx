import { computeAnalytics } from '@/lib/kice-analytics';
import { buildKeywordConceptMap } from '@/lib/keyword-concept-map';
import AnalyticsClient from './AnalyticsClient';

export default function KiceAnalyticsPage() {
  const data = computeAnalytics();
  const keywordConceptMap = buildKeywordConceptMap();
  return <AnalyticsClient data={data} keywordConceptMap={keywordConceptMap} />;
}
