'use client';

import type { WorksheetConfig } from '@/lib/worksheet-utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Printer,
  RefreshCw,
  PenLine,
} from 'lucide-react';
import { WorksheetSolver } from './WorksheetSolver';

// ─── QR Code ────────────────────────────────────────────────────────────────

function QRCode({ url, size = 80 }: { url: string; size?: number }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={qrUrl} alt="QR 코드" width={size} height={size} />
  );
}

// ─── Print Mode Questions ───────────────────────────────────────────────────

function PrintModeQuestions({
  worksheet,
  showAnswers,
}: {
  worksheet: WorksheetConfig;
  showAnswers: boolean;
}) {
  // Calculate answer lines for descriptive based on descriptive question count (not total)
  const descCount = worksheet.questions.filter((q) => q.type === 'descriptive').length;
  const descLines = descCount <= 3 ? 5 : descCount <= 5 ? 3 : 2;

  return (
    <div className="worksheet-onepage space-y-4 print:space-y-2">
      {worksheet.questions.map((q, idx) => (
        <div
          key={q.id}
          className={`worksheet-question rounded-lg p-3 border border-border ${
            q.type === 'descriptive' ? 'worksheet-descriptive' : 'worksheet-fillin'
          }`}
        >
          <div className="flex items-start gap-2">
            <span className="w-7 h-7 rounded-full bg-foreground/10 flex items-center justify-center text-sm font-bold text-foreground shrink-0 print:bg-transparent print:border print:border-foreground/30">
              {idx + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  {q.type === 'fill_in' ? '기입형 (2점)' : '서술형 (4점)'}
                </Badge>
              </div>
              <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                {q.question}
              </p>

              {q.type === 'fill_in' && !showAnswers && (
                <div className="mt-2 border-b-2 border-dashed border-foreground/30 w-full max-w-64 h-7" />
              )}
              {q.type === 'descriptive' && !showAnswers && (
                <div className="mt-2 space-y-2">
                  {Array.from({ length: descLines }, (_, i) => (
                    <div
                      key={i}
                      className="border-b border-dashed border-foreground/20 h-5"
                    />
                  ))}
                </div>
              )}
              {showAnswers && (
                <div className="mt-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                  <p className="text-xs font-medium text-green-800 dark:text-green-300 mb-0.5">
                    정답
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-400">{q.answer}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Worksheet Preview ──────────────────────────────────────────────────────

export function WorksheetPreview({
  worksheet,
  subjectTitle,
  origin,
  mode,
  onModeChange,
  showPrintAnswers,
  onTogglePrintAnswers,
  solverKey,
  onRetry,
  onNewWorksheet,
}: {
  worksheet: WorksheetConfig;
  subjectTitle: string;
  origin: string;
  mode: 'solve' | 'print';
  onModeChange: (mode: 'solve' | 'print') => void;
  showPrintAnswers: boolean;
  onTogglePrintAnswers: () => void;
  solverKey: number;
  onRetry: () => void;
  onNewWorksheet: () => void;
}) {
  return (
    <div className="worksheet-content">
      {/* Worksheet Header */}
      <div className="flex items-start justify-between mb-6 border-b border-border pb-4">
        <div>
          <div className="text-sm text-muted-foreground mb-1 print:text-xs">
            {subjectTitle} &gt; {worksheet.topicName}
          </div>
          <h2 className="text-xl font-bold text-foreground">
            학습지 {worksheet.id}
          </h2>
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
        <div className="shrink-0 ml-4 print:block hidden print:!block">
          <QRCode
            url={`${origin}/worksheets/${worksheet.id}/answers`}
            size={80}
          />
          <p className="text-[10px] text-muted-foreground text-center mt-1 print:text-[8px]">
            정답 QR
          </p>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6 print:hidden">
        <Button
          variant={mode === 'solve' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onModeChange('solve')}
        >
          <PenLine className="h-4 w-4 mr-1.5" />
          풀기 모드
        </Button>
        <Button
          variant={mode === 'print' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onModeChange('print')}
        >
          <Printer className="h-4 w-4 mr-1.5" />
          출력 모드
        </Button>
      </div>

      {/* Solve Mode */}
      {mode === 'solve' && (
        <div className="print:hidden">
          <WorksheetSolver
            key={solverKey}
            worksheet={worksheet}
            subjectTitle={subjectTitle}
            onRetry={onRetry}
            onNewWorksheet={onNewWorksheet}
          />
        </div>
      )}

      {/* Print Mode */}
      {mode === 'print' && (
        <>
          <PrintModeQuestions
            worksheet={worksheet}
            showAnswers={showPrintAnswers}
          />

          {/* Print footer */}
          <div className="hidden print:block mt-8 pt-4 border-t border-foreground/20 text-center text-xs text-foreground/50">
            special-education-web
          </div>

          {/* Print action buttons */}
          <div className="flex flex-wrap gap-3 mt-8 print:hidden">
            <Button
              onClick={() => window.print()}
              variant="outline"
              className="min-h-[44px]"
            >
              <Printer className="h-4 w-4 mr-2" />
              출력하기
            </Button>
            <Button
              onClick={onTogglePrintAnswers}
              variant="outline"
              className="min-h-[44px]"
            >
              {showPrintAnswers ? '정답 숨기기' : '정답보기'}
            </Button>
            <Button onClick={onNewWorksheet} variant="outline" className="min-h-[44px]">
              <RefreshCw className="h-4 w-4 mr-2" />
              다른 문제지
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
