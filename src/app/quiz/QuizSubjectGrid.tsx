'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
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
  Lock,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFocusStore } from '@/stores/useFocusStore';
import type { Subject } from '@/types/content';
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

function QuizSubjectCard({
  subject,
  isFocus,
  isLocked,
}: {
  subject: Subject;
  isFocus: boolean;
  isLocked: boolean;
}) {
  const Icon = iconMap[subject.icon] ?? BookOpen;

  return (
    <Link
      href={`/quiz/${subject.slug}`}
      className="block group"
      aria-label={
        subject.title +
        ' 퀴즈' +
        (isFocus ? ' — 집중 과목' : '') +
        (isLocked ? ' — 후순위' : '')
      }
    >
      <Card
        className={
          'h-full transition-all duration-200 cursor-pointer ' +
          (isFocus
            ? 'ring-2 ring-primary shadow-md hover:shadow-lg'
            : isLocked
              ? 'opacity-50 hover:opacity-75 hover:shadow-sm'
              : 'hover:shadow-md')
        }
      >
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`${subject.color} p-2 rounded-lg text-white`}>
              {isLocked ? (
                <Lock className="h-6 w-6" />
              ) : (
                <Icon className="h-6 w-6" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold">
                {subject.title}
              </CardTitle>
            </div>
            {isFocus && (
              <Badge className="shrink-0 bg-primary/10 text-primary border-primary/20 text-xs">
                집중
              </Badge>
            )}
            {isLocked && (
              <Badge
                variant="outline"
                className="shrink-0 text-xs text-muted-foreground"
              >
                후순위
              </Badge>
            )}
          </div>
          <CardDescription>{subject.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            챕터 {subject.chapters.length}개
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

interface QuizSubjectGridProps {
  readonly subjects: ReadonlyArray<Subject>;
}

export default function QuizSubjectGrid({ subjects }: QuizSubjectGridProps) {
  const focusSubject = useFocusStore((s) => s.focusSubject);
  const isFocusExpired = useFocusStore((s) => s.isFocusExpired);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeFocus =
    mounted && focusSubject && !isFocusExpired() ? focusSubject : null;

  const sorted = [...subjects].sort((a, b) => {
    if (!activeFocus) return 0;
    if (a.slug === activeFocus) return -1;
    if (b.slug === activeFocus) return 1;
    return 0;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sorted.map((subject) => (
        <QuizSubjectCard
          key={subject.slug}
          subject={subject}
          isFocus={subject.slug === activeFocus}
          isLocked={!!activeFocus && subject.slug !== activeFocus}
        />
      ))}
    </div>
  );
}
