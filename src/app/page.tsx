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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { subjects } from '@/data/subjects';
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

function SubjectCard({ subject }: { subject: Subject }) {
  const Icon = iconMap[subject.icon] ?? BookOpen;

  return (
    <Link href={`/subjects/${subject.slug}`} className="block group">
      <Card className="h-full transition-shadow duration-200 hover:shadow-md cursor-pointer">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`${subject.color} p-2 rounded-lg text-white`}>
              <Icon className="h-6 w-6" />
            </div>
            <CardTitle className="text-base font-semibold">{subject.title}</CardTitle>
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

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
      {/* 환영 섹션 */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          특수교육 공부방에 오신 것을 환영합니다
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          체계적인 학습으로 특수교육 전문가가 되어보세요
        </p>
        <Link
          href="/subjects"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold text-base px-8 py-4 hover:bg-primary/90 transition-colors shadow-md"
        >
          오늘의 학습 시작
        </Link>
      </div>

      {/* 과목 카드 그리드 */}
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-6">학습 과목</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <SubjectCard key={subject.slug} subject={subject} />
          ))}
        </div>
      </section>
    </div>
  );
}
