'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { subjects } from '@/data/subjects';
import type { WorksheetConfig } from '@/data/worksheets/types';
import { getAvailableTopics, topicsBySubject } from '@/data/worksheets';
import { buildWorksheet, saveWorksheet } from '@/lib/worksheet-utils';
import { checkFillInAnswer } from '@/lib/answer-checker';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress';
import {
  FileText,
  Printer,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Send,
  PenLine,
  RotateCcw,
} from 'lucide-react';

function QRCode({ url, size = 80 }: { url: string; size?: number }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={qrUrl} alt="QR 코드" width={size} height={size} />
  );
}

type GradeResult = 'correct' | 'incorrect' | 'self-correct' | 'self-incorrect' | null;

export default function WorksheetsPage() {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedType, setSelectedType] = useState<'fill_in' | 'descriptive' | 'mixed'>('fill_in');
  const [worksheet, setWorksheet] = useState<WorksheetConfig | null>(null);
  const [noQuestionsError, setNoQuestionsError] = useState(false);
  const [origin, setOrigin] = useState('');

  // 인터랙티브 모드 상태
  const [mode, setMode] = useState<'solve' | 'print'>('solve');
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [grades, setGrades] = useState<Record<string, GradeResult>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPrintAnswers, setShowPrintAnswers] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const currentSubject = useMemo(
    () => subjects.find((s) => s.slug === selectedSubject),
    [selectedSubject],
  );

  const worksheetTopics = useMemo(() => {
    if (!selectedSubject) return [];
    return getAvailableTopics(selectedSubject);
  }, [selectedSubject]);

  const topics = useMemo(() => {
    return worksheetTopics.map((t) => ({ slug: t.id, title: `${t.name} (${t.count}문항)` }));
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

  const resetSolveState = useCallback(() => {
    setUserAnswers({});
    setGrades({});
    setIsSubmitted(false);
    setShowPrintAnswers(false);
  }, []);

  const generateWorksheet = () => {
    if (!selectedSubject || !selectedTopic) return;

    const wsTopicMatch = worksheetTopics.find((t) => t.id === selectedTopic);
    const topicName = wsTopicMatch?.name
      ?? currentSubject?.chapters.find((c) => c.slug === selectedTopic)?.title
      ?? selectedTopic;

    const ws = buildWorksheet(selectedSubject, selectedTopic, topicName, selectedType);
    if (!ws) {
      setNoQuestionsError(true);
      setWorksheet(null);
      return;
    }
    setNoQuestionsError(false);
    saveWorksheet(ws);
    setWorksheet(ws);
    resetSolveState();
  };

  const handleSubmit = () => {
    if (!worksheet) return;
    const newGrades: Record<string, GradeResult> = {};
    for (const q of worksheet.questions) {
      if (q.type === 'fill_in') {
        const answer = userAnswers[q.id] || '';
        newGrades[q.id] = checkFillInAnswer(answer, q.answer) ? 'correct' : 'incorrect';
      } else {
        // 서술형: 자기 채점 대기
        newGrades[q.id] = null;
      }
    }
    setGrades(newGrades);
    setIsSubmitted(true);
  };

  const handleSelfGrade = (questionId: string, correct: boolean) => {
    setGrades((prev) => ({ ...prev, [questionId]: correct ? 'self-correct' : 'self-incorrect' }));
  };

  const handleRetry = () => {
    resetSolveState();
  };

  // 점수 계산
  const scoreInfo = useMemo(() => {
    if (!worksheet || !isSubmitted) return null;
    let correct = 0;
    let total = 0;
    let score = 0;
    let maxScore = 0;
    const hasUngraded = Object.values(grades).some((g) => g === null);

    for (const q of worksheet.questions) {
      const pts = q.type === 'fill_in' ? 2 : 4;
      maxScore += pts;
      total++;
      const g = grades[q.id];
      if (g === 'correct' || g === 'self-correct') {
        correct++;
        score += pts;
      }
    }
    return { correct, total, score, maxScore, hasUngraded };
  }, [worksheet, grades, isSubmitted]);

  // 진행률
  const answeredCount = useMemo(() => {
    if (!worksheet) return 0;
    return worksheet.questions.filter((q) => (userAnswers[q.id] || '').trim().length > 0).length;
  }, [worksheet, userAnswers]);

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
          과목과 영역을 선택하여 학습지를 생성하세요. 온라인에서 직접 풀거나 출력할 수 있습니다.
        </p>
      </div>

      {/* Selection Bar */}
      <Card className="mb-8 print:hidden">
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
                className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">-- 과목을 선택하세요 --</option>
                {subjects
                  .filter((s) => topicsBySubject[s.slug])
                  .map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.title}
                    </option>
                  ))}
                {subjects
                  .filter((s) => !topicsBySubject[s.slug])
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
                className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
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
                  setSelectedType(e.target.value as 'fill_in' | 'descriptive' | 'mixed')
                }
                className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
            className="w-full sm:w-auto"
          >
            <FileText className="h-4 w-4 mr-2" />
            문제지 생성
          </Button>
        </CardContent>
      </Card>

      {/* No questions error */}
      {noQuestionsError && (
        <Card className="mb-8 border-amber-300 dark:border-amber-700">
          <CardContent className="pt-6 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
            <p className="text-sm text-amber-700 dark:text-amber-400">
              선택한 영역/유형에 해당하는 문제가 없습니다. 다른 유형이나 영역을 선택해 주세요.
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

          {/* Progress Bar (solve mode only) */}
          {mode === 'solve' && !isSubmitted && (
            <div className="mb-6 print:hidden">
              <Progress value={(answeredCount / worksheet.questionCount) * 100}>
                <ProgressLabel>진행률</ProgressLabel>
                <ProgressValue>
                  {() => `${answeredCount}/${worksheet.questionCount} 문제 작성`}
                </ProgressValue>
              </Progress>
            </div>
          )}

          {/* Score Summary (after submit) */}
          {mode === 'solve' && isSubmitted && scoreInfo && (
            <Card className="mb-6 print:hidden border-primary/30 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-1">채점 결과</h3>
                    <p className="text-sm text-muted-foreground">
                      정답 <span className="font-semibold text-green-600 dark:text-green-400">{scoreInfo.correct}</span> / {scoreInfo.total} 문제
                      {' · '}
                      <span className="font-semibold text-foreground">{scoreInfo.score}점</span> / {scoreInfo.maxScore}점
                    </p>
                    {scoreInfo.hasUngraded && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                        서술형 문제는 아래에서 자기 채점해주세요
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleRetry}>
                      <RotateCcw className="h-4 w-4 mr-1.5" />
                      다시 풀기
                    </Button>
                    <Button variant="outline" size="sm" onClick={generateWorksheet}>
                      <RefreshCw className="h-4 w-4 mr-1.5" />
                      새 문제지
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Questions */}
          <div className="space-y-6 print:space-y-4">
            {worksheet.questions.map((q, idx) => {
              const grade = grades[q.id];
              const isCorrect = grade === 'correct' || grade === 'self-correct';
              const isIncorrect = grade === 'incorrect' || grade === 'self-incorrect';

              return (
                <div
                  key={q.id}
                  className={`worksheet-question rounded-lg p-4 transition-colors ${
                    q.type === 'descriptive' ? 'worksheet-descriptive' : 'worksheet-fillin'
                  } ${isSubmitted && isCorrect ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800' : ''}
                  ${isSubmitted && isIncorrect ? 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800' : ''}
                  ${!isSubmitted ? 'border border-border' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Question Number + Grade Icon */}
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <span className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-sm font-bold text-foreground print:bg-transparent print:border print:border-foreground/30">
                        {idx + 1}
                      </span>
                      {isSubmitted && isCorrect && (
                        <CheckCircle className="h-5 w-5 text-green-500 print:hidden" />
                      )}
                      {isSubmitted && isIncorrect && (
                        <XCircle className="h-5 w-5 text-red-500 print:hidden" />
                      )}
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

                      {/* === SOLVE MODE === */}
                      {mode === 'solve' && (
                        <div className="mt-3 print:hidden">
                          {q.type === 'fill_in' ? (
                            <Input
                              value={userAnswers[q.id] || ''}
                              onChange={(e) =>
                                setUserAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !isSubmitted) {
                                  // 다음 빈 input으로 포커스 이동
                                  const inputs = document.querySelectorAll<HTMLInputElement>(
                                    '[data-worksheet-input]'
                                  );
                                  const currentIdx = Array.from(inputs).indexOf(
                                    e.target as HTMLInputElement
                                  );
                                  if (currentIdx < inputs.length - 1) {
                                    inputs[currentIdx + 1].focus();
                                  }
                                }
                              }}
                              placeholder="정답을 입력하세요"
                              disabled={isSubmitted}
                              data-worksheet-input=""
                              className={`max-w-md ${
                                isSubmitted && isCorrect
                                  ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                                  : ''
                              } ${
                                isSubmitted && isIncorrect
                                  ? 'border-red-500 bg-red-50 dark:bg-red-950/30'
                                  : ''
                              }`}
                            />
                          ) : (
                            <textarea
                              value={userAnswers[q.id] || ''}
                              onChange={(e) =>
                                setUserAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                              }
                              placeholder="서술형 답안을 작성하세요"
                              disabled={isSubmitted}
                              rows={4}
                              className={`w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/50 disabled:opacity-50 disabled:cursor-not-allowed ${
                                isSubmitted && isCorrect
                                  ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                                  : ''
                              } ${
                                isSubmitted && isIncorrect
                                  ? 'border-red-500 bg-red-50 dark:bg-red-950/30'
                                  : ''
                              }`}
                            />
                          )}

                          {/* 제출 후 정답/해설 표시 */}
                          {isSubmitted && (
                            <div className="mt-3 space-y-2">
                              {/* 기입형: 틀렸으면 정답 표시 */}
                              {q.type === 'fill_in' && isIncorrect && (
                                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                                  <p className="text-sm">
                                    <span className="font-medium text-amber-800 dark:text-amber-300">정답: </span>
                                    <span className="text-amber-700 dark:text-amber-400">{q.answer}</span>
                                  </p>
                                </div>
                              )}

                              {/* 서술형: 모범답안 + 자기채점 */}
                              {q.type === 'descriptive' && (
                                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">모범답안</p>
                                  <p className="text-sm text-blue-700 dark:text-blue-400 whitespace-pre-wrap">{q.answer}</p>
                                  {grade === null && (
                                    <div className="flex gap-2 mt-3">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400"
                                        onClick={() => handleSelfGrade(q.id, true)}
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        맞음
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400"
                                        onClick={() => handleSelfGrade(q.id, false)}
                                      >
                                        <XCircle className="h-4 w-4 mr-1" />
                                        틀림
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* 해설 */}
                              {q.explanation && (grade !== null) && (
                                <div className="p-3 rounded-lg bg-muted/50">
                                  <p className="text-sm">
                                    <span className="font-medium text-foreground">해설: </span>
                                    <span className="text-muted-foreground">{q.explanation}</span>
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* === PRINT MODE === */}
                      {mode === 'print' && (
                        <>
                          {q.type === 'fill_in' && !showPrintAnswers && (
                            <div className="mt-3 border-b-2 border-dashed border-foreground/30 w-64 h-8" />
                          )}
                          {q.type === 'descriptive' && !showPrintAnswers && (
                            <div className="mt-3 space-y-3">
                              {[1, 2, 3, 4, 5].map((line) => (
                                <div
                                  key={line}
                                  className="border-b border-dashed border-foreground/20 h-6"
                                />
                              ))}
                            </div>
                          )}
                          {showPrintAnswers && (
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
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Print footer */}
          <div className="hidden print:block mt-8 pt-4 border-t border-foreground/20 text-center text-xs text-foreground/50">
            special-education-web
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-8 print:hidden">
            {mode === 'solve' && !isSubmitted && (
              <Button onClick={handleSubmit} disabled={answeredCount === 0}>
                <Send className="h-4 w-4 mr-2" />
                제출하기 ({answeredCount}/{worksheet.questionCount})
              </Button>
            )}
            {mode === 'print' && (
              <>
                <Button onClick={() => window.print()} variant="outline">
                  <Printer className="h-4 w-4 mr-2" />
                  출력하기
                </Button>
                <Button onClick={() => setShowPrintAnswers(!showPrintAnswers)} variant="outline">
                  {showPrintAnswers ? '정답 숨기기' : '정답보기'}
                </Button>
              </>
            )}
            <Button onClick={generateWorksheet} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              다른 문제지
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
