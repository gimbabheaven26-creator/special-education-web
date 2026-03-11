'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { getSubjects, getWorksheetTopics, getAllWorksheetTopics } from '@/lib/db';
import type { WorksheetTopicRow } from '@/lib/db';
import type { Subject } from '@/types/content';
import type { WorksheetConfig } from '@/lib/worksheet-utils';
import { buildWorksheet, saveWorksheet } from '@/lib/worksheet-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Printer,
  RefreshCw,
  AlertTriangle,
  PenLine,
  Settings2,
} from 'lucide-react';
import { WorksheetSolver } from './WorksheetSolver';

// ─── Types ──────────────────────────────────────────────────────────────────

type Difficulty = 'easy' | 'normal' | 'hard' | 'mixed';
type QuestionCountOption = 5 | 10 | 15 | 20;

const QUESTION_COUNT_OPTIONS: ReadonlyArray<QuestionCountOption> = [5, 10, 15, 20];

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: '쉬움',
  normal: '보통',
  hard: '어려움',
  mixed: '혼합',
};

const DIFFICULTY_MAP: Record<Difficulty, ReadonlyArray<1 | 2 | 3> | null> = {
  easy: [1],
  normal: [2],
  hard: [3],
  mixed: null,
};

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
  return (
    <div className="space-y-6 print:space-y-4">
      {worksheet.questions.map((q, idx) => (
        <div
          key={q.id}
          className={`worksheet-question rounded-lg p-4 border border-border ${
            q.type === 'descriptive' ? 'worksheet-descriptive' : 'worksheet-fillin'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <span className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-sm font-bold text-foreground print:bg-transparent print:border print:border-foreground/30">
                {idx + 1}
              </span>
            </div>
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
                <div className="mt-3 border-b-2 border-dashed border-foreground/30 w-full max-w-64 h-8" />
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
  );
}

// ─── Config Step ────────────────────────────────────────────────────────────

function ConfigStep({
  questionCount,
  onQuestionCountChange,
  difficulty,
  onDifficultyChange,
}: {
  questionCount: QuestionCountOption;
  onQuestionCountChange: (count: QuestionCountOption) => void;
  difficulty: Difficulty;
  onDifficultyChange: (d: Difficulty) => void;
}) {
  return (
    <Card className="mb-6 print:hidden border-dashed">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center gap-2 mb-4">
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">문제 설정</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Question count */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              문제 수
            </label>
            <div className="flex gap-2">
              {QUESTION_COUNT_OPTIONS.map((count) => (
                <button
                  key={count}
                  onClick={() => onQuestionCountChange(count)}
                  className={`flex-1 h-11 rounded-lg text-sm font-medium transition-colors border ${
                    questionCount === count
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground border-border hover:bg-muted'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
          {/* Difficulty */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              난이도
            </label>
            <div className="flex gap-2">
              {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => onDifficultyChange(d)}
                  className={`flex-1 h-11 rounded-lg text-sm font-medium transition-colors border ${
                    difficulty === d
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground border-border hover:bg-muted'
                  }`}
                >
                  {DIFFICULTY_LABELS[d]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Apply Config to Worksheet ──────────────────────────────────────────────

function applyConfig(
  ws: WorksheetConfig,
  questionCount: QuestionCountOption,
  difficulty: Difficulty,
): WorksheetConfig {
  const allowedDifficulties = DIFFICULTY_MAP[difficulty];

  const filtered = allowedDifficulties
    ? ws.questions.filter((q) =>
        allowedDifficulties.includes(q.difficulty),
      )
    : ws.questions;

  const sliced = filtered.slice(0, questionCount);

  if (sliced.length === 0) return ws;

  return {
    ...ws,
    questions: sliced,
    questionCount: sliced.length,
  };
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function WorksheetsPage() {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedType, setSelectedType] = useState<'fill_in' | 'descriptive' | 'mixed'>(
    'fill_in',
  );
  const [worksheet, setWorksheet] = useState<WorksheetConfig | null>(null);
  const [noQuestionsError, setNoQuestionsError] = useState(false);
  const [origin, setOrigin] = useState('');

  // Config preferences
  const [questionCount, setQuestionCount] = useState<QuestionCountOption>(10);
  const [difficulty, setDifficulty] = useState<Difficulty>('mixed');

  // DB data
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsWithTopics, setSubjectsWithTopics] = useState<Set<string>>(new Set());
  const [worksheetTopics, setWorksheetTopics] = useState<WorksheetTopicRow[]>([]);

  // Mode & print state
  const [mode, setMode] = useState<'solve' | 'print'>('solve');
  const [showPrintAnswers, setShowPrintAnswers] = useState(false);

  // Solver key: increment to force remount on new worksheet
  const [solverKey, setSolverKey] = useState(0);

  // Initial data load
  useEffect(() => {
    setOrigin(window.location.origin);

    async function loadInitialData() {
      const [fetchedSubjects, allTopics] = await Promise.all([
        getSubjects(),
        getAllWorksheetTopics(),
      ]);
      setSubjects(fetchedSubjects);
      setSubjectsWithTopics(new Set(allTopics.map((t) => t.subject)));
    }
    loadInitialData();
  }, []);

  const currentSubject = useMemo(
    () => subjects.find((s) => s.slug === selectedSubject),
    [subjects, selectedSubject],
  );

  // Load topics when subject changes
  useEffect(() => {
    if (!selectedSubject) {
      setWorksheetTopics([]);
      return;
    }
    let cancelled = false;
    async function loadTopics() {
      const topics = await getWorksheetTopics(selectedSubject);
      if (!cancelled) {
        setWorksheetTopics(topics);
      }
    }
    loadTopics();
    return () => {
      cancelled = true;
    };
  }, [selectedSubject]);

  const topics = useMemo(() => {
    return worksheetTopics.map((t) => ({ slug: t.id, title: t.name }));
  }, [worksheetTopics]);

  const handleSubjectChange = (slug: string) => {
    setSelectedSubject(slug);
    setSelectedTopic('');
    setWorksheet(null);
  };

  const handleTopicChange = (topicSlug: string) => {
    setSelectedTopic(topicSlug);
    setWorksheet(null);
  };

  const generateWorksheet = useCallback(async () => {
    if (!selectedSubject || !selectedTopic) return;

    const wsTopicMatch = worksheetTopics.find((t) => t.id === selectedTopic);
    const topicName =
      wsTopicMatch?.name ??
      currentSubject?.chapters.find((c) => c.slug === selectedTopic)?.title ??
      selectedTopic;

    const rawWs = await buildWorksheet(
      selectedSubject,
      selectedTopic,
      topicName,
      selectedType,
    );

    if (!rawWs) {
      setNoQuestionsError(true);
      setWorksheet(null);
      return;
    }

    const configuredWs = applyConfig(rawWs, questionCount, difficulty);
    setNoQuestionsError(false);
    saveWorksheet(configuredWs);
    setWorksheet(configuredWs);
    setShowPrintAnswers(false);
    setSolverKey((prev) => prev + 1);
  }, [
    selectedSubject,
    selectedTopic,
    selectedType,
    worksheetTopics,
    currentSubject,
    questionCount,
    difficulty,
  ]);

  const handleRetry = useCallback(() => {
    setSolverKey((prev) => prev + 1);
  }, []);

  const subjectTitle = currentSubject?.title ?? '';

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      {/* Page Title */}
      <div className="mb-8 print:hidden">
        <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <FileText className="h-6 w-6" />
          문제지 생성
        </h1>
        <p className="text-muted-foreground text-sm">
          과목과 영역을 선택하여 학습지를 생성하세요. 온라인에서 직접 풀거나 출력할 수
          있습니다.
        </p>
      </div>

      {/* Selection Bar */}
      <Card className="mb-4 print:hidden">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {/* Subject Select */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                과목 선택
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="w-full h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">-- 과목을 선택하세요 --</option>
                {subjects
                  .filter((s) => subjectsWithTopics.has(s.slug))
                  .map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.title}
                    </option>
                  ))}
                {subjects
                  .filter((s) => !subjectsWithTopics.has(s.slug))
                  .map((s) => (
                    <option key={s.slug} value={s.slug} disabled>
                      {s.title} (준비중)
                    </option>
                  ))}
              </select>
            </div>

            {/* Topic Select */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                영역 선택
              </label>
              <select
                value={selectedTopic}
                onChange={(e) => handleTopicChange(e.target.value)}
                disabled={!selectedSubject}
                className="w-full h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">-- 영역을 선택하세요 --</option>
                {topics.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Select */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                문제 유형
              </label>
              <select
                value={selectedType}
                onChange={(e) =>
                  setSelectedType(
                    e.target.value as 'fill_in' | 'descriptive' | 'mixed',
                  )
                }
                className="w-full h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="fill_in">기입형 2점</option>
                <option value="descriptive">서술형 4점</option>
                <option value="mixed">혼합</option>
              </select>
            </div>
          </div>

          {selectedSubject && worksheetTopics.length === 0 && (
            <p className="text-sm text-amber-600 dark:text-amber-400 mb-3">
              이 과목은 아직 문제 데이터가 준비되지 않았습니다. 곧 추가됩니다.
            </p>
          )}

          <Button
            onClick={generateWorksheet}
            disabled={!selectedSubject || !selectedTopic}
            className="w-full sm:w-auto min-h-[44px]"
          >
            <FileText className="h-4 w-4 mr-2" />
            문제지 생성
          </Button>
        </CardContent>
      </Card>

      {/* Config Step (before generation, after selection) */}
      {selectedSubject && selectedTopic && !worksheet && (
        <ConfigStep
          questionCount={questionCount}
          onQuestionCountChange={setQuestionCount}
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
        />
      )}

      {/* No questions error */}
      {noQuestionsError && (
        <Card className="mb-8 border-amber-300 dark:border-amber-700">
          <CardContent className="pt-6 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
            <p className="text-sm text-amber-700 dark:text-amber-400">
              선택한 영역/유형에 해당하는 문제가 없습니다. 다른 유형이나 영역을
              선택해 주세요.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Generated Worksheet */}
      {worksheet && (
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
              onClick={() => setMode('solve')}
            >
              <PenLine className="h-4 w-4 mr-1.5" />
              풀기 모드
            </Button>
            <Button
              variant={mode === 'print' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('print')}
            >
              <Printer className="h-4 w-4 mr-1.5" />
              출력 모드
            </Button>
          </div>

          {/* Solve Mode → Step Wizard */}
          {mode === 'solve' && (
            <div className="print:hidden">
              <WorksheetSolver
                key={solverKey}
                worksheet={worksheet}
                subjectTitle={subjectTitle}
                onRetry={handleRetry}
                onNewWorksheet={generateWorksheet}
              />
            </div>
          )}

          {/* Print Mode → All questions at once */}
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
                  onClick={() => setShowPrintAnswers((prev) => !prev)}
                  variant="outline"
                  className="min-h-[44px]"
                >
                  {showPrintAnswers ? '정답 숨기기' : '정답보기'}
                </Button>
                <Button onClick={generateWorksheet} variant="outline" className="min-h-[44px]">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  다른 문제지
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
