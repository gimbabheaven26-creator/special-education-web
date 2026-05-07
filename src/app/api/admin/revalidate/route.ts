import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { verifyAdminOrApiKey } from '@/lib/db/admin-auth';

const VALID_TAGS = ['subjects', 'quizzes', 'worksheets'] as const;
type CacheTag = (typeof VALID_TAGS)[number];

export async function POST(req: NextRequest) {
  const { authorized } = await verifyAdminOrApiKey(req);
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const tags: string[] = body?.tags;

  if (!Array.isArray(tags) || tags.length === 0) {
    return NextResponse.json(
      { error: 'tags required', validTags: VALID_TAGS },
      { status: 400 },
    );
  }

  const invalid = tags.filter((t) => !VALID_TAGS.includes(t as CacheTag));
  if (invalid.length > 0) {
    return NextResponse.json(
      { error: `Invalid tags: ${invalid.join(', ')}`, validTags: VALID_TAGS },
      { status: 400 },
    );
  }

  for (const tag of tags) {
    revalidateTag(tag);
  }

  return NextResponse.json({ revalidated: tags });
}
