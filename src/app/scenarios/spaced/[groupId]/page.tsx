import { notFound } from 'next/navigation';
import { getGroupById } from '@/data/scenarios/groups';
import SpacedGroupClient from './SpacedGroupClient';

interface PageProps {
  readonly params: Promise<{ groupId: string }>;
}

export default async function SpacedGroupPage({ params }: PageProps) {
  const { groupId } = await params;
  const group = getGroupById(groupId);

  if (!group) {
    notFound();
  }

  return <SpacedGroupClient group={group} />;
}
