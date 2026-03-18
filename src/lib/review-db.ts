// src/lib/review-db.ts
// Reviews Supabase 쿼리 전용 모듈 (Server-only)

import { createClient } from '@/lib/supabase/server';
import type { ReviewRow } from '@/types/review';

export type { ReviewRow };

export async function getReviews(): Promise<ReviewRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('id, path, content, reviewer_name, admin_note, updated_at, image_urls')
    .order('updated_at', { ascending: false });
  if (error) return [];
  return (data ?? []) as ReviewRow[];
}

export async function saveReview(
  path: string,
  content: string,
  reviewerName: string = '',
  imageUrls: string[] = [],
): Promise<boolean> {
  const supabase = await createClient();
  if (!content.trim() && imageUrls.length === 0) {
    const query = supabase.from('reviews').delete().eq('path', path);
    const { error } = reviewerName
      ? await query.eq('reviewer_name', reviewerName)
      : await query;
    return !error;
  }
  const { error } = await supabase
    .from('reviews')
    .upsert(
      {
        path,
        content,
        reviewer_name: reviewerName,
        image_urls: imageUrls,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'path,reviewer_name' },
    );
  return !error;
}

export async function deleteReview(id: number): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id);
  return !error;
}

export async function updateAdminNote(id: number, adminNote: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('reviews')
    .update({ admin_note: adminNote, updated_at: new Date().toISOString() })
    .eq('id', id);
  return !error;
}
