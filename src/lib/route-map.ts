export const ROUTE_MAP = {
  // Phase 2: Cockpit
  '/today': '/',
  '/daily': '/',
  '/next': '/',
  '/diagnosis': '/learn',

  // Phase 3: Learn
  '/quiz/ox': '/learn/session?mode=diagnostic&type=ox',
  '/quiz/short': '/learn/session?mode=diagnostic&type=fill_in',
  '/practice': '/learn/session?mode=mock',
  '/practice-hub': '/learn',
  '/next/practice': '/learn/session',
  '/next/qbank': '/learn/session?mode=qbank',
  '/interactive': '/learn?tab=interactive',
  '/scenarios': '/learn?tab=scenarios',
  '/worksheets': '/learn?tab=worksheets',
  '/kice/exam': '/learn/session?mode=mock',

  // Phase 4: Concepts
  '/concepts': '/learn/concepts',
  '/terms': '/learn/concepts?tab=terms',
  '/flashcards': '/learn/concepts?tab=flashcards',
  '/subjects': '/learn/concepts',

  // Phase 5: Record
  '/mastery': '/record?tab=mastery',
  '/wrong-notes': '/record?tab=wrong-notes',
  '/bookmarks': '/record?tab=bookmarks',
  '/kice': '/record?tab=kice',
  '/kice/analytics': '/record?tab=kice',

  // Existing aliases
  '/stats': '/record?tab=mastery',
  '/analytics': '/record?tab=kice',
} as const;

export type OldRoute = keyof typeof ROUTE_MAP;
