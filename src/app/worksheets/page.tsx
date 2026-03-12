'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { getSubjects, getWorksheetTopics, getAllWorksheetTopics } from '@/lib/db';
import type { WorksheetTopicRow } from '@/lib/db';
import type { Subject } from '@/types/content';
import type { WorksheetConfig } from '@/lib/worksheet-utils';
import { buildWorksheet, saveWorksheet } from '@/lib/worksheet-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, AlertTriangle } from 'lucide-react';
import {
  WorksheetConfigPanel,
  applyConfig,
  type Difficulty,
  type QuestionCountOption,
} from './WorksheetConfigPanel';
import { WorksheetPreview } from './WorksheetPreview';

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

  const handleTogglePrintAnswers = useCallback(() => {
    setShowPrintAnswers((prev) => !prev);
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
        <WorksheetConfigPanel
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
        <WorksheetPreview
          worksheet={worksheet}
          subjectTitle={subjectTitle}
          origin={origin}
          mode={mode}
          onModeChange={setMode}
          showPrintAnswers={showPrintAnswers}
          onTogglePrintAnswers={handleTogglePrintAnswers}
          solverKey={solverKey}
          onRetry={handleRetry}
          onNewWorksheet={generateWorksheet}
        />
      )}
    </div>
  );
}
