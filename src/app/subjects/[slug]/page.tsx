import { redirect } from 'next/navigation';
import { SLUG_TO_CONCEPTS_FOLDER } from '@/lib/concepts';

export default function SubjectDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const folder = SLUG_TO_CONCEPTS_FOLDER[slug];

  if (folder) {
    redirect(`/concepts/${encodeURIComponent(folder)}`);
  }

  redirect('/concepts');
}
