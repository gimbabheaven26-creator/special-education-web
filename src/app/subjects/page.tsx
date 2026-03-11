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
import { getSubjects } from '@/lib/db';
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

export default async function SubjectsPage() {
  const subjects = await getSubjects();

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-8">학습 과목</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <SubjectCard key={subject.slug} subject={subject} />
        ))}
      </div>
    </div>
  );
}
