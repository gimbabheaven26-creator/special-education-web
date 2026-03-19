'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { MessageSquarePlus, X, Send, Trash2, ImagePlus, Loader2 } from 'lucide-react';

const MAX_IMAGES = 5;

async function saveToServer(
  path: string,
  content: string,
  reviewerName: string,
  imageUrls: string[],
): Promise<boolean> {
  try {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, content, reviewer_name: reviewerName, image_urls: imageUrls }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function uploadImage(file: File): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/reviews/upload', { method: 'POST', body: formData });
    if (!res.ok) return null;
    const data = await res.json();
    return data.url ?? null;
  } catch {
    return null;
  }
}

const STORAGE_KEY = 'se-review-notes';
const IMAGES_STORAGE_KEY = 'se-review-images';
const REVIEWER_NAME_KEY = 'se-reviewer-name';

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

function getLocalImages(): Record<string, string[]> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(IMAGES_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveLocalImages(images: Record<string, string[]>) {
  localStorage.setItem(IMAGES_STORAGE_KEY, JSON.stringify(images));
}

export function ReviewPanel() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState('');
  const [dateLabel] = useState(() =>
    new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })
  );
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(false);
  const [reviewerName, setReviewerName] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(REVIEWER_NAME_KEY);
    if (stored) setReviewerName(stored);
  }, []);

  const handleNameChange = (name: string) => {
    setReviewerName(name);
    localStorage.setItem(REVIEWER_NAME_KEY, name);
  };

  // 페이지 변경 시 해당 페이지의 로컬 노트 로드 (읽기 전용 — 제출 전까지 서버 저장 안 함)
  useEffect(() => {
    const notes = getLocalNotes();
    const images = getLocalImages();
    setNote(notes[pathname] || '');
    setImageUrls(images[pathname] || []);
    setServerError(false);
    setPreviewImage(null);
  }, [pathname]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = MAX_IMAGES - imageUrls.length;
    if (remainingSlots <= 0) return;

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setUploading(true);

    const newUrls: string[] = [];
    for (const file of filesToUpload) {
      const url = await uploadImage(file);
      if (url) newUrls.push(url);
    }

    if (newUrls.length > 0) {
      setImageUrls((prev) => [...prev, ...newUrls]);
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (previewImage === prev[index]) setPreviewImage(null);
      return updated;
    });
  };

  const handleDelete = () => {
    const notes = getLocalNotes();
    const localImages = getLocalImages();
    delete notes[pathname];
    delete localImages[pathname];
    saveLocalNotes(notes);
    saveLocalImages(localImages);
    setNote('');
    setImageUrls([]);
    setServerError(false);
    setPreviewImage(null);
  };

  const handleSubmit = useCallback(async () => {
    if (!note.trim() && imageUrls.length === 0) return;
    setSubmitting(true);

    // localStorage 저장
    const notes = getLocalNotes();
    const localImages = getLocalImages();
    notes[pathname] = note;
    localImages[pathname] = imageUrls;
    saveLocalNotes(notes);
    saveLocalImages(localImages);

    // 서버 저장
    const ok = await saveToServer(pathname, note, reviewerName, imageUrls);
    setServerError(!ok);
    setSubmitting(false);

    if (ok) {
      // 제출 성공: 입력 초기화
      setNote('');
      setImageUrls([]);
      setIsOpen(false);
    }
  }, [pathname, note, imageUrls, reviewerName]);

  const hasNote = note.trim().length > 0 || imageUrls.length > 0;

  return (
    <>
      {/* 열기 버튼 */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => textareaRef.current?.focus(), 100);
          }}
          className="fixed right-4 bottom-20 md:bottom-6 z-50 flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-3 shadow-lg hover:bg-primary/90 hover:scale-105 transition-all min-w-[44px] min-h-[44px] print:hidden"
          title="나의 리뷰"
        >
          <MessageSquarePlus className="h-5 w-5" />
          {hasNote && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
          )}
        </button>
      )}

      {/* 이미지 프리뷰 모달 */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="리뷰 이미지 확대"
            className="max-w-full max-h-full rounded-lg object-contain"
          />
        </div>
      )}

      {/* 리뷰 패널 */}
      {isOpen && (
        <div className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-96 bg-background border-l border-border shadow-2xl flex flex-col print:hidden">
          {/* 헤더 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">나의 리뷰</h3>
                <span className="text-xs text-muted-foreground">{dateLabel}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate max-w-[240px]">
                {pathname === '/' ? '홈' : pathname.replace(/^\//, '').replace(/\//g, ' > ').replace(/-/g, ' ')}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* 편집 뷰 */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {/* 리뷰어 이름 */}
            <input
              type="text"
              value={reviewerName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="이름 (예: 카이란)"
              maxLength={50}
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
            />
            <textarea
              ref={textareaRef}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="이 페이지에 대한 메모, 리뷰, 중요 포인트를 적어보세요..."
              className="w-full h-full min-h-[200px] resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
            />

            {/* 이미지 섹션 */}
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {imageUrls.map((url, i) => (
                  <div key={url} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                    <img
                      src={url}
                      alt={`첨부 이미지 ${i + 1}`}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setPreviewImage(url)}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 이미지 업로드 버튼 */}
            {imageUrls.length < MAX_IMAGES && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors disabled:opacity-50 min-h-[44px]"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ImagePlus className="h-4 w-4" />
                )}
                {uploading ? '업로드 중...' : `사진 추가 (${imageUrls.length}/${MAX_IMAGES})`}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          <div className="px-4 py-3 border-t border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSubmit}
                disabled={!hasNote || submitting}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors min-h-[44px] disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                {submitting ? '제출 중...' : '제출'}
              </button>
              {hasNote && (
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors min-h-[44px]"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  삭제
                </button>
              )}
              {serverError && (
                <span className="text-xs text-amber-600 dark:text-amber-400 ml-auto">서버 저장 실패</span>
              )}
            </div>
          </div>
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
