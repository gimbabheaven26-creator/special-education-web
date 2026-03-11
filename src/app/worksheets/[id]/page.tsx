'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { WorksheetConfig } from '@/data/worksheets/types';
import { loadWorksheet } from '@/lib/worksheet-utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, Eye, RefreshCw, ArrowLeft } from 'lucide-react';

function QRCode({ url, size = 80 }: { url: string; size?: number }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={qrUrl} alt="QR 코드" width={size} height={size} />
  );
}

export default function WorksheetViewPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const [worksheet, setWorksheet] = useState<WorksheetConfig | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    const ws = loadWorksheet(id);
    setWorksheet(ws);
    setOrigin(window.location.origin);
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (!worksheet) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 text-center">
        <p className="text-muted-foreground mb-4">
          학습지를 찾을 수 없습니다. 문제지 페이지에서 생성해 주세요.
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
          문제지 목록
        </Link>
      </div>

      {/* Worksheet Header */}
      <div className="flex items-start justify-between mb-6 border-b border-border pb-4">
        <div>
          <div className="text-sm text-muted-foreground mb-1 print:text-xs">
            {worksheet.topicName}
          </div>
          <h1 className="text-xl font-bold text-foreground">학습지 {worksheet.id}</h1>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline">
              {worksheet.type === 'fill_in'
                ? '기입형 2점'
                : worksheet.type === 'descriptive'
                ? '서술형 4점'
                : '혼합'}
            </Badge>
            <Badge variant="outline">{worksheet.questionCount}문제</Badge>
          </div>
        </div>
        <div className="shrink-0 ml-4">
          <QRCode
            url={`${origin}/worksheets/${worksheet.id}/answers`}
            size={80}
          />
          <p className="text-[10px] text-muted-foreground text-center mt-1">정답 QR</p>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6 print:space-y-4">
        {worksheet.questions.map((q, idx) => (
          <div
            key={q.id}
            className={`worksheet-question ${
              q.type === 'descriptive' ? 'worksheet-descriptive' : 'worksheet-fillin'
            }`}
          >
            <div className="flex items-start gap-3">
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

                {q.type === 'fill_in' && !showAnswers && (
                  <div className="mt-3 border-b-2 border-dashed border-foreground/30 w-64 h-8" />
                )}
                {q.type === 'descriptive' && !showAnswers && (
                  <div className="mt-3 space-y-3">
                    {[1, 2, 3, 4, 5].map((line) => (
                      <div
                        key={line}
                        className="border-b border-dashed border-foreground/20 h-6"
                      />
                    ))}
                  </div>
                )}

                {showAnswers && (
                  <div className="mt-3 p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                    <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">
                      정답
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-400">{q.answer}</p>
                    {q.explanation && (
                      <>
                        <p className="text-sm font-medium text-green-800 dark:text-green-300 mt-3 mb-1">
                          해설
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-400">
                          {q.explanation}
                        </p>
                      </>
                    )}
                  </div>
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

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mt-8 print:hidden">
        <Button onClick={handlePrint} variant="outline">
          <Printer className="h-4 w-4 mr-2" />
          출력하기
        </Button>
        <Button onClick={() => setShowAnswers(!showAnswers)} variant="outline">
          <Eye className="h-4 w-4 mr-2" />
          {showAnswers ? '정답 숨기기' : '정답보기'}
        </Button>
        <Link href="/worksheets">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            다른 문제지
          </Button>
        </Link>
      </div>
    </div>
  );
}
