'use client';

import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStudyStore } from '@/stores/useStudyStore';
import { useMounted } from '@/hooks/useMounted';

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;

  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

export function ContinueLearning() {
  const mounted = useMounted();
  const recentActivities = useStudyStore((s) => s.recentActivities);

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            <div className="h-5 w-32 bg-muted rounded animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-16 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (recentActivities.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            이어서 학습하기
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            아직 학습 기록이 없어요. 과목을 선택해서 시작해보세요!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          이어서 학습하기
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {recentActivities.slice(0, 3).map((activity) => (
          <Link
            key={`${activity.subjectSlug}-${activity.chapterSlug}`}
            href={`/subjects/${activity.subjectSlug}/${activity.chapterSlug}`}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors group"
          >
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">
                {activity.chapterTitle}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {activity.subjectTitle} · {timeAgo(activity.timestamp)}
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 ml-2" />
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
