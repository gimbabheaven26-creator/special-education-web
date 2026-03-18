// Review 관련 타입 정의

export interface ReviewRow {
  id: number;
  path: string;
  content: string;
  reviewer_name: string;
  admin_note: string;
  updated_at: string;
  image_urls?: string[];
}
