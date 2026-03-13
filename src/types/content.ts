export interface Subject {
  slug: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  chapters: Chapter[];
  order: number;
}

export interface Chapter {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  order: number;
}

export interface ContentMeta {
  title: string;
  description: string;
  keywords: string[];
  lastUpdated: string;
}

export interface SearchItem {
  title: string;
  description: string;
  keywords: string[];
  path: string;
  subject: string;
  type: 'subject' | 'chapter' | 'quiz';
}
