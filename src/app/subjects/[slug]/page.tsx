import { redirect } from 'next/navigation';
import { SLUG_TO_CONCEPTS_FOLDER } from '@/lib/content/concepts';

export default function SubjectDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const folder = SLUG_TO_CONCEPTS_FOLDER[slug];

  if (folder) {
    redirect(`/concepts/${folder}`);
  }

  redirect('/concepts');
}
