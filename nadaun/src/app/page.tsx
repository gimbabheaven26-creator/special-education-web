import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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
            <CardTitle className="text-lg">Phase 0-1 셋업 완료</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap justify-center gap-2">
              <Badge>Next.js 14</Badge>
              <Badge>TypeScript</Badge>
              <Badge>Tailwind v4</Badge>
              <Badge>shadcn/ui</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              4교과 89개 성취기준 데이터 준비 완료
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
