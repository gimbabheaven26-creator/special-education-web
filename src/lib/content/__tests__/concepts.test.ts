import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock fs and gray-matter ────────────────────────────────────────────────

vi.mock('fs', () => {
  return {
    default: {
      existsSync: vi.fn(),
      readdirSync: vi.fn(),
      readFileSync: vi.fn(),
    },
    existsSync: vi.fn(),
    readdirSync: vi.fn(),
    readFileSync: vi.fn(),
  };
});

vi.mock('gray-matter', () => ({
  default: vi.fn(),
}));

import fs from 'fs';
import matter from 'gray-matter';
import {
  getAllSubjects,
  getSubjectFiles,
  getConceptsForSubject,
  getConceptContentsForSubject,
  getMDXContent,
  getDbSlugForFolder,
} from '../concepts';

const mockedFs = vi.mocked(fs);
const mockedMatter = vi.mocked(matter);

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeFrontmatter(overrides: Record<string, unknown> = {}) {
  return {
    title: '테스트 개념',
    description: '설명',
    subject: '행동수정',
    slug: 'test-concept',
    order: 1,
    kiceKeywords: ['키워드1', '키워드2'],
    lastUpdated: '2026-03-28',
    ...overrides,
  };
}

describe('concepts', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ─── getAllSubjects ───

  describe('getAllSubjects', () => {
    it('returns sorted subject folder names', () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readdirSync.mockReturnValue([
        { name: '통합교육', isDirectory: () => true },
        { name: '교육과정', isDirectory: () => true },
        { name: '행동수정', isDirectory: () => true },
      ] as unknown as ReturnType<typeof fs.readdirSync>);

      const result = getAllSubjects();
      expect(result).toEqual(['교육과정', '통합교육', '행동수정']);
    });

    it('returns empty array when concepts dir does not exist', () => {
      mockedFs.existsSync.mockReturnValue(false);
      expect(getAllSubjects()).toEqual([]);
    });

    it('filters out non-directory entries', () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readdirSync.mockReturnValue([
        { name: '행동수정', isDirectory: () => true },
        { name: 'README.md', isDirectory: () => false },
      ] as unknown as ReturnType<typeof fs.readdirSync>);

      const result = getAllSubjects();
      expect(result).toEqual(['행동수정']);
    });
  });

  // ─── getSubjectFiles ───

  describe('getSubjectFiles', () => {
    it('returns MDX files with frontmatter parsed and sorted by order', () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readdirSync.mockReturnValue([
        '02-second.mdx',
        '01-first.mdx',
      ] as unknown as ReturnType<typeof fs.readdirSync>);
      mockedFs.readFileSync.mockReturnValue('---\ntitle: test\n---\ncontent');

      mockedMatter
        .mockReturnValueOnce({ data: makeFrontmatter({ order: 2, slug: 'second', title: '두번째' }), content: '' } as never)
        .mockReturnValueOnce({ data: makeFrontmatter({ order: 1, slug: 'first', title: '첫번째' }), content: '' } as never);

      const files = getSubjectFiles('행동수정');
      expect(files).toHaveLength(2);
      expect(files[0].order).toBe(1);
      expect(files[0].slug).toBe('first');
      expect(files[1].order).toBe(2);
    });

    it('returns empty array when subject dir does not exist', () => {
      mockedFs.existsSync.mockReturnValue(false);
      expect(getSubjectFiles('nonexistent')).toEqual([]);
    });

    it('filters non-mdx files', () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readdirSync.mockReturnValue([
        '01-concept.mdx',
        'README.md',
        'notes.txt',
      ] as unknown as ReturnType<typeof fs.readdirSync>);
      mockedFs.readFileSync.mockReturnValue('---\ntitle: test\n---\n');
      mockedMatter.mockReturnValue({
        data: makeFrontmatter(),
        content: '',
      } as never);

      const files = getSubjectFiles('행동수정');
      expect(files).toHaveLength(1);
    });

    it('uses filename as slug fallback when frontmatter has no slug', () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readdirSync.mockReturnValue([
        '01-my-concept.mdx',
      ] as unknown as ReturnType<typeof fs.readdirSync>);
      mockedFs.readFileSync.mockReturnValue('---\ntitle: test\n---\n');
      mockedMatter.mockReturnValue({
        data: { title: 'test', order: 1 },
        content: '',
      } as never);

      const files = getSubjectFiles('행동수정');
      expect(files[0].slug).toBe('my-concept');
    });

    it('handles YAML colon keywords via toKeywordString', () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readdirSync.mockReturnValue([
        '01-test.mdx',
      ] as unknown as ReturnType<typeof fs.readdirSync>);
      mockedFs.readFileSync.mockReturnValue('---\n---\n');
      // Simulate YAML parsing a colon keyword as an object
      mockedMatter.mockReturnValue({
        data: {
          title: 'Test',
          slug: 'test',
          order: 1,
          kiceKeywords: [
            '일반 키워드',
            { '고급 테크놀로지 (음성 출력 기기': '원버튼)' },
          ],
        },
        content: '',
      } as never);

      const files = getSubjectFiles('행동수정');
      expect(files[0].kiceKeywords[0]).toBe('일반 키워드');
      expect(files[0].kiceKeywords[1]).toBe('고급 테크놀로지 (음성 출력 기기: 원버튼)');
    });

    it('handles Date object in lastUpdated', () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readdirSync.mockReturnValue([
        '01-test.mdx',
      ] as unknown as ReturnType<typeof fs.readdirSync>);
      mockedFs.readFileSync.mockReturnValue('---\n---\n');
      mockedMatter.mockReturnValue({
        data: {
          title: 'Test',
          slug: 'test',
          order: 1,
          kiceKeywords: [],
          lastUpdated: new Date('2026-03-28T00:00:00Z'),
        },
        content: '',
      } as never);

      const files = getSubjectFiles('행동수정');
      expect(files[0].lastUpdated).toBe('2026-03-28');
    });
  });

  // ─── getConceptsForSubject ───

  describe('getConceptsForSubject', () => {
    it('returns files for a known subject slug', () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readdirSync.mockReturnValue([
        '01-concept.mdx',
      ] as unknown as ReturnType<typeof fs.readdirSync>);
      mockedFs.readFileSync.mockReturnValue('');
      mockedMatter.mockReturnValue({
        data: makeFrontmatter(),
        content: '',
      } as never);

      const result = getConceptsForSubject('behavior-support');
      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('returns empty array for unknown slug', () => {
      expect(getConceptsForSubject('unknown-slug')).toEqual([]);
    });
  });

  // ─── getConceptContentsForSubject ───

  describe('getConceptContentsForSubject', () => {
    it('returns empty array for unknown slug', () => {
      expect(getConceptContentsForSubject('unknown-slug')).toEqual([]);
    });

    it('returns empty array when directory does not exist', () => {
      mockedFs.existsSync.mockReturnValue(false);
      expect(getConceptContentsForSubject('behavior-support')).toEqual([]);
    });
  });

  // ─── getMDXContent ───

  describe('getMDXContent', () => {
    it('returns null when subject dir does not exist', () => {
      mockedFs.existsSync.mockReturnValue(false);
      expect(getMDXContent('nonexistent', 'some-slug')).toBeNull();
    });

    it('returns null when slug is not found', () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readdirSync.mockReturnValue([
        '01-other.mdx',
      ] as unknown as ReturnType<typeof fs.readdirSync>);
      mockedFs.readFileSync.mockReturnValue('---\ntitle: Other\n---\ncontent');
      mockedMatter.mockReturnValue({
        data: { slug: 'other', title: 'Other', order: 1 },
        content: 'content',
      } as never);

      expect(getMDXContent('행동수정', 'nonexistent-slug')).toBeNull();
    });

    it('returns content with prev/next navigation', () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readdirSync.mockReturnValue([
        '01-first.mdx',
        '02-second.mdx',
        '03-third.mdx',
      ] as unknown as ReturnType<typeof fs.readdirSync>);

      const frontmatters = [
        { slug: 'first', title: '첫번째', order: 1, kiceKeywords: [] },
        { slug: 'second', title: '두번째', order: 2, kiceKeywords: [] },
        { slug: 'third', title: '세번째', order: 3, kiceKeywords: [] },
      ];

      let callCount = 0;
      mockedFs.readFileSync.mockReturnValue('---\n---\nMDX content');
      mockedMatter.mockImplementation(() => {
        const idx = callCount % frontmatters.length;
        callCount++;
        return {
          data: frontmatters[idx],
          content: 'MDX content',
        } as never;
      });

      const result = getMDXContent('행동수정', 'second');
      expect(result).not.toBeNull();
      expect(result!.slug).toBe('second');
      expect(result!.content).toBe('MDX content');
      expect(result!.prev).not.toBeNull();
      expect(result!.next).not.toBeNull();
    });
  });

  // ─── getDbSlugForFolder ───

  describe('getDbSlugForFolder', () => {
    it('returns DB slug for known folder', () => {
      expect(getDbSlugForFolder('행동수정')).toBe('behavior-support');
    });

    it('returns null for unknown folder', () => {
      expect(getDbSlugForFolder('존재하지않음')).toBeNull();
    });
  });
});
