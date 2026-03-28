import { describe, it, expect } from 'vitest'
import {
  slugToSubject,
  subjectToSlug,
  getSubjectMeta,
  ALL_SUBJECT_SLUGS,
  type SubjectSlug,
} from '@/lib/utils/subject-map'

describe('subject-map', () => {
  describe('slugToSubject', () => {
    it('maps korean to 국어', () => {
      expect(slugToSubject('korean')).toBe('국어')
    })

    it('maps math to 수학', () => {
      expect(slugToSubject('math')).toBe('수학')
    })

    it('maps english to 생활영어', () => {
      expect(slugToSubject('english')).toBe('생활영어')
    })

    it('maps career to 진로와 직업', () => {
      expect(slugToSubject('career')).toBe('진로와 직업')
    })

    it('returns null for unknown slug', () => {
      expect(slugToSubject('science' as SubjectSlug)).toBeNull()
    })
  })

  describe('subjectToSlug', () => {
    it('maps 국어 to korean', () => {
      expect(subjectToSlug('국어')).toBe('korean')
    })

    it('maps 수학 to math', () => {
      expect(subjectToSlug('수학')).toBe('math')
    })

    it('maps 생활영어 to english', () => {
      expect(subjectToSlug('생활영어')).toBe('english')
    })

    it('maps 진로와 직업 to career', () => {
      expect(subjectToSlug('진로와 직업')).toBe('career')
    })

    it('returns null for unknown subject', () => {
      expect(subjectToSlug('과학')).toBeNull()
    })
  })

  describe('roundtrip', () => {
    it('slug -> subject -> slug is identity for all slugs', () => {
      for (const slug of ALL_SUBJECT_SLUGS) {
        const subject = slugToSubject(slug)
        expect(subject).not.toBeNull()
        expect(subjectToSlug(subject!)).toBe(slug)
      }
    })
  })

  describe('getSubjectMeta', () => {
    it('returns meta for each valid slug', () => {
      for (const slug of ALL_SUBJECT_SLUGS) {
        const meta = getSubjectMeta(slug)
        expect(meta).not.toBeNull()
        expect(meta!.slug).toBe(slug)
        expect(meta!.label).toBeTruthy()
        expect(meta!.dbName).toBeTruthy()
        expect(meta!.emoji).toBeTruthy()
        expect(meta!.description).toBeTruthy()
      }
    })

    it('returns null for unknown slug', () => {
      expect(getSubjectMeta('science' as SubjectSlug)).toBeNull()
    })

    it('korean meta has correct dbName', () => {
      const meta = getSubjectMeta('korean')
      expect(meta!.dbName).toBe('국어')
      expect(meta!.label).toBe('국어')
    })

    it('career meta has correct dbName with space', () => {
      const meta = getSubjectMeta('career')
      expect(meta!.dbName).toBe('진로와 직업')
    })
  })

  describe('ALL_SUBJECT_SLUGS', () => {
    it('has exactly 4 entries', () => {
      expect(ALL_SUBJECT_SLUGS).toHaveLength(4)
    })

    it('contains all expected slugs', () => {
      expect(ALL_SUBJECT_SLUGS).toContain('korean')
      expect(ALL_SUBJECT_SLUGS).toContain('math')
      expect(ALL_SUBJECT_SLUGS).toContain('english')
      expect(ALL_SUBJECT_SLUGS).toContain('career')
    })
  })
})
