'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { FileText, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { Subject } from '@/types/content';
import type { WorksheetTopicRow } from '@/lib/db';

interface KiceByAreaProps {
  subjects: Subject[];
  topics: WorksheetTopicRow[];
}

export default function KiceByArea({ subjects, topics }: KiceByAreaProps) {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const subjectTopics = useMemo(() => {
    if (!selectedSubject) return [];
    return topics.filter((t) => t.subject === selectedSubject);
  }, [topics, selectedSubject]);

  const selectedSubjectData = subjects.find((s) => s.slug === selectedSubject);

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground">기출문제</h1>
        <p className="text-sm text-muted-foreground mt-1">
          과목별 영역으로 분류된 기출문제 · 동형검사지
        </p>
      </div>

      {/* 탭 전환 */}
      <div className="flex border-b border-border">
        <Link
          href="/kice?tab=by-year"
          className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent"
        >
          연도별 기출
        </Link>
        <Link
          href="/kice?tab=by-area"
          className="px-4 py-2.5 text-sm font-semibold border-b-2 border-primary text-primary"
        >
          영역별 기출
        </Link>
        <Link
          href="/kice?tab=search"
          className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent"
        >
          키워드 검색
        </Link>
      </div>

      {/* 과목 선택 */}
      {!selectedSubject ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {subjects.map((subject) => {
            const topicCount = topics.filter((t) => t.subject === subject.slug).length;
            return (
              <button
                key={subject.slug}
                onClick={() => setSelectedSubject(subject.slug)}
                className="text-left"
              >
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="flex items-center gap-3 py-4 px-4">
                    <span className="text-2xl">{subject.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{subject.title}</div>
                      <div className="text-xs text-muted-foreground">{topicCount}개 영역</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {/* 뒤로가기 */}
          <button
            onClick={() => setSelectedSubject(null)}
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            ← 전체 과목으로
          </button>

          <h2 className="text-lg font-bold flex items-center gap-2">
            <span className="text-xl">{selectedSubjectData?.icon}</span>
            {selectedSubjectData?.title}
          </h2>

          {/* 영역 목록 */}
          {subjectTopics.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              이 과목에는 아직 영역별 문제가 없습니다.
            </div>
          ) : (
            <div className="space-y-2">
              {subjectTopics.map((topic) => (
                <Link
                  key={topic.id}
                  href={`/worksheets/${topic.id}`}
                >
                  <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardContent className="flex items-center gap-3 py-3 px-4">
                      <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{topic.name}</div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
