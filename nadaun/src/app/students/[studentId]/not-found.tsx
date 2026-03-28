import Link from 'next/link'

export default function StudentNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <h2 className="text-xl font-semibold">학생을 찾을 수 없습니다</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        존재하지 않거나 접근 권한이 없는 학생입니다.
      </p>
      <Link
        href="/students"
        className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        aria-label="학생 목록으로 돌아가기"
      >
        학생 목록으로
      </Link>
    </div>
  )
}
