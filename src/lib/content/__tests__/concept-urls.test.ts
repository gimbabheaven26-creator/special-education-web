import { describe, it, expect } from 'vitest';
import {
  SLUG_TO_CONCEPTS_FOLDER,
  CONCEPTS_FOLDER_TO_SLUG,
  getConceptUrl,
} from '@/lib/content/concept-urls';

describe('concept-urls', () => {
  // ─── SLUG_TO_CONCEPTS_FOLDER ──────────────────────────────────
  describe('SLUG_TO_CONCEPTS_FOLDER', () => {
    it('17개 과목 매핑이 존재한다', () => {
      expect(Object.keys(SLUG_TO_CONCEPTS_FOLDER).length).toBe(17);
    });

    it('behavior-support → 행동수정', () => {
      expect(SLUG_TO_CONCEPTS_FOLDER['behavior-support']).toBe('행동수정');
    });

    it('aac → AAC', () => {
      expect(SLUG_TO_CONCEPTS_FOLDER['aac']).toBe('AAC');
    });

    it('존재하지 않는 slug → undefined', () => {
      expect(SLUG_TO_CONCEPTS_FOLDER['nonexistent']).toBeUndefined();
    });

    it('모든 값이 비어있지 않은 문자열이다', () => {
      for (const [slug, folder] of Object.entries(SLUG_TO_CONCEPTS_FOLDER)) {
        expect(folder, `slug "${slug}" 의 폴더명이 비어 있음`).toBeTruthy();
        expect(typeof folder).toBe('string');
      }
    });
  });

  // ─── CONCEPTS_FOLDER_TO_SLUG (역방향) ─────────────────────────
  describe('CONCEPTS_FOLDER_TO_SLUG', () => {
    it('SLUG_TO_CONCEPTS_FOLDER와 동일한 개수', () => {
      expect(Object.keys(CONCEPTS_FOLDER_TO_SLUG).length).toBe(
        Object.keys(SLUG_TO_CONCEPTS_FOLDER).length,
      );
    });

    it('행동수정 → behavior-support', () => {
      expect(CONCEPTS_FOLDER_TO_SLUG['행동수정']).toBe('behavior-support');
    });

    it('AAC → aac', () => {
      expect(CONCEPTS_FOLDER_TO_SLUG['AAC']).toBe('aac');
    });

    it('양방향 매핑 일관성 — slug→folder→slug 왕복', () => {
      for (const [slug, folder] of Object.entries(SLUG_TO_CONCEPTS_FOLDER)) {
        expect(CONCEPTS_FOLDER_TO_SLUG[folder]).toBe(slug);
      }
    });
  });

  // ─── getConceptUrl ────────────────────────────────────────────
  describe('getConceptUrl', () => {
    it('유효한 slug → /concepts/한글폴더 URL', () => {
      const url = getConceptUrl('behavior-support');
      expect(url).toBe('/concepts/행동수정');
    });

    it('slug + conceptSlug → 하위 URL', () => {
      const url = getConceptUrl('curriculum', '기본교육과정');
      expect(url).toBe('/concepts/교육과정/기본교육과정');
    });

    it('존재하지 않는 slug → /concepts 폴백', () => {
      expect(getConceptUrl('unknown-slug')).toBe('/concepts');
    });

    it('빈 문자열 slug → /concepts 폴백', () => {
      expect(getConceptUrl('')).toBe('/concepts');
    });

    it('conceptSlug만 있고 slug가 유효하지 않으면 /concepts', () => {
      expect(getConceptUrl('invalid', 'some-concept')).toBe('/concepts');
    });

    it('한글 conceptSlug가 올바르게 인코딩된다', () => {
      const url = getConceptUrl('aac', '보완대체의사소통');
      expect(url).toContain('보완대체의사소통');
    });
  });
});
