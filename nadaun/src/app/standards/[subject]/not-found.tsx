import Link from 'next/link'

export default function SubjectNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center" role="alert">
      <h2 className="text-xl font-bold">과목을 찾을 수 없습니다</h2>
      <p className="mt-2 text-muted-foreground">
        요청한 과목이 존재하지 않습니다.
      </p>
      <Link
        href="/standards"
        className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        과목 목록으로
      </Link>
    </div>
  )
}
