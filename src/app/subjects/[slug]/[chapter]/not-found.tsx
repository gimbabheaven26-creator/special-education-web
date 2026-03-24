import Link from 'next/link';

export default function ChapterNotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <h2 className="text-xl font-bold text-foreground mb-4">
        챕터를 찾을 수 없습니다
      </h2>
      <p className="text-muted-foreground mb-6 text-sm">
        요청하신 챕터가 존재하지 않습니다.
      </p>
      <p className="text-muted-foreground mb-6 text-xs">
        🔒 학습 기록은 안전하게 보관되어 있습니다.
      </p>
      <Link
        href="/subjects"
        className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-medium text-sm px-6 py-2.5 hover:bg-primary/90 transition-colors"
      >
        과목 목록으로 돌아가기
      </Link>
    </div>
  );
}
