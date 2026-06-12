'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, CalendarPlus, CheckCircle2, ClipboardCheck } from 'lucide-react';
import {
  buildReviewReservation,
  evaluatePracticeAnswer,
  type PracticeFeedback,
  type ReviewReservation,
  type TermLens,
} from '@/lib/ieumjin';

function levelLabel(feedback: PracticeFeedback): string {
  if (feedback.level === 'ready') return '답안 골격이 잡혔습니다';
  if (feedback.level === 'partial') return '핵심 일부가 보입니다';
  return '근거부터 다시 세워야 합니다';
}

function saveReservation(storageKey: string, reservation: ReviewReservation) {
  const raw = window.localStorage.getItem(storageKey);
  const existing = raw ? JSON.parse(raw) : [];
  const reservations = Array.isArray(existing) ? existing : [];
  const nextReservations = [
    ...reservations.filter((item) => item?.id !== reservation.id),
    reservation,
  ];

  window.localStorage.setItem(storageKey, JSON.stringify(nextReservations));
}

function FeedbackPanel({ feedback }: { feedback: PracticeFeedback }) {
  return (
    <div className="mt-4 border border-stone-300 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-lg font-black text-stone-950">
          채점 결과 {feedback.score}/{feedback.maxScore}
        </p>
        <span className="rounded-sm bg-cyan-100 px-2 py-1 text-xs font-black text-cyan-800">
          {levelLabel(feedback)}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs font-black text-stone-500">잡은 근거</p>
          <ul className="mt-2 space-y-2">
            {feedback.matchedItems.length > 0 ? (
              feedback.matchedItems.map((item) => (
                <li key={item.id} className="flex gap-2 text-sm font-semibold text-stone-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-700" />
                  <span>{item.feedback}</span>
                </li>
              ))
            ) : (
              <li className="text-sm font-semibold text-stone-500">아직 rubric에 걸린 근거가 없습니다.</li>
            )}
          </ul>
        </div>

        <div>
          <p className="text-xs font-black text-stone-500">보완할 기준</p>
          <ul className="mt-2 space-y-2">
            {feedback.missingItems.length > 0 ? (
              feedback.missingItems.map((item) => (
                <li key={item.id} className="text-sm font-semibold leading-relaxed text-stone-700">
                  <span className="font-black text-stone-950">{item.label}</span>
                  {' - '}
                  {item.repairPrompt}
                </li>
              ))
            ) : (
              <li className="text-sm font-semibold text-stone-700">바로 동형문제로 넘어가도 됩니다.</li>
            )}
          </ul>
        </div>
      </div>

      <p className="mt-4 border-t border-stone-200 pt-3 text-sm font-black text-stone-950">
        다음 행동: {feedback.nextAction}
      </p>
    </div>
  );
}

export default function TermPracticeClient({ lens }: { lens: TermLens }) {
  const { practiceLoop } = lens;
  const [examAnswer, setExamAnswer] = useState('');
  const [analogAnswer, setAnalogAnswer] = useState('');
  const [examFeedback, setExamFeedback] = useState<PracticeFeedback | null>(null);
  const [analogFeedback, setAnalogFeedback] = useState<PracticeFeedback | null>(null);
  const [reservation, setReservation] = useState<ReviewReservation | null>(null);

  const canSubmitExam = examAnswer.trim().length >= 10;
  const canSubmitAnalog = Boolean(examFeedback) && analogAnswer.trim().length >= 10;
  const bestFeedback = analogFeedback ?? examFeedback;

  const reviewButtons = useMemo(
    () => practiceLoop.reviewDelays,
    [practiceLoop.reviewDelays],
  );

  return (
    <section id="practice-loop" className="scroll-mt-44 border border-stone-900 bg-[#101214] p-5 text-stone-50">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-4">
        <div>
          <p className="text-xs font-black text-cyan-200">FBA 20분 실전 이음</p>
          <h2 className="mt-2 text-2xl font-black">답안 쓰고 바로 다시 보기</h2>
        </div>
        <span className="rounded-sm border border-cyan-300/40 px-2 py-1 text-xs font-black text-cyan-100">
          {practiceLoop.examQuestion.sourceLabel}
        </span>
      </div>

      <div className="mt-5 grid gap-4">
        <div className="bg-stone-950 p-4">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-amber-200" />
            <h3 className="text-lg font-black">{practiceLoop.examQuestion.title}</h3>
          </div>
          <p className="mt-3 text-sm font-semibold leading-relaxed text-stone-300">
            {practiceLoop.examQuestion.prompt}
          </p>

          <label htmlFor="ieumjin-exam-answer" className="mt-4 block text-sm font-black text-stone-100">
            기출 답안
          </label>
          <textarea
            id="ieumjin-exam-answer"
            value={examAnswer}
            onChange={(event) => setExamAnswer(event.target.value)}
            className="mt-2 min-h-36 w-full resize-y border border-stone-700 bg-stone-900 p-3 text-sm font-semibold leading-relaxed text-stone-50 outline-none focus:border-cyan-300"
            placeholder="선행사건, 행동, 후속결과, 기능 가설, 대체행동을 포함해 답안을 써 보세요."
          />
          <button
            type="button"
            disabled={!canSubmitExam}
            onClick={() =>
              setExamFeedback(
                evaluatePracticeAnswer({
                  answer: examAnswer,
                  question: practiceLoop.examQuestion,
                }),
              )
            }
            className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-sm bg-cyan-300 px-4 text-sm font-black text-stone-950 disabled:cursor-not-allowed disabled:bg-stone-700 disabled:text-stone-400"
          >
            채점 받기
            <ArrowRight className="h-4 w-4" />
          </button>

          {examFeedback && <FeedbackPanel feedback={examFeedback} />}
        </div>

        {examFeedback && (
          <div className="bg-stone-950 p-4">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-amber-200" />
              <h3 className="text-lg font-black">{practiceLoop.analogQuestion.title}</h3>
            </div>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-stone-300">
              {practiceLoop.analogQuestion.prompt}
            </p>

            <label htmlFor="ieumjin-analog-answer" className="mt-4 block text-sm font-black text-stone-100">
              동형 답안
            </label>
            <textarea
              id="ieumjin-analog-answer"
              value={analogAnswer}
              onChange={(event) => setAnalogAnswer(event.target.value)}
              className="mt-2 min-h-36 w-full resize-y border border-stone-700 bg-stone-900 p-3 text-sm font-semibold leading-relaxed text-stone-50 outline-none focus:border-cyan-300"
              placeholder="기능 가설, 대체행동 교수, 선행사건 중재를 한 답안으로 이어 보세요."
            />
            <button
              type="button"
              disabled={!canSubmitAnalog}
              onClick={() =>
                setAnalogFeedback(
                  evaluatePracticeAnswer({
                    answer: analogAnswer,
                    question: practiceLoop.analogQuestion,
                  }),
                )
              }
              className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-sm bg-amber-200 px-4 text-sm font-black text-stone-950 disabled:cursor-not-allowed disabled:bg-stone-700 disabled:text-stone-400"
            >
              동형 채점
              <ArrowRight className="h-4 w-4" />
            </button>

            {analogFeedback && <FeedbackPanel feedback={analogFeedback} />}
          </div>
        )}

        {bestFeedback && (
          <div className="border border-stone-800 bg-stone-950 p-4">
            <div className="flex items-center gap-2">
              <CalendarPlus className="h-5 w-5 text-cyan-200" />
              <h3 className="text-lg font-black">복습 예약</h3>
            </div>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-stone-400">
              오늘 쓴 답안을 다시 볼 간격을 고릅니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {reviewButtons.map((delay) => (
                <button
                  key={delay.days}
                  type="button"
                  onClick={() => {
                    const nextReservation = buildReviewReservation({
                      termId: lens.id,
                      promptId: practiceLoop.analogQuestion.id,
                      delayDays: delay.days,
                      score: bestFeedback.score,
                      maxScore: bestFeedback.maxScore,
                    });
                    saveReservation(practiceLoop.storageKey, nextReservation);
                    setReservation(nextReservation);
                  }}
                  className="inline-flex min-h-10 items-center gap-2 rounded-sm border border-stone-700 px-3 text-sm font-black text-stone-100 hover:border-cyan-200"
                >
                  {delay.label}
                </button>
              ))}
            </div>
            {reservation && (
              <p className="mt-4 rounded-sm bg-cyan-300 px-3 py-2 text-sm font-black text-stone-950">
                복습 예약 완료: {new Date(reservation.reviewAt).toLocaleDateString('ko-KR')}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
