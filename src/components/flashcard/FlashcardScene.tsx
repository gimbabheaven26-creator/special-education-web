'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import type { LeitnerCard, AnswerGrade } from '@/stores/useLeitnerStore';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Eye, Timer } from 'lucide-react';

interface FlashcardSceneProps {
  readonly card: LeitnerCard;
  readonly onAnswer: (grade: AnswerGrade) => void;
  readonly currentIndex: number;
  readonly total: number;
  readonly results: ReadonlyArray<{ grade: AnswerGrade }>;
}

// ─── 타이머 상수 ────────────────────────────────────────────────────────────────
const AUTO_ADVANCE_CORRECT_MS = 2000;
const AUTO_ADVANCE_WRONG_MS = 4000;

// ─── OX 카드 단계: 질문 → 결과(정답/오답) ───────────────────────────────────────
type OXPhase = 'question' | 'result';

// ─── 일반 카드 단계: 질문 → 힌트 → 정답 → 결과 ──────────────────────────────────
type GeneralPhase = 'question' | 'hint' | 'answer' | 'result';

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
      if (/[\s.,·:;!?()0-9a-zA-Z]/.test(ch)) return ch;
      return ch;
    })
    .join('');
}

function generateContextHint(answer: string): string {
  const trimmed = answer.trim();
  const lines = trimmed.split('\n').filter((l) => l.trim());
  if (lines.length > 1) return `${lines.length}가지 항목이 있어요`;
  const len = trimmed.length;
  if (len <= 5) return `${len}글자 단어예요`;
  return `${len}글자, ${Math.ceil(len / 2)}번째 글자는 "${trimmed[Math.floor(len / 2)]}"`;
}

// ─── 타이머 바 컴포넌트 ─────────────────────────────────────────────────────────

function AdvanceTimerBar({
  isCorrect,
  delayMs,
  onComplete,
}: {
  isCorrect: boolean;
  delayMs: number;
  onComplete: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setProgress(Math.min((elapsed / delayMs) * 100, 100));
    }, 50);

    timerRef.current = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      onComplete();
    }, delayMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [delayMs, onComplete]);

  return (
    <button
      onClick={() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);
        onComplete();
      }}
      className="w-full mt-3 rounded-lg overflow-hidden bg-muted/30 h-8 relative cursor-pointer hover:bg-muted/50 transition-colors"
      aria-label="탭하여 다음으로 이동"
    >
      <div
        className={`absolute inset-y-0 left-0 transition-none ${isCorrect ? 'bg-green-500/30' : 'bg-amber-500/30'}`}
        style={{ width: `${progress}%` }}
      />
      <div className="relative flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Timer className="h-3.5 w-3.5" />
        <span>다음 카드로 이동 중... (탭하여 건너뛰기)</span>
      </div>
    </button>
  );
}

// ─── 진행 점 ────────────────────────────────────────────────────────────────────

function ProgressDots({ total, currentIndex, results }: { total: number; currentIndex: number; results: ReadonlyArray<{ grade: AnswerGrade }> }) {
  const dotColor = (grade: AnswerGrade) =>
    grade === 'knew' ? 'bg-emerald-500' : grade === 'hint' ? 'bg-amber-500' : 'bg-red-500';

  return (
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
          <span key={i} className={`inline-block w-2.5 h-2.5 rounded-full transition-colors duration-200 ${dotClass}`} />
        );
      })}
    </div>
  );
}

// ─── OX 카드 씬 ─────────────────────────────────────────────────────────────────

function OXCardScene({
  card,
  onAnswer,
}: {
  card: LeitnerCard;
  onAnswer: (grade: AnswerGrade) => void;
}) {
  const [phase, setPhase] = useState<OXPhase>('question');
  const [selected, setSelected] = useState<string | null>(null);
  const [entering, setEntering] = useState(true);

  // OX 카드의 정답은 answer 첫 줄의 "O" 또는 "X"
  const correctAnswer = useMemo(() => {
    const first = card.answer.trim().split('\n')[0].trim();
    if (first.startsWith('O')) return 'O';
    if (first.startsWith('X')) return 'X';
    return first.toUpperCase();
  }, [card.answer]);

  const isCorrect = selected === correctAnswer;

  // 해설 (정답 라인 이후)
  const explanation = useMemo(() => {
    const lines = card.answer.trim().split('\n');
    return lines.slice(1).join('\n').trim();
  }, [card.answer]);

  useEffect(() => {
    setPhase('question');
    setSelected(null);
    setEntering(true);
    const timer = setTimeout(() => setEntering(false), 300);
    return () => clearTimeout(timer);
  }, [card.id]);

  const handleSelect = useCallback((choice: string) => {
    if (phase !== 'question') return;
    setSelected(choice);
    setPhase('result');
  }, [phase]);

  const commitAnswer = useCallback(() => {
    onAnswer(isCorrect ? 'knew' : 'forgot');
  }, [isCorrect, onAnswer]);

  // Keyboard
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (phase === 'question') {
        if (e.key === 'o' || e.key === 'O') { e.preventDefault(); handleSelect('O'); }
        if (e.key === 'x' || e.key === 'X') { e.preventDefault(); handleSelect('X'); }
      } else if (phase === 'result') {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); commitAnswer(); }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, handleSelect, commitAnswer]);

  return (
    <div
      className="space-y-4"
      style={{
        opacity: entering ? 0 : 1,
        transform: entering ? 'translateX(60px)' : 'none',
        transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
      }}
    >
      {/* 질문 카드 */}
      <div
        className="min-h-40 sm:min-h-52 rounded-2xl border border-border bg-card p-5 sm:p-6 flex flex-col items-center justify-center gap-3"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
      >
        <Badge variant="outline" className="text-[10px]">OX 퀴즈</Badge>
        <p className="text-center text-lg font-medium leading-relaxed px-2">{card.question}</p>
      </div>

      {/* O / X 버튼 */}
      <div className="flex gap-4">
        {['O', 'X'].map((choice) => {
          let className = 'flex-1 h-16 text-2xl font-bold rounded-xl border transition-colors cursor-pointer';
          if (phase === 'result') {
            if (choice === correctAnswer) {
              className += ' border-green-500 bg-green-50 dark:bg-green-950/20 text-green-600';
            } else if (choice === selected && choice !== correctAnswer) {
              className += ' border-red-500 bg-red-50 dark:bg-red-950/20 text-red-600';
            } else {
              className += ' border-border bg-muted/30 text-muted-foreground';
            }
          } else {
            className += ' border-border hover:border-primary hover:bg-primary/5';
          }
          return (
            <button
              key={choice}
              className={className}
              onClick={() => handleSelect(choice)}
              disabled={phase !== 'question'}
              aria-label={`${choice} 선택`}
            >
              {choice}
            </button>
          );
        })}
      </div>

      {/* 결과 + 해설 */}
      {phase === 'result' && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-3">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {isCorrect ? '정답!' : `오답 (정답: ${correctAnswer})`}
            </span>
          </div>
          {explanation && (
            <div className="p-3 rounded-xl bg-muted/50 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {explanation}
            </div>
          )}
          <AdvanceTimerBar
            isCorrect={isCorrect}
            delayMs={isCorrect ? AUTO_ADVANCE_CORRECT_MS : AUTO_ADVANCE_WRONG_MS}
            onComplete={commitAnswer}
          />
        </div>
      )}

      {/* 키보드 힌트 */}
      <div className="hidden sm:flex justify-center gap-4 text-xs text-muted-foreground">
        {phase === 'question' && (
          <>
            <span><kbd className="px-1.5 py-0.5 rounded border border-border text-[10px] font-mono">O</kbd></span>
            <span><kbd className="px-1.5 py-0.5 rounded border border-border text-[10px] font-mono">X</kbd></span>
          </>
        )}
        {phase === 'result' && (
          <span><kbd className="px-1.5 py-0.5 rounded border border-border text-[10px] font-mono">Space</kbd> 다음</span>
        )}
      </div>
    </div>
  );
}

// ─── 일반 카드 씬 (fill_in + 수동) ──────────────────────────────────────────────

function GeneralCardScene({
  card,
  onAnswer,
}: {
  card: LeitnerCard;
  onAnswer: (grade: AnswerGrade) => void;
}) {
  const [phase, setPhase] = useState<GeneralPhase>('question');
  const [hintUsed, setHintUsed] = useState(false);
  const [entering, setEntering] = useState(true);

  const chosungHint = useMemo(() => extractChosung(card.answer), [card.answer]);
  const contextHint = useMemo(() => generateContextHint(card.answer), [card.answer]);

  useEffect(() => {
    setPhase('question');
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

  const commitAnswer = useCallback(() => {
    // 힌트 사용 → hint 등급, 미사용 → knew 등급
    onAnswer(hintUsed ? 'hint' : 'knew');
  }, [hintUsed, onAnswer]);

  // Keyboard
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (phase === 'question') {
        if (e.key === 'h' || e.key === 'H') { e.preventDefault(); showHint(); }
        else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); showAnswer(); }
      } else if (phase === 'hint') {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); showAnswer(); }
      } else if (phase === 'answer') {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setPhase('result'); }
      } else if (phase === 'result') {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); commitAnswer(); }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, showHint, showAnswer, commitAnswer]);

  return (
    <div
      className="space-y-4"
      style={{
        opacity: entering ? 0 : 1,
        transform: entering ? 'translateX(60px)' : 'none',
        transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
      }}
    >
      {/* 카드 */}
      <div
        className="min-h-52 sm:min-h-64 rounded-2xl border border-border bg-card p-5 sm:p-6 flex flex-col items-center justify-center gap-4"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
      >
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">질문</p>
        <p className="text-center text-lg font-medium leading-relaxed px-2">{card.question}</p>

        {/* 힌트 */}
        {(phase === 'hint' || phase === 'answer' || phase === 'result') && (
          <div className="w-full mt-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5" />
              힌트
            </p>
            <p className="text-sm text-amber-800 dark:text-amber-300">{contextHint}</p>
            <p className="text-sm font-mono text-amber-700 dark:text-amber-400 tracking-wider">{chosungHint}</p>
          </div>
        )}

        {/* 정답 */}
        {(phase === 'answer' || phase === 'result') && (
          <div className="w-full mt-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2">정답</p>
            <p className="text-base leading-relaxed whitespace-pre-wrap text-emerald-900 dark:text-emerald-200">{card.answer}</p>
          </div>
        )}
      </div>

      {/* 액션 버튼 */}
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
            onClick={showAnswer}
          >
            <Eye className="w-5 h-5" />
            바로 답 확인
          </button>
        </div>
      )}

      {phase === 'hint' && (
        <button
          type="button"
          className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground font-semibold text-base transition-all flex items-center justify-center gap-2 animate-in fade-in duration-200"
          onClick={showAnswer}
        >
          <Eye className="w-5 h-5" />
          답 확인하기
        </button>
      )}

      {phase === 'answer' && (
        <button
          type="button"
          className="w-full h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-base transition-all animate-in fade-in duration-200"
          onClick={() => setPhase('result')}
        >
          확인 완료
        </button>
      )}

      {/* 타이머 바 (result 단계) */}
      {phase === 'result' && (
        <AdvanceTimerBar
          isCorrect={!hintUsed}
          delayMs={hintUsed ? AUTO_ADVANCE_WRONG_MS : AUTO_ADVANCE_CORRECT_MS}
          onComplete={commitAnswer}
        />
      )}

      {/* 키보드 힌트 */}
      <div className="hidden sm:flex justify-center gap-4 text-xs text-muted-foreground">
        {phase === 'question' && (
          <>
            <span><kbd className="px-1.5 py-0.5 rounded border border-border text-[10px] font-mono">H</kbd> 힌트</span>
            <span><kbd className="px-1.5 py-0.5 rounded border border-border text-[10px] font-mono">Space</kbd> 바로 답 확인</span>
          </>
        )}
        {phase === 'hint' && (
          <span><kbd className="px-1.5 py-0.5 rounded border border-border text-[10px] font-mono">Space</kbd> 답 확인</span>
        )}
        {(phase === 'answer' || phase === 'result') && (
          <span><kbd className="px-1.5 py-0.5 rounded border border-border text-[10px] font-mono">Space</kbd> 다음</span>
        )}
      </div>
    </div>
  );
}

// ─── 메인 FlashcardScene ────────────────────────────────────────────────────────

export function FlashcardScene({
  card,
  onAnswer,
  currentIndex,
  total,
  results,
}: FlashcardSceneProps) {
  const isOX = card.quizType === 'ox';

  return (
    <div className="flex flex-col gap-5">
      {/* 진행 바 */}
      <div className="flex items-center justify-between">
        <ProgressDots total={total} currentIndex={currentIndex} results={results} />
        <Badge variant="outline">박스 {card.box}</Badge>
      </div>

      <p className="text-sm text-muted-foreground font-medium">
        {currentIndex + 1} / {total}
      </p>

      {/* 카드 유형별 분기 */}
      {isOX ? (
        <OXCardScene card={card} onAnswer={onAnswer} />
      ) : (
        <GeneralCardScene card={card} onAnswer={onAnswer} />
      )}
    </div>
  );
}
