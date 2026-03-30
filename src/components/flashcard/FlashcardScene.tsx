'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import type { LeitnerCard, AnswerGrade } from '@/stores/useLeitnerStore';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Eye } from 'lucide-react';

interface FlashcardSceneProps {
  readonly card: LeitnerCard;
  readonly onAnswer: (grade: AnswerGrade) => void;
  readonly currentIndex: number;
  readonly total: number;
  readonly results: ReadonlyArray<{ grade: AnswerGrade }>;
}

/** 카드 표시 단계: 질문만 → 힌트 공개 → 정답 공개 */
type CardPhase = 'question' | 'hint' | 'answer';

const SWIPE_THRESHOLD = 80;
const MAX_ROTATION_DEG = 12;

// ─── 초성 추출 ─────────────────────────────────────────────────────────────────
const CHOSUNG = [
  'ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ',
  'ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ',
];

function extractChosung(text: string): string {
  return Array.from(text)
    .map((ch) => {
      const code = ch.charCodeAt(0);
      if (code >= 0xac00 && code <= 0xd7a3) {
        return CHOSUNG[Math.floor((code - 0xac00) / 588)];
      }
      // 숫자, 영문, 공백, 구두점은 그대로
      if (/[\s.,·:;!?()0-9a-zA-Z]/.test(ch)) return ch;
      return ch;
    })
    .join('');
}

/** 답에서 맥락 힌트 생성: 글자 수 + 핵심 키워드 일부 마스킹 */
function generateContextHint(answer: string): string {
  const trimmed = answer.trim();
  const lines = trimmed.split('\n').filter((l) => l.trim());
  if (lines.length > 1) {
    return `${lines.length}가지 항목이 있어요`;
  }
  const len = trimmed.length;
  if (len <= 5) return `${len}글자 단어예요`;
  return `${len}글자, ${Math.ceil(len / 2)}번째 글자는 "${trimmed[Math.floor(len / 2)]}"`;
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function FlashcardScene({
  card,
  onAnswer,
  currentIndex,
  total,
  results,
}: FlashcardSceneProps) {
  const [phase, setPhase] = useState<CardPhase>('question');
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [entering, setEntering] = useState(true);
  const [exiting, setExiting] = useState<'left' | 'center' | 'right' | null>(null);
  const [hintUsed, setHintUsed] = useState(false);

  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 힌트 데이터
  const chosungHint = useMemo(() => extractChosung(card.answer), [card.answer]);
  const contextHint = useMemo(() => generateContextHint(card.answer), [card.answer]);

  // Reset state when card changes
  useEffect(() => {
    setPhase('question');
    setDragOffset(0);
    setExiting(null);
    setHintUsed(false);
    setEntering(true);
    const timer = setTimeout(() => setEntering(false), 300);
    return () => clearTimeout(timer);
  }, [card.id]);

  const showHint = useCallback(() => {
    setPhase('hint');
    setHintUsed(true);
  }, []);

  const showAnswer = useCallback(() => {
    setPhase('answer');
  }, []);

  const commitAnswer = useCallback(
    (grade: AnswerGrade) => {
      const dir = grade === 'knew' ? 'right' : grade === 'forgot' ? 'left' : 'center';
      setExiting(dir);
      setTimeout(() => onAnswer(grade), 250);
    },
    [onAnswer]
  );

  // Keyboard support
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (phase === 'question') {
        if (e.key === 'h' || e.key === 'H') {
          e.preventDefault();
          showHint();
        } else if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          showAnswer();
        }
      } else if (phase === 'hint') {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          showAnswer();
        }
      } else if (phase === 'answer') {
        if (e.key === 'ArrowRight' || e.key === 'o') {
          e.preventDefault();
          commitAnswer(hintUsed ? 'hint' : 'knew');
        } else if (e.key === 'ArrowLeft' || e.key === 'x') {
          e.preventDefault();
          commitAnswer('forgot');
        } else if (e.key === 'ArrowUp' && hintUsed) {
          e.preventDefault();
          commitAnswer('hint');
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, hintUsed, showHint, showAnswer, commitAnswer]);

  // Pointer handlers for swipe (answer phase only)
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (phase !== 'answer') return;
      pointerStart.current = { x: e.clientX, y: e.clientY };
      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [phase]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || !pointerStart.current) return;
      setDragOffset(e.clientX - pointerStart.current.x);
    },
    [isDragging]
  );

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    pointerStart.current = null;

    if (Math.abs(dragOffset) >= SWIPE_THRESHOLD) {
      if (dragOffset > 0) {
        commitAnswer(hintUsed ? 'hint' : 'knew');
      } else {
        commitAnswer('forgot');
      }
    } else {
      setDragOffset(0);
    }
  }, [isDragging, dragOffset, hintUsed, commitAnswer]);

  // Derived visual states
  const dragProgress = Math.min(Math.abs(dragOffset) / SWIPE_THRESHOLD, 1);
  const tiltDeg = (dragOffset / SWIPE_THRESHOLD) * MAX_ROTATION_DEG;
  const clampedTilt = Math.max(-MAX_ROTATION_DEG, Math.min(MAX_ROTATION_DEG, tiltDeg));
  const swipeDirection = dragOffset > 0 ? 'right' : dragOffset < 0 ? 'left' : null;
  const overlayOpacity = dragProgress * 0.6;

  const exitTransform =
    exiting === 'left'
      ? 'translateX(-120%) rotate(-15deg)'
      : exiting === 'right'
        ? 'translateX(120%) rotate(15deg)'
        : exiting === 'center'
          ? 'translateY(-40px) scale(0.95)'
          : undefined;

  const enterTransform = entering ? 'translateX(60px)' : undefined;
  const enterOpacity = entering ? 0 : 1;

  // Progress dot color per grade
  const dotColor = (grade: AnswerGrade) =>
    grade === 'knew' ? 'bg-emerald-500' : grade === 'hint' ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="flex flex-col gap-5">
      {/* Progress dots */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 flex-wrap max-h-10 overflow-y-auto sm:max-h-16">
          {Array.from({ length: total }, (_, i) => {
            const result = results[i];
            let dotClass = 'bg-muted-foreground/30';
            if (result !== undefined) {
              dotClass = dotColor(result.grade);
            } else if (i === currentIndex) {
              dotClass = 'bg-primary ring-2 ring-primary/40';
            }
            return (
              <span
                key={i}
                className={`inline-block w-2.5 h-2.5 rounded-full transition-colors duration-200 ${dotClass}`}
              />
            );
          })}
        </div>
        <Badge variant="outline">박스 {card.box}</Badge>
      </div>

      {/* Counter */}
      <p className="text-sm text-muted-foreground font-medium">
        {currentIndex + 1} / {total}
      </p>

      {/* Card */}
      <div
        ref={containerRef}
        className="relative select-none touch-pan-y"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          className="relative w-full transition-transform"
          style={{
            transform: exiting
              ? exitTransform
              : `translateX(${isDragging ? dragOffset : 0}px) rotate(${isDragging ? clampedTilt : 0}deg) ${enterTransform ?? ''}`,
            opacity: exiting ? 0 : enterOpacity,
            transition: isDragging
              ? 'none'
              : exiting
                ? 'transform 0.25s ease-out, opacity 0.25s ease-out'
                : entering
                  ? 'transform 0.3s ease-out, opacity 0.3s ease-out'
                  : 'transform 0.3s ease-out',
          }}
        >
          {/* Swipe overlay hints */}
          {isDragging && swipeDirection === 'right' && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-emerald-500 pointer-events-none"
              style={{ opacity: overlayOpacity }}
            >
              <span className="text-white text-2xl font-bold">
                {hintUsed ? '힌트 보고 떠올림' : '알고 있었어요'} ✓
              </span>
            </div>
          )}
          {isDragging && swipeDirection === 'left' && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-red-500 pointer-events-none"
              style={{ opacity: overlayOpacity }}
            >
              <span className="text-white text-2xl font-bold">모르겠어요 ✗</span>
            </div>
          )}

          {/* Card body */}
          <div className="relative min-h-52 sm:min-h-64 rounded-2xl border border-border bg-card p-5 sm:p-6 flex flex-col items-center justify-center gap-4"
            style={{
              boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(99,102,241,0.08)',
            }}
          >
            {/* Phase: Question */}
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
              질문
            </p>
            <p className="text-center text-lg font-medium leading-relaxed px-2">
              {card.question}
            </p>

            {/* Phase: Hint — 맥락 + 초성 */}
            {(phase === 'hint' || phase === 'answer') && (
              <div className="w-full mt-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" />
                  힌트
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-300">{contextHint}</p>
                <p className="text-sm font-mono text-amber-700 dark:text-amber-400 tracking-wider">
                  {chosungHint}
                </p>
              </div>
            )}

            {/* Phase: Answer — 정답 표시 */}
            {phase === 'answer' && (
              <div className="w-full mt-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
                  정답
                </p>
                <p className="text-base leading-relaxed whitespace-pre-wrap text-emerald-900 dark:text-emerald-200">
                  {card.answer}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons — phase-dependent */}
      <div className="space-y-3">
        {/* Question phase: 힌트 보기 + 바로 답 확인 */}
        {phase === 'question' && (
          <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-200">
            <button
              type="button"
              className="h-14 rounded-xl border-2 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 font-semibold text-base hover:bg-amber-50 dark:hover:bg-amber-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              onClick={showHint}
            >
              <Lightbulb className="w-5 h-5" />
              힌트 보기
            </button>
            <button
              type="button"
              className="h-14 rounded-xl bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground font-semibold text-base transition-all flex items-center justify-center gap-2"
              onClick={() => { showAnswer(); }}
            >
              <Eye className="w-5 h-5" />
              바로 답 확인
            </button>
          </div>
        )}

        {/* Hint phase: 답 확인 */}
        {phase === 'hint' && (
          <div className="animate-in fade-in duration-200">
            <button
              type="button"
              className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground font-semibold text-base transition-all flex items-center justify-center gap-2"
              onClick={showAnswer}
            >
              <Eye className="w-5 h-5" />
              답 확인하기
            </button>
          </div>
        )}

        {/* Answer phase: 자가 평가 3분기 (or 2분기 if no hint) */}
        {phase === 'answer' && !exiting && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p className="text-xs text-center text-muted-foreground mb-2">
              떠올린 답과 비교해보세요
            </p>
            {hintUsed ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="h-14 rounded-xl border-2 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 font-semibold text-base hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-95 transition-all"
                  onClick={() => commitAnswer('forgot')}
                >
                  모르겠어요
                </button>
                <button
                  type="button"
                  className="h-14 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-semibold text-base transition-all"
                  onClick={() => commitAnswer('hint')}
                >
                  힌트 보고 떠올림
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="h-14 rounded-xl border-2 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 font-semibold text-base hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-95 transition-all"
                  onClick={() => commitAnswer('forgot')}
                >
                  모르겠어요
                </button>
                <button
                  type="button"
                  className="h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-base transition-all"
                  onClick={() => commitAnswer('knew')}
                >
                  알고 있었어요
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Keyboard hints (desktop) */}
      <div className="hidden sm:flex justify-center gap-4 text-xs text-muted-foreground">
        {phase === 'question' && (
          <>
            <span>
              <kbd className="px-1.5 py-0.5 rounded border border-border text-[10px] font-mono">H</kbd>{' '}
              힌트
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded border border-border text-[10px] font-mono">Space</kbd>{' '}
              바로 답 확인
            </span>
          </>
        )}
        {phase === 'hint' && (
          <span>
            <kbd className="px-1.5 py-0.5 rounded border border-border text-[10px] font-mono">Space</kbd>{' '}
            답 확인
          </span>
        )}
        {phase === 'answer' && (
          <>
            <span>
              <kbd className="px-1.5 py-0.5 rounded border border-border text-[10px] font-mono">←</kbd>{' '}
              모름
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded border border-border text-[10px] font-mono">→</kbd>{' '}
              {hintUsed ? '힌트로 떠올림' : '알고 있었음'}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
