'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, Eye, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { WorksheetQuestionRow } from '@/lib/db';

interface WorksheetViewClientProps {
  topicName: string;
  questions: WorksheetQuestionRow[];
  qrUrl: string;
}

function QRCode({ url, size = 80 }: { url: string; size?: number }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={qrUrl} alt="QR 코드" width={size} height={size} />;
}

export default function WorksheetViewClient({ topicName, questions, qrUrl }: WorksheetViewClientProps) {
  const [showAnswers, setShowAnswers] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-4 print:hidden">
        <Link
          href="/worksheets"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          문제지 목록
        </Link>
      </div>

      <div className="flex items-start justify-between mb-6 border-b border-border pb-4">
        <div>
          <div className="text-sm text-muted-foreground mb-1 print:text-xs">{topicName}</div>
          <h1 className="text-xl font-bold text-foreground">{topicName} 학습지</h1>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline">{questions.length}문제</Badge>
          </div>
        </div>
        <div className="shrink-0 ml-4 hidden sm:block">
          <QRCode url={qrUrl} size={80} />
          <p className="text-[10px] text-muted-foreground text-center mt-1">정답 QR</p>
        </div>
      </div>

      <div className="space-y-6 print:space-y-4">
        {questions.map((q, idx) => (
          <div key={q.id} className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-sm font-bold text-foreground print:bg-transparent print:border print:border-foreground/30">
              {idx + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  {q.type === 'fill_in' ? '기입형 (2점)' : '서술형 (4점)'}
                </Badge>
              </div>
              <p className="text-base leading-relaxed text-foreground whitespace-pre-wrap print:text-sm">
                {q.question}
              </p>
              {!showAnswers && q.type === 'fill_in' && (
                <div className="mt-3 border-b-2 border-dashed border-foreground/30 w-full max-w-64 h-8" />
              )}
              {!showAnswers && q.type === 'descriptive' && (
                <div className="mt-3 space-y-3">
                  {[1, 2, 3, 4, 5].map((line) => (
                    <div key={line} className="border-b border-dashed border-foreground/20 h-6" />
                  ))}
                </div>
              )}
              {showAnswers && (
                <div className="mt-3 p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                  <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">정답</p>
                  <p className="text-sm text-green-700 dark:text-green-400">{q.answer}</p>
                  {q.explanation && (
                    <>
                      <p className="text-sm font-medium text-green-800 dark:text-green-300 mt-3 mb-1">해설</p>
                      <p className="text-sm text-green-700 dark:text-green-400">{q.explanation}</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="hidden print:block mt-8 pt-4 border-t border-foreground/20 text-center text-xs text-foreground/50">
        &#x26A0;&#xFE0F; 용어 검증 필요 | special-education-web
      </div>

      <div className="flex flex-wrap gap-3 mt-8 print:hidden">
        <Button onClick={() => window.print()} variant="outline" className="min-h-[44px]">
          <Printer className="h-4 w-4 mr-2" />
          출력하기
        </Button>
        <Button onClick={() => setShowAnswers(!showAnswers)} variant="outline" className="min-h-[44px]">
          <Eye className="h-4 w-4 mr-2" />
          {showAnswers ? '정답 숨기기' : '정답보기'}
        </Button>
        <Link href="/worksheets">
          <Button variant="outline" className="min-h-[44px]">
            <RefreshCw className="h-4 w-4 mr-2" />
            다른 문제지
          </Button>
        </Link>
      </div>
    </div>
  );
}
