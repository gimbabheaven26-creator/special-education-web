import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const REVIEWS_PATH = join(process.cwd(), 'reviews.json');

interface Review {
  path: string;
  content: string;
  updatedAt: string;
}

async function readReviews(): Promise<Review[]> {
  try {
    const data = await readFile(REVIEWS_PATH, 'utf-8');
    return JSON.parse(data);
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
  const { path, content } = await req.json();
  if (!path || typeof path !== 'string') {
    return NextResponse.json({ error: 'path is required' }, { status: 400 });
  }

  const reviews = await readReviews();
  const existing = reviews.findIndex((r) => r.path === path);

  if (!content || !content.trim()) {
    // 빈 내용이면 삭제
    if (existing !== -1) {
      reviews.splice(existing, 1);
      await writeReviews(reviews);
    }
    return NextResponse.json({ ok: true, action: 'deleted' });
  }

  const review: Review = {
    path,
    content: content.trim(),
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
