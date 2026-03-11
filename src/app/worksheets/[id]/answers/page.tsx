'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { WorksheetConfig } from '@/lib/worksheet-utils';
import { loadWorksheet } from '@/lib/worksheet-utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function WorksheetAnswersPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const [worksheet, setWorksheet] = useState<WorksheetConfig | null>(null);

  useEffect(() => {
    const ws = loadWorksheet(id);
    setWorksheet(ws);
  }, [id]);

  if (!worksheet) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 text-center">
        <p className="text-muted-foreground mb-4">
          학습지 정답을 찾을 수 없습니다. 문제지 페이지에서 생성해 주세요.
        </p>
        <Link href="/worksheets">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            문제지 생성으로 돌아가기
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      {/* Back link */}
      <div className="mb-4 print:hidden">
        <Link
          href="/worksheets"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          문제지 생성
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8 border-b border-border pb-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <h1 className="text-xl font-bold text-foreground">정답 및 해설</h1>
        </div>
        <div className="text-sm text-muted-foreground mb-1">{worksheet.topicName}</div>
        <div className="flex gap-2 items-center">
          <span className="text-sm font-medium text-foreground">학습지 {worksheet.id}</span>
          <Badge variant="outline">
            {worksheet.type === 'fill_in'
              ? '기입형 2점'
              : worksheet.type === 'descriptive'
              ? '서술형 4점'
              : '혼합'}
          </Badge>
        </div>
      </div>

      {/* Answers */}
      <div className="space-y-6">
        {worksheet.questions.map((q, idx) => (
          <div
            key={q.id}
            className="border border-border rounded-lg p-4 print:border-foreground/20"
          >
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center text-sm font-bold text-green-700 dark:text-green-400">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                {/* Question */}
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {q.type === 'fill_in' ? '기입형 (2점)' : '서술형 (4점)'}
                  </Badge>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap mb-3">
                  {q.question}
                </p>

                {/* Answer */}
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 mb-2">
                  <p className="text-sm font-semibold text-green-800 dark:text-green-300 mb-1">
                    정답
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-400 whitespace-pre-wrap">
                    {q.answer}
                  </p>
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">
                      해설
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-400 whitespace-pre-wrap">
                      {q.explanation}
                    </p>
                  </div>
                )}

                {/* Source */}
                {q.source && (
                  <p className="mt-2 text-xs text-muted-foreground">출처: {q.source}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Print footer */}
      <div className="hidden print:block mt-8 pt-4 border-t border-foreground/20 text-center text-xs text-foreground/50">
        &#x26A0;&#xFE0F; 용어 검증 필요 | special-education-web
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mt-8 print:hidden">
        <Link href="/worksheets">
          <Button variant="outline" className="min-h-[44px]">
            <ArrowLeft className="h-4 w-4 mr-2" />
            새 문제지 생성
          </Button>
        </Link>
      </div>
    </div>
  );
}
