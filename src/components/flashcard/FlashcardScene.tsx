'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { LeitnerCard } from '@/stores/useLeitnerStore';
import { Badge } from '@/components/ui/badge';
import { RotateCcw } from 'lucide-react';

interface FlashcardSceneProps {
  readonly card: LeitnerCard;
  readonly onAnswer: (correct: boolean) => void;
  readonly currentIndex: number;
  readonly total: number;
  readonly results: ReadonlyArray<{ correct: boolean }>;
}

const SWIPE_THRESHOLD = 80;
const MAX_ROTATION_DEG = 12;
const FLIP_DURATION_MS = 600;

export function FlashcardScene({
  card,
  onAnswer,
  currentIndex,
  total,
  results,
}: FlashcardSceneProps) {
  const [flipped, setFlipped] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [entering, setEntering] = useState(true);
  const [exiting, setExiting] = useState<'left' | 'right' | null>(null);

  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset flip state when card changes
  useEffect(() => {
    setFlipped(false);
    setDragOffset(0);
    setExiting(null);
    setEntering(true);
    const timer = setTimeout(() => setEntering(false), 300);
    return () => clearTimeout(timer);
  }, [card.id]);

  const handleFlip = useCallback(() => {
    if (!flipped) {
      setFlipped(true);
    }
  }, [flipped]);

  const commitAnswer = useCallback(
    (correct: boolean) => {
      setExiting(correct ? 'right' : 'left');
      setTimeout(() => {
        onAnswer(correct);
      }, 250);
    },
    [onAnswer]
  );

  // Keyboard support
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if ((e.key === ' ' || e.key === 'Enter') && !flipped) {
        e.preventDefault();
        setFlipped(true);
        return;
      }

      if (flipped) {
        if (e.key === 'ArrowRight' || e.key === 'o') {
          e.preventDefault();
          commitAnswer(true);
        } else if (e.key === 'ArrowLeft' || e.key === 'x') {
          e.preventDefault();
          commitAnswer(false);
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flipped, commitAnswer]);

  // Pointer handlers for swipe
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!flipped) return;
      pointerStart.current = { x: e.clientX, y: e.clientY };
      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [flipped]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || !pointerStart.current) return;
      const dx = e.clientX - pointerStart.current.x;
      setDragOffset(dx);
    },
    [isDragging]
  );

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    pointerStart.current = null;

    if (Math.abs(dragOffset) >= SWIPE_THRESHOLD) {
      commitAnswer(dragOffset > 0);
    } else {
      setDragOffset(0);
    }
  }, [isDragging, dragOffset, commitAnswer]);

  // Derived visual states
  const dragProgress = Math.min(Math.abs(dragOffset) / SWIPE_THRESHOLD, 1);
  const tiltDeg = (dragOffset / SWIPE_THRESHOLD) * MAX_ROTATION_DEG;
  const clampedTilt = Math.max(-MAX_ROTATION_DEG, Math.min(MAX_ROTATION_DEG, tiltDeg));

  const swipeDirection = dragOffset > 0 ? 'right' : dragOffset < 0 ? 'left' : null;
  const overlayOpacity = dragProgress * 0.6;

  // Exit animation transform
  const exitTransform =
    exiting === 'left'
      ? 'translateX(-120%) rotate(-15deg)'
      : exiting === 'right'
        ? 'translateX(120%) rotate(15deg)'
        : undefined;

  // Enter animation
  const enterTransform = entering ? 'translateX(60px)' : undefined;
  const enterOpacity = entering ? 0 : 1;

  return (
    <div className="flex flex-col gap-5">
      {/* Progress dots */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 flex-wrap max-h-10 overflow-y-auto sm:max-h-16">
          {Array.from({ length: total }, (_, i) => {
            const result = results[i];
            let dotClass = 'bg-gray-200 dark:bg-gray-700';
            if (result !== undefined) {
              dotClass = result.correct
                ? 'bg-emerald-500'
                : 'bg-red-500';
            } else if (i === currentIndex) {
              dotClass = 'bg-blue-500 ring-2 ring-blue-300 dark:ring-blue-700';
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

      {/* 3D Card */}
      <div
        ref={containerRef}
        className="relative select-none touch-pan-y"
        style={{ perspective: '1200px' }}
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
              <span className="text-white text-2xl font-bold">맞았어요 ✓</span>
            </div>
          )}
          {isDragging && swipeDirection === 'left' && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-red-500 pointer-events-none"
              style={{ opacity: overlayOpacity }}
            >
              <span className="text-white text-2xl font-bold">틀렸어요 ✗</span>
            </div>
          )}

          {/* Card inner with 3D flip */}
          <div
            className="relative w-full"
            style={{
              transformStyle: 'preserve-3d',
              transition: `transform ${FLIP_DURATION_MS}ms ease`,
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front face */}
            <div
              className="relative min-h-44 sm:min-h-56 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 sm:p-6 flex flex-col items-center justify-center gap-4 cursor-pointer"
              style={{
                backfaceVisibility: 'hidden',
                boxShadow: flipped
                  ? 'none'
                  : '0 4px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(99,102,241,0.08)',
              }}
              onClick={handleFlip}
              role="button"
              tabIndex={0}
              aria-label="탭하여 답 확인"
            >
              {/* Shimmer overlay during flip */}
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-r from-transparent via-white/30 to-transparent"
                style={{
                  opacity: 0,
                  animation: flipped ? 'shimmer 0.6s ease forwards' : 'none',
                }}
              />
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                질문
              </p>
              <p className="text-center text-lg font-medium leading-relaxed px-2">
                {card.question}
              </p>
              <p className="text-center text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                <RotateCcw className="w-3 h-3" />
                탭하여 답 확인
              </p>
            </div>

            {/* Back face */}
            <div
              className="absolute inset-0 min-h-44 sm:min-h-56 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 sm:p-6 flex flex-col items-center justify-center gap-4"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                boxShadow: flipped
                  ? '0 4px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(16,185,129,0.12)'
                  : 'none',
              }}
            >
              <p className="text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-semibold">
                답
              </p>
              <p className="text-center text-base leading-relaxed whitespace-pre-wrap px-2">
                {card.answer}
              </p>
              <p className="text-center text-xs text-muted-foreground mt-2">
                스와이프하거나 아래 버튼으로 응답하세요
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Answer buttons - visible after flip */}
      <div
        className="grid grid-cols-2 gap-3 transition-all duration-300"
        style={{
          opacity: flipped && !exiting ? 1 : 0,
          transform: flipped && !exiting ? 'translateY(0)' : 'translateY(8px)',
          pointerEvents: flipped && !exiting ? 'auto' : 'none',
        }}
      >
        <button
          type="button"
          className="h-14 rounded-xl border-2 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 font-semibold text-base hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-95 transition-all"
          onClick={() => commitAnswer(false)}
        >
          틀렸어요
        </button>
        <button
          type="button"
          className="h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-base transition-all"
          onClick={() => commitAnswer(true)}
        >
          맞았어요
        </button>
      </div>

      {/* Keyboard hints (desktop) */}
      <div className="hidden sm:flex justify-center gap-6 text-xs text-muted-foreground">
        <span>
          <kbd className="px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-600 text-[10px] font-mono">Space</kbd>{' '}
          뒤집기
        </span>
        <span>
          <kbd className="px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-600 text-[10px] font-mono">←</kbd>{' '}
          틀림
        </span>
        <span>
          <kbd className="px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-600 text-[10px] font-mono">→</kbd>{' '}
          맞음
        </span>
      </div>

      {/* Shimmer keyframe style */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            opacity: 0;
            transform: translateX(-100%);
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 0;
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
