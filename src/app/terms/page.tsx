import TermsClient from './TermsClient';
import { loadTerms, TERM_SUBJECTS } from '@/lib/content/term-utils';
import type { TermEntry } from '@/lib/content/term-utils';

export const dynamic = 'force-static';

export type Term = TermEntry;

export default function TermsPage() {
  const terms = loadTerms();
  const subjects = TERM_SUBJECTS.map((s) => s.label);
  return <TermsClient terms={terms} subjects={subjects} />;
}
