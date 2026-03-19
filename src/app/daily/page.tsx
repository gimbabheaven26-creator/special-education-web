'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, RotateCcw, ChevronRight, Loader2 } from 'lucide-react';
import { makeSheetCode, getKSTDateRaw } from '@/lib/sheet-code';

// 모듈 로드 시 1회 평가 — 자정 렌더 불일치 방지
const TODAY_RAW = getKSTDateRaw();
const TODAY_SHEET_CODE = makeSheetCode(TODAY_RAW);

interface DailyQuestion {
  id: string;
  type: 'ox' | 'fill_in' | 'descriptive';
  question: string;
  answer: string;
  chapter: string;
  subject: string;
  explanation?: string;
}

type Step = 1 | 2 | 3;

const OX_COUNT = 10;
const FILL_IN_COUNT = 5;
const DESCRIPTIVE_COUNT = 3;

// 날짜 seed 기반 셔플
function dateSeed(): number {
  const d = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date());
  return d.split('-').reduce((acc, p) => acc * 100 + Number(p), 0);
}

function seededRandom(seed: number, index: number): number {
  const s = (seed * 1664525 + 1013904223 + index * 22695477) & 0x7fffffff;
  return s / 0x7fffffff;
}

function seededSample<T>(arr: T[], n: number, seed: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed, i) * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(n, copy.length));
}

// 틀린 챕터를 우선으로 채우되 부족하면 랜덤으로 채움
function selectWithWrongPriority(
  pool: DailyQuestion[],
  wrongChapters: string[],
  n: number,
  seed: number,
): DailyQuestion[] {
  const wrongFirst = pool.filter((q) => wrongChapters.includes(q.chapter));
  const rest = pool.filter((q) => !wrongChapters.includes(q.chapter));
  const selected = seededSample(wrongFirst, n, seed);
  if (selected.length < n) {
    selected.push(...seededSample(rest, n - selected.length, seed + 99));
  }
  return selected.slice(0, n);
}

// ─── 단일 OX 질문 컴포넌트 ───
function OXQuestion({
  question,
  index,
  userAnswer,
  onAnswer,
  revealed,
  correctAnswer,
}: {
  question: DailyQuestion;
  index: number;
  userAnswer: 'O' | 'X' | null;
  onAnswer: (id: string, answer: 'O' | 'X') => void;
  revealed: boolean;
  correctAnswer: string;
}) {
  const isCorrect = revealed && userAnswer !== null && userAnswer === correctAnswer.toUpperCase();

  return (
    <div className={`p-4 rounded-xl border transition-colors ${
      revealed
        ? isCorrect ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20' : 'border-red-400/50 bg-red-50/50 dark:bg-red-950/20'
        : 'border-border bg-card'
    }`}>
      <p className="text-sm text-foreground leading-relaxed mb-3">
        <span className="font-medium text-muted-foreground mr-1">{index}.</span>
        {question.question}
      </p>
      <div className="flex gap-2">
        {(['O', 'X'] as const).map((opt) => (
          <button
            key={opt}
            disabled={revealed}
            onClick={() => onAnswer(question.id, opt)}
            className={`flex-1 py-2 rounded-lg text-lg font-bold border transition-colors ${
              userAnswer === opt
                ? revealed
                  ? isCorrect ? 'border-green-500 bg-green-500 text-white' : 'border-red-400 bg-red-400 text-white'
                  : 'border-primary bg-primary text-primary-foreground'
                : revealed && opt === correctAnswer.toUpperCase()
                ? 'border-green-500 bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400'
                : 'border-border bg-background hover:bg-muted text-foreground'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {revealed && (
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
          정답: <span className="font-medium text-foreground">{correctAnswer.toUpperCase()}</span>
          {question.explanation ? ` — ${question.explanation}` : ''}
        </p>
      )}
    </div>
  );
}

// ─── 단답/서술 질문 컴포넌트 ───
function TextQuestion({
  question,
  index,
  revealed,
}: {
  question: DailyQuestion;
  index: number;
  revealed: boolean;
}) {
  return (
    <div className="p-4 rounded-xl border border-border bg-card">
      <p className="text-sm text-foreground leading-relaxed mb-2">
        <span className="font-medium text-muted-foreground mr-1">{index}.</span>
        {question.question}
      </p>
      {revealed && (
        <div className="mt-3 pt-3 border-t border-border/60">
          <p className="text-xs text-muted-foreground mb-1">정답</p>
          <p className="text-sm text-foreground leading-relaxed">{question.answer}</p>
        </div>
      )}
    </div>
  );
}

// ─── 메인 페이지 ───
export default function DailyPage() {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // 각 step 문제 세트
  const [oxQuestions, setOxQuestions] = useState<DailyQuestion[]>([]);
  const [fillInQuestions, setFillInQuestions] = useState<DailyQuestion[]>([]);
  const [descriptiveQuestions, setDescriptiveQuestions] = useState<DailyQuestion[]>([]);

  // 답변 상태
  const [oxAnswers, setOxAnswers] = useState<Record<string, 'O' | 'X'>>({});
  const [revealed, setRevealed] = useState(false);

  // 틀린 챕터
  const [wrongChaptersStep1, setWrongChaptersStep1] = useState<string[]>([]);
  const [wrongChaptersStep2] = useState<string[]>([]);

  // Step 완료 여부
  const [step1Done, setStep1Done] = useState(false);
  const [step2Done, setStep2Done] = useState(false);
  const [step3Done, setStep3Done] = useState(false);

  // ─── 문제 로드 ───
  const loadQuestions = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/daily-questions');
      if (!res.ok) throw new Error('fetch failed');
      const json = await res.json() as {
        ox: DailyQuestion[];
        fillIn: DailyQuestion[];
        descriptive: DailyQuestion[];
      };
      setOxQuestions(json.ox);
      setFillInQuestions(json.fillIn);
      setDescriptiveQuestions(json.descriptive);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // ─── Step 1 완료 처리 ───
  const finishStep1 = () => {
    const wrong = oxQuestions
      .filter((q) => {
        const ans = oxAnswers[q.id];
        return ans && ans !== q.answer.toUpperCase();
      })
      .map((q) => q.chapter);
    setWrongChaptersStep1(wrong);
    setStep1Done(true);
    setRevealed(true);
  };

  const proceedToStep2 = useCallback((useWrongOnly: boolean) => {
    const seed = dateSeed();
    if (useWrongOnly && wrongChaptersStep1.length > 0) {
      // 틀린 챕터에서 추가 OX 풀기 — 현재 세트 재사용 (챕터 필터)
      const wrongSet = oxQuestions.filter((q) => wrongChaptersStep1.includes(q.chapter));
      const extra = seededSample(wrongSet, OX_COUNT, seed + 500);
      setOxQuestions(extra.length > 0 ? extra : oxQuestions);
      setOxAnswers({});
      setRevealed(false);
      setStep1Done(false);
    } else {
      // Step 2로 이동
      const allFill = fillInQuestions.length > 0 ? fillInQuestions : [];
      const selected = selectWithWrongPriority(allFill, wrongChaptersStep1, FILL_IN_COUNT, seed + 200);
      setFillInQuestions(selected);
      setStep(2);
      setRevealed(false);
    }
  }, [wrongChaptersStep1, oxQuestions, fillInQuestions]);

  const finishStep2 = () => {
    // 단답형에서 틀린 챕터는 사용자가 직접 체크 (셀프 채점)
    setStep2Done(true);
    setRevealed(true);
  };

  const proceedToStep3 = useCallback((retry: boolean) => {
    const seed = dateSeed();
    if (retry) {
      // 같은 단답 문제 다시
      setRevealed(false);
      setStep2Done(false);
    } else {
      // Step 3으로
      const selected = selectWithWrongPriority(descriptiveQuestions, [...wrongChaptersStep1, ...wrongChaptersStep2], DESCRIPTIVE_COUNT, seed + 300);
      setDescriptiveQuestions(selected);
      setStep(3);
      setRevealed(false);
    }
  }, [wrongChaptersStep1, wrongChaptersStep2, descriptiveQuestions]);

  const finishStep3 = () => {
    setStep3Done(true);
    setRevealed(true);
  };

  // ─── 로딩/에러 ───
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-4">
        <p className="text-sm text-muted-foreground">문제를 불러오지 못했습니다.</p>
        <button onClick={loadQuestions} className="text-sm text-primary hover:underline">
          다시 시도
        </button>
      </div>
    );
  }

  // ─── 완료 화면 ───
  if (step3Done) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">오늘의 학습 완료!</h1>
          <p className="text-sm text-muted-foreground mt-2">
            OX {OX_COUNT} + 단답 {FILL_IN_COUNT} + 서술 {DESCRIPTIVE_COUNT} — 최소 경로 달성
          </p>
        </div>
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <Link
            href="/"
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium text-center hover:bg-primary/90 transition-colors"
          >
            홈으로 돌아가기
          </Link>
          <Link
            href="/wrong-notes"
            className="w-full py-3 rounded-xl border border-border text-sm font-medium text-center hover:bg-muted transition-colors"
          >
            오답노트 확인하기
          </Link>
        </div>
      </div>
    );
  }

  // ─── STEP 헤더 ───
  const stepLabel = step === 1 ? 'STEP 1 — OX 퀴즈' : step === 2 ? 'STEP 2 — 단답형' : 'STEP 3 — 서술형';
  const stepTotal = OX_COUNT + FILL_IN_COUNT + DESCRIPTIVE_COUNT;

  const allOxAnswered = oxQuestions.length > 0 && oxQuestions.every((q) => oxAnswers[q.id]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      {/* 고유번호 배너 */}
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
        <span>오늘의 학습</span>
        <span className="font-mono bg-muted px-2 py-0.5 rounded">{TODAY_SHEET_CODE}</span>
      </div>

      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground">{stepLabel}</h1>
          <p className="text-xs text-muted-foreground">
            {step === 1 ? `${OX_COUNT}문제` : step === 2 ? `${FILL_IN_COUNT}문제` : `${DESCRIPTIVE_COUNT}문제`}
            {' / 오늘 총 '}
            {stepTotal}문제
          </p>
        </div>
        {/* 진행 표시 */}
        <div className="flex items-center gap-1">
          {([1, 2, 3] as Step[]).map((s) => (
            <div
              key={s}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                s < step ? 'bg-green-500 text-white' : s === step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              {s < step ? '✓' : s}
            </div>
          ))}
        </div>
      </div>

      {/* ── STEP 1: OX ── */}
      {step === 1 && (
        <>
          <div className="space-y-3">
            {oxQuestions.map((q, i) => (
              <OXQuestion
                key={q.id}
                question={q}
                index={i + 1}
                userAnswer={oxAnswers[q.id] ?? null}
                onAnswer={(id, ans) => setOxAnswers((prev) => ({ ...prev, [id]: ans }))}
                revealed={revealed}
                correctAnswer={q.answer}
              />
            ))}
          </div>

          {!step1Done && (
            <button
              onClick={finishStep1}
              disabled={!allOxAnswered}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              채점하기
            </button>
          )}

          {step1Done && (
            <div className="space-y-3">
              {/* 결과 요약 */}
              <div className="p-4 rounded-xl border border-border bg-card">
                <p className="text-sm font-medium text-foreground">
                  정답: {oxQuestions.filter((q) => oxAnswers[q.id]?.toUpperCase() === String(q.answer).toUpperCase()).length} / {oxQuestions.length}
                </p>
                {wrongChaptersStep1.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    취약 챕터: {Array.from(new Set(wrongChaptersStep1)).join(', ')}
                  </p>
                )}
              </div>

              {/* 분기 버튼 */}
              {wrongChaptersStep1.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => proceedToStep2(true)}
                    className="py-3 px-2 rounded-xl border border-border bg-card text-xs font-medium text-foreground hover:bg-muted transition-colors text-center"
                  >
                    틀린 영역 OX 다시 풀기
                    <RotateCcw className="h-3.5 w-3.5 mx-auto mt-1" />
                  </button>
                  <button
                    onClick={() => proceedToStep2(false)}
                    className="py-3 px-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors text-center"
                  >
                    단답형으로 넘어가기
                    <ArrowRight className="h-3.5 w-3.5 mx-auto mt-1" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => proceedToStep2(false)}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  단답형으로 넘어가기 <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* ── STEP 2: 단답형 ── */}
      {step === 2 && (
        <>
          <p className="text-xs text-muted-foreground px-1">
            문제를 읽고 답을 생각해보세요. 답안 확인 후 자기 채점합니다.
          </p>
          <div className="space-y-3">
            {fillInQuestions.map((q, i) => (
              <TextQuestion key={q.id} question={q} index={i + 1} revealed={revealed} />
            ))}
          </div>

          {!step2Done && (
            <button
              onClick={finishStep2}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              답안 확인
            </button>
          )}

          {step2Done && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => proceedToStep3(true)}
                  className="py-3 px-2 rounded-xl border border-border bg-card text-xs font-medium text-foreground hover:bg-muted transition-colors text-center"
                >
                  단답형 한번 더
                  <RotateCcw className="h-3.5 w-3.5 mx-auto mt-1" />
                </button>
                <button
                  onClick={() => proceedToStep3(false)}
                  className="py-3 px-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors text-center"
                >
                  서술형으로 넘어가기
                  <ArrowRight className="h-3.5 w-3.5 mx-auto mt-1" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── STEP 3: 서술형 ── */}
      {step === 3 && (
        <>
          <p className="text-xs text-muted-foreground px-1">
            각 문항에 핵심 키워드를 포함하여 서술해보세요.
          </p>
          <div className="space-y-3">
            {descriptiveQuestions.map((q, i) => (
              <TextQuestion key={q.id} question={q} index={i + 1} revealed={revealed} />
            ))}
          </div>

          {!step3Done && !revealed && (
            <button
              onClick={() => setRevealed(true)}
              className="w-full py-3 rounded-xl border border-border bg-card text-sm font-medium hover:bg-muted transition-colors"
            >
              정답 키워드 확인
            </button>
          )}

          {revealed && !step3Done && (
            <button
              onClick={finishStep3}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              오늘 학습 완료 <CheckCircle2 className="h-4 w-4" />
            </button>
          )}
        </>
      )}

      {/* 하단 네비 */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          ← 홈으로
        </Link>
        <Link href="/wrong-notes" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
          오답노트 <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
