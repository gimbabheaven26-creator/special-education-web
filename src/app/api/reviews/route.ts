import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const REVIEWS_PATH = join(process.cwd(), 'reviews.json');
const MAX_CONTENT_LENGTH = 10000;
const PATH_PATTERN = /^\/[a-z0-9\-\/]*$/;

interface Review {
  path: string;
  content: string;
  updatedAt: string;
}

async function readReviews(): Promise<Review[]> {
  try {
    const data = await readFile(REVIEWS_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

async function writeReviews(reviews: Review[]) {
  await writeFile(REVIEWS_PATH, JSON.stringify(reviews, null, 2), 'utf-8');
}

// GET: 전체 리뷰 목록
export async function GET() {
  const reviews = await readReviews();
  return NextResponse.json(reviews);
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

  const reviews = await readReviews();
  const existing = reviews.findIndex((r) => r.path === path);

  if (!contentStr.trim()) {
    if (existing !== -1) {
      reviews.splice(existing, 1);
      await writeReviews(reviews);
    }
    return NextResponse.json({ ok: true, action: 'deleted' });
  }

  const review: Review = {
    path,
    content: contentStr.trim(),
    updatedAt: new Date().toISOString(),
  };

  if (existing !== -1) {
    reviews[existing] = review;
  } else {
    reviews.push(review);
  }

  await writeReviews(reviews);
  return NextResponse.json({ ok: true, action: existing !== -1 ? 'updated' : 'created' });
}
