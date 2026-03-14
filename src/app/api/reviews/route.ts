import { NextRequest, NextResponse } from 'next/server';
import { getReviews, saveReview, updateReviewStatus } from '@/lib/db';

const MAX_CONTENT_LENGTH = 10000;
const MAX_NAME_LENGTH = 50;
const PATH_PATTERN = /^\/[a-z0-9\-\/]*$/;
const VALID_STATUSES = ['pending', 'discussing', 'accepted', 'rejected'] as const;

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
  let body: { path?: unknown; content?: unknown; reviewer_name?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
  }

  const { path, content, reviewer_name } = body;

  if (!path || typeof path !== 'string' || !PATH_PATTERN.test(path)) {
    return NextResponse.json({ error: 'invalid path' }, { status: 400 });
  }

  if (content !== undefined && typeof content !== 'string') {
    return NextResponse.json({ error: 'content must be string' }, { status: 400 });
  }

  if (reviewer_name !== undefined && typeof reviewer_name !== 'string') {
    return NextResponse.json({ error: 'reviewer_name must be string' }, { status: 400 });
  }

  const contentStr = typeof content === 'string' ? content : '';
  const nameStr = typeof reviewer_name === 'string' ? reviewer_name.trim().slice(0, MAX_NAME_LENGTH) : '';

  if (contentStr.length > MAX_CONTENT_LENGTH) {
    return NextResponse.json({ error: 'content too long' }, { status: 400 });
  }

  try {
    const success = await saveReview(path, contentStr, nameStr);
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

// PATCH: 리뷰 상태 변경 (대시보드용)
export async function PATCH(req: NextRequest) {
  let body: { id?: unknown; status?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
  }

  const { id, status } = body;

  if (!id || typeof id !== 'number') {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  if (!status || typeof status !== 'string' || !VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) {
    return NextResponse.json({ error: 'invalid status' }, { status: 400 });
  }

  try {
    const success = await updateReviewStatus(id, status as typeof VALID_STATUSES[number]);
    if (!success) {
      return NextResponse.json({ error: 'failed to update status' }, { status: 500 });
    }
    return NextResponse.json({ ok: true, status });
  } catch (error) {
    console.error('Failed to update review status:', error);
    return NextResponse.json({ error: 'failed to update status' }, { status: 500 });
  }
}
