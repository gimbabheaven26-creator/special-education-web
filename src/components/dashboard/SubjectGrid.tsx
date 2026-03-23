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
import { Card, CardContent } from '@/components/ui/card';
import type { Subject } from '@/types/content';
import type { LucideIcon } from 'lucide-react';
import { getConceptUrl } from '@/lib/concept-urls';

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
    <Link href={getConceptUrl(subject.slug)} className="block group">
      <Card className="h-full transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`${subject.color} p-2.5 rounded-xl text-white flex-shrink-0`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold truncate">{subject.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {subject.chapters.length}개 챕터
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function SubjectGrid({ subjects }: { subjects: Subject[] }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-foreground mb-3">전체 과목</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {subjects.map((subject) => (
          <SubjectCard key={subject.slug} subject={subject} />
        ))}
      </div>
    </section>
  );
}
