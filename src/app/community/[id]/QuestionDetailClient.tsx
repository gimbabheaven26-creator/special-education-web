'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ThumbsUp, ThumbsDown, CheckCircle2, ArrowLeft, Flag } from 'lucide-react';
import type { CommunityQuestionDetail, VoteType } from '@/types/community';

interface Props {
  question: CommunityQuestionDetail;
  isOwner: boolean;
  subjects: { slug: string; title: string }[];
}

const TYPE_LABEL: Record<string, string> = {
  multiple: '객관식',
  ox: 'OX',
  fill_in: '빈칸',
  descriptive: '서술형',
};

export default function QuestionDetailClient({ question, isOwner, subjects }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [voteCount, setVoteCount] = useState(question.vote_count);
  const [userVote, setUserVote] = useState<VoteType | null>(question.user_vote);
  const [voteLoading, setVoteLoading] = useState(false);
  const [reported, setReported] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

  async function handleVote(type: VoteType) {
    if (isOwner) return;
    setVoteLoading(true);
    const nextVote: VoteType | null = userVote === type ? null : type;
    try {
      const res = await fetch(`/api/community/${question.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote_type: nextVote }),
      });
      if (res.ok) {
        // 낙관적 업데이트: up 투표만 카운트에 반영
        const getUpDelta = (prev: VoteType | null, next: VoteType | null) => {
          if (prev === 'up' && next === null) return -1;
          if (prev !== 'up' && next === 'up') return 1;
          if (prev === 'up' && next === 'down') return -1;
          return 0;
        };
        setVoteCount((c) => c + getUpDelta(userVote, nextVote));
        setUserVote(nextVote);
      }
    } finally {
      setVoteLoading(false);
    }
  }

  async function handleReport() {
    if (reported || reportLoading || isOwner) return;
    setReportLoading(true);
    try {
      await fetch(`/api/community/${question.id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: '부적절한 문제' }),
      });
      setReported(true);
    } finally {
      setReportLoading(false);
    }
  }

  const isCorrect = revealed && selected === question.correct_answer;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/community"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        커뮤니티로
      </Link>

      {/* 메타 */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-medium">
          {TYPE_LABEL[question.question_type] ?? question.question_type}
        </span>
        {question.status === 'official' && (
          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium">
            <CheckCircle2 className="h-3 w-3" />
            공식 채택
          </span>
        )}
        <span className="text-xs text-muted-foreground">
          {question.author_display_name || '익명'} ·{' '}
          {subjects.find((s) => s.slug === question.subject_id)?.title ?? question.subject_id}
        </span>
      </div>

      {/* 문제 */}
      <div className="rounded-xl border bg-card p-5 mb-4">
        <p className="font-medium whitespace-pre-wrap">{question.question_text}</p>
      </div>

      {/* 객관식 선택지 */}
      {question.question_type === 'multiple' && question.options && (
        <div className="space-y-2 mb-4">
          {question.options.map((opt, i) => {
            const val = String(i + 1);
            const isRight = revealed && val === question.correct_answer;
            const isWrong = revealed && selected === val && !isRight;
            return (
              <button
                key={i}
                onClick={() => {
                  setSelected(val);
                  setRevealed(false);
                }}
                disabled={revealed}
                className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                  isRight
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : isWrong
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : selected === val
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-muted'
                }`}
              >
                {i + 1}. {opt}
              </button>
            );
          })}
        </div>
      )}

      {/* OX 선택 */}
      {question.question_type === 'ox' && (
        <div className="flex gap-3 mb-4">
          {['O', 'X'].map((v) => {
            const isRight = revealed && v === question.correct_answer;
            const isWrong = revealed && selected === v && !isRight;
            return (
              <button
                key={v}
                onClick={() => {
                  setSelected(v);
                  setRevealed(false);
                }}
                disabled={revealed}
                className={`flex-1 py-4 rounded-xl border text-2xl font-bold transition-colors ${
                  isRight
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700'
                    : isWrong
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700'
                    : selected === v
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-muted'
                }`}
              >
                {v}
              </button>
            );
          })}
        </div>
      )}

      {/* 정답 확인 버튼 */}
      {(question.question_type === 'multiple' || question.question_type === 'ox') &&
        selected &&
        !revealed && (
          <button
            onClick={() => setRevealed(true)}
            className="w-full py-2 mb-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm"
          >
            정답 확인
          </button>
        )}

      {/* 정답/해설 */}
      {(revealed ||
        question.question_type === 'fill_in' ||
        question.question_type === 'descriptive') && (
        <div
          className={`rounded-xl border p-4 mb-4 ${
            revealed && isCorrect
              ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
              : revealed
              ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
              : 'bg-muted/30'
          }`}
        >
          {revealed && (
            <p
              className={`font-bold mb-1 ${
                isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
              }`}
            >
              {isCorrect ? '정답입니다!' : '오답입니다.'}
            </p>
          )}
          <p className="text-sm">
            <span className="font-medium">정답: </span>
            {question.correct_answer}
          </p>
          {question.explanation && (
            <p className="text-sm text-muted-foreground mt-1">
              <span className="font-medium text-foreground">해설: </span>
              {question.explanation}
            </p>
          )}
        </div>
      )}

      {/* 투표 */}
      <div className="flex items-center gap-3 pt-4 border-t">
        <p className="text-sm text-muted-foreground flex-1">
          이 문제가 도움이 됐나요?
          {isOwner && (
            <span className="ml-1 text-xs">(본인 문제는 투표할 수 없습니다)</span>
          )}
        </p>
        <button
          onClick={() => handleVote('up')}
          disabled={voteLoading || isOwner}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-colors disabled:opacity-50 ${
            userVote === 'up'
              ? 'bg-primary/10 border-primary text-primary'
              : 'hover:bg-muted'
          }`}
        >
          <ThumbsUp className="h-4 w-4" />
          {voteCount}
        </button>
        <button
          onClick={() => handleVote('down')}
          disabled={voteLoading || isOwner}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-colors disabled:opacity-50 ${
            userVote === 'down'
              ? 'bg-destructive/10 border-destructive text-destructive'
              : 'hover:bg-muted'
          }`}
        >
          <ThumbsDown className="h-4 w-4" />
        </button>
        {!isOwner && (
          <button
            onClick={handleReport}
            disabled={reported || reportLoading}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs text-muted-foreground hover:text-red-500 hover:border-red-300 transition-colors disabled:opacity-50"
          >
            <Flag className="h-3.5 w-3.5" />
            {reported ? '신고됨' : '신고'}
          </button>
        )}
      </div>
    </div>
  );
}
