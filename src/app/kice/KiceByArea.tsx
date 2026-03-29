'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  FileText,
  ChevronRight,
  BookOpen,
  GraduationCap,
  Users,
  ClipboardCheck,
  Heart,
  ArrowRightLeft,
  Scale,
  Eye,
  Ear,
  Accessibility,
  MessageCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Subject } from '@/types/content';
import type { WorksheetTopicRow } from '@/lib/db';
import type { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  BookOpen,
  GraduationCap,
  Users,
  ClipboardCheck,
  Heart,
  ArrowRightLeft,
  Scale,
  Eye,
  Ear,
  Accessibility,
  MessageCircle,
};

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
      <div className="flex border-b border-border" role="tablist" aria-label="기출문제 보기 방식">
        <Link href="/kice?tab=by-year" role="tab" aria-selected="false" className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-muted-foreground/30 border-b-2 border-transparent transition-colors min-h-[44px] flex items-center">
          연도별 기출
        </Link>
        <Link href="/kice?tab=by-area" role="tab" aria-selected="true" className="px-4 py-2.5 text-sm font-semibold border-b-2 border-primary text-primary min-h-[44px] flex items-center">
          영역별 기출
        </Link>
        <Link href="/kice?tab=analytics" role="tab" aria-selected="false" className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-muted-foreground/30 border-b-2 border-transparent transition-colors min-h-[44px] flex items-center">
          빈도분석
        </Link>
        <Link href="/kice?tab=search" role="tab" aria-selected="false" className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-muted-foreground/30 border-b-2 border-transparent transition-colors min-h-[44px] flex items-center">
          키워드 검색
        </Link>
      </div>

      {/* 과목 선택 */}
      {!selectedSubject ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {subjects.map((subject) => {
            const topicCount = topics.filter((t) => t.subject === subject.slug).length;
            const Icon = iconMap[subject.icon] ?? BookOpen;
            return (
              <button
                key={subject.slug}
                onClick={() => setSelectedSubject(subject.slug)}
                className="text-left"
              >
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="flex items-center gap-3 py-4 px-4">
                    <Icon className="h-6 w-6" />
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

          {(() => {
            const SelectedIcon = iconMap[selectedSubjectData?.icon ?? ''] ?? BookOpen;
            return (
              <h2 className="text-lg font-bold flex items-center gap-2">
                <SelectedIcon className="h-5 w-5" />
                {selectedSubjectData?.title}
              </h2>
            );
          })()}

          {/* 영역 목록 */}
          {subjectTopics.length === 0 ? (
            <EmptyState
              icon="📂"
              title="아직 영역별 문제가 없습니다"
              description="이 과목의 영역별 문제는 준비 중이에요."
            />
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
