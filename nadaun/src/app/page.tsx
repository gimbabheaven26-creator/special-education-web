import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md space-y-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">
          나다운
        </h1>
        <p className="text-muted-foreground">
          기본교육과정 기반 IEP 계획 보조도구
        </p>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">성취기준 탐색</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              2022 개정 기본교육과정 4과목 89개 성취기준을 탐색합니다.
            </p>
            <Link
              href="/standards"
              className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              성취기준 보기
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
