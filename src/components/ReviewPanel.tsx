'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MessageSquarePlus, X, Save, Trash2, History, ArrowLeft, ExternalLink } from 'lucide-react';

interface Review {
  path: string;
  content: string;
  updatedAt: string;
}

// 서버 API로 저장
async function saveToServer(path: string, content: string) {
  try {
    await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, content }),
    });
  } catch {
    // 서버 저장 실패해도 localStorage는 유지
  }
}

async function fetchAllReviews(): Promise<Review[]> {
  try {
    const res = await fetch('/api/reviews');
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

// localStorage 헬퍼 (오프라인 백업)
const STORAGE_KEY = 'se-review-notes';

function getLocalNotes(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveLocalNotes(notes: Record<string, string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export function ReviewPanel() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'edit' | 'history'>('edit');
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 페이지 변경 시 해당 페이지의 노트 로드
  useEffect(() => {
    const notes = getLocalNotes();
    setNote(notes[pathname] || '');
    setSaved(false);
    setView('edit');
  }, [pathname]);

  // 저장 (localStorage + 서버)
  const persistNote = useCallback(
    (value: string) => {
      const notes = getLocalNotes();
      if (value.trim()) {
        notes[pathname] = value;
      } else {
        delete notes[pathname];
      }
      saveLocalNotes(notes);
      saveToServer(pathname, value);
      setSaved(true);
    },
    [pathname],
  );

  // 자동 저장 (1초 debounce)
  const handleChange = useCallback(
    (value: string) => {
      setNote(value);
      setSaved(false);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => persistNote(value), 1000);
    },
    [persistNote],
  );

  const handleDelete = () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    persistNote('');
    setNote('');
    setSaved(false);
  };

  const handleSaveNow = () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    persistNote(note);
  };

  // 히스토리 로드
  const loadHistory = async () => {
    setView('history');
    const reviews = await fetchAllReviews();
    // 최신순 정렬
    reviews.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    setAllReviews(reviews);
  };

  // 히스토리에서 페이지 이동
  const navigateToReview = (path: string) => {
    setView('edit');
    router.push(path);
  };

  const hasNote = note.trim().length > 0;
  const [noteCount, setNoteCount] = useState(0);
  useEffect(() => {
    setNoteCount(Object.keys(getLocalNotes()).length);
  }, [saved, isOpen]);

  // 날짜 포맷
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hours = d.getHours().toString().padStart(2, '0');
    const mins = d.getMinutes().toString().padStart(2, '0');
    return `${month}/${day} ${hours}:${mins}`;
  };

  // 경로를 읽기 좋게 변환
  const formatPath = (path: string) => {
    if (path === '/') return '홈';
    return path
      .replace(/^\//, '')
      .replace(/\//g, ' > ')
      .replace(/-/g, ' ');
  };

  return (
    <>
      {/* 열기 버튼 */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setView('edit');
            setTimeout(() => textareaRef.current?.focus(), 100);
          }}
          className="fixed right-6 bottom-6 z-50 flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-3 shadow-lg hover:bg-primary/90 hover:scale-105 transition-all print:hidden"
          title="나의 리뷰"
        >
          <MessageSquarePlus className="h-5 w-5" />
          {hasNote && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
          )}
        </button>
      )}

      {/* 리뷰 패널 */}
      {isOpen && (
        <div className="fixed right-0 top-0 bottom-0 z-50 w-80 sm:w-96 bg-background border-l border-border shadow-2xl flex flex-col print:hidden">
          {/* 헤더 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
            <div className="flex items-center gap-2">
              {view === 'history' && (
                <button
                  onClick={() => setView('edit')}
                  className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {view === 'edit' ? '나의 리뷰' : '리뷰 히스토리'}
                </h3>
                {view === 'edit' && (
                  <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                    {formatPath(pathname)}
                  </p>
                )}
                {view === 'history' && (
                  <p className="text-xs text-muted-foreground">
                    총 {allReviews.length}개 리뷰
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* 편집 뷰 */}
          {view === 'edit' && (
            <>
              <div className="flex-1 p-4 overflow-y-auto">
                <textarea
                  ref={textareaRef}
                  value={note}
                  onChange={(e) => handleChange(e.target.value)}
                  placeholder="이 페이지에 대한 메모, 리뷰, 중요 포인트를 적어보세요..."
                  className="w-full h-full min-h-[200px] resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
                />
              </div>

              <div className="px-4 py-3 border-t border-border bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveNow}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      <Save className="h-3.5 w-3.5" />
                      저장
                    </button>
                    {hasNote && (
                      <button
                        onClick={handleDelete}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        삭제
                      </button>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {saved && <span className="text-green-600 dark:text-green-400">저장됨</span>}
                    {!saved && hasNote && <span>자동 저장 대기...</span>}
                  </span>
                </div>
                <button
                  onClick={loadHistory}
                  className="w-full inline-flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-md border border-border hover:bg-muted transition-colors text-foreground"
                >
                  <History className="h-3.5 w-3.5" />
                  리뷰 히스토리 ({noteCount}개)
                </button>
              </div>
            </>
          )}

          {/* 히스토리 뷰 */}
          {view === 'history' && (
            <div className="flex-1 overflow-y-auto">
              {allReviews.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  아직 작성된 리뷰가 없습니다
                </div>
              )}
              {allReviews.map((review) => (
                <button
                  key={review.path}
                  onClick={() => navigateToReview(review.path)}
                  className="w-full text-left px-4 py-3 border-b border-border hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate flex items-center gap-1">
                        {formatPath(review.path)}
                        <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {review.content}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                      {formatDate(review.updatedAt)}
                    </span>
                  </div>
                  {review.path === pathname && (
                    <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                      현재 페이지
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 배경 오버레이 (모바일) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 sm:hidden print:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
