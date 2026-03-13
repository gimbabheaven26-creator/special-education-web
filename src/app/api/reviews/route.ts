import { NextRequest, NextResponse } from 'next/server';
import { getReviews, saveReview } from '@/lib/db';

const MAX_CONTENT_LENGTH = 10000;
const PATH_PATTERN = /^\/[a-z0-9\-\/]*$/;

// GET: 전체 리뷰 목록
export async function GET() {
  try {
    const reviews = await getReviews();
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return NextResponse.json({ error: 'failed to fetch reviews' }, { status: 500 });
  }
}

// POST: 리뷰 저장/업데이트
export async function POST(req: NextRequest) {
  let body: { path?: unknown; content?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
  }

  const { path, content } = body;

  if (!path || typeof path !== 'string' || !PATH_PATTERN.test(path)) {
    return NextResponse.json({ error: 'invalid path' }, { status: 400 });
  }

  if (content !== undefined && typeof content !== 'string') {
    return NextResponse.json({ error: 'content must be string' }, { status: 400 });
  }

  const contentStr = typeof content === 'string' ? content : '';

  if (contentStr.length > MAX_CONTENT_LENGTH) {
    return NextResponse.json({ error: 'content too long' }, { status: 400 });
  }

  try {
    const success = await saveReview(path, contentStr);
    if (!success) {
      return NextResponse.json({ error: 'failed to save review' }, { status: 500 });
    }
    const action = contentStr.trim() ? 'saved' : 'deleted';
    return NextResponse.json({ ok: true, action });
  } catch (error) {
    console.error('Failed to save review:', error);
    return NextResponse.json({ error: 'failed to save review' }, { status: 500 });
  }
}
