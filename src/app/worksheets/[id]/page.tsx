import { notFound } from 'next/navigation';
import { getWorksheetTopicById, getWorksheetsByTopic } from '@/lib/db';
import WorksheetViewClient from './WorksheetViewClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://special-education-web.vercel.app';

export default async function WorksheetViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const topic = await getWorksheetTopicById(id);
  if (!topic) notFound();

  const questions = await getWorksheetsByTopic(topic.subject, id);
  const qrUrl = `${SITE_URL}/worksheets/${id}`;

  return (
    <WorksheetViewClient
      topicName={topic.name}
      questions={questions}
      qrUrl={qrUrl}
    />
  );
}
