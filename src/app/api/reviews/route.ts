import { NextRequest, NextResponse } from 'next/server';
import { getReviews, saveReview, deleteReview, updateAdminNote } from '@/lib/review-db';

const MAX_CONTENT_LENGTH = 10000;
const MAX_NAME_LENGTH = 50;
const MAX_IMAGES = 5;
const MAX_ADMIN_NOTE_LENGTH = 2000;
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
  let body: { path?: unknown; content?: unknown; reviewer_name?: unknown; image_urls?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
  }

  const { path, content, reviewer_name, image_urls } = body;

  if (!path || typeof path !== 'string' || !PATH_PATTERN.test(path)) {
    return NextResponse.json({ error: 'invalid path' }, { status: 400 });
  }
  if (content !== undefined && typeof content !== 'string') {
    return NextResponse.json({ error: 'content must be string' }, { status: 400 });
  }
  if (reviewer_name !== undefined && typeof reviewer_name !== 'string') {
    return NextResponse.json({ error: 'reviewer_name must be string' }, { status: 400 });
  }
  if (image_urls !== undefined && !Array.isArray(image_urls)) {
    return NextResponse.json({ error: 'image_urls must be array' }, { status: 400 });
  }

  const contentStr = typeof content === 'string' ? content : '';
  const nameStr = typeof reviewer_name === 'string' ? reviewer_name.trim().slice(0, MAX_NAME_LENGTH) : '';
  const imageUrlsArr = Array.isArray(image_urls)
    ? image_urls.filter((u): u is string => typeof u === 'string').slice(0, MAX_IMAGES)
    : [];

  if (contentStr.length > MAX_CONTENT_LENGTH) {
    return NextResponse.json({ error: 'content too long' }, { status: 400 });
  }

  try {
    const success = await saveReview(path, contentStr, nameStr, imageUrlsArr);
    if (!success) {
      return NextResponse.json({ error: 'failed to save review' }, { status: 500 });
    }
    const action = contentStr.trim() || imageUrlsArr.length > 0 ? 'saved' : 'deleted';
    return NextResponse.json({ ok: true, action });
  } catch (error) {
    console.error('Failed to save review:', error);
    return NextResponse.json({ error: 'failed to save review' }, { status: 500 });
  }
}

// PATCH: admin_note 업데이트 (관리자 전용)
export async function PATCH(req: NextRequest) {
  let body: { id?: unknown; admin_note?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
  }

  const { id, admin_note } = body;

  if (!id || typeof id !== 'number') {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }
  if (typeof admin_note !== 'string') {
    return NextResponse.json({ error: 'admin_note must be string' }, { status: 400 });
  }
  if (admin_note.length > MAX_ADMIN_NOTE_LENGTH) {
    return NextResponse.json({ error: 'admin_note too long' }, { status: 400 });
  }

  try {
    const success = await updateAdminNote(id, admin_note);
    if (!success) {
      return NextResponse.json({ error: 'failed to update admin note' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to update admin note:', error);
    return NextResponse.json({ error: 'failed to update admin note' }, { status: 500 });
  }
}

// DELETE: 리뷰 삭제 (관리자 전용)
export async function DELETE(req: NextRequest) {
  let body: { id?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
  }

  const { id } = body;

  if (!id || typeof id !== 'number') {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  try {
    const success = await deleteReview(id);
    if (!success) {
      return NextResponse.json({ error: 'failed to delete review' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to delete review:', error);
    return NextResponse.json({ error: 'failed to delete review' }, { status: 500 });
  }
}
