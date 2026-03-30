import Link from 'next/link'
import { notFound } from 'next/navigation'
import { generateProgressReportData } from '@/lib/queries/students'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ReportExportToolbar } from '@/components/export/report-export-toolbar'
import { AiSummarySection } from '@/components/plans/ai-summary-section'
import type { AchievementRating } from '@/types/students'

const RATING_LABELS: Record<AchievementRating, string> = {
  not_met: '미달',
  met: '달성',
  exceeded: '초과',
}
const RATING_COLORS: Record<AchievementRating, string> = {
  not_met: 'text-red-600 dark:text-red-400',
  met: 'text-green-600 dark:text-green-400',
  exceeded: 'text-blue-600 dark:text-blue-400',
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ studentId: string; planId: string }>
}) {
  const { studentId, planId } = await params
  const data = await generateProgressReportData(planId)
  if (!data) notFound()

  const { student, plan, progress, goalSummaries, observations } = data

  return (
    <div className="space-y-8 print:space-y-4">
      {/* 인쇄 시 숨기는 네비게이션 */}
      <div className="flex items-center gap-4 print:hidden">
        <Link
          href={`/students/${studentId}/plans/${planId}`}
          className="text-sm text-muted-foreground hover:text-foreground"
          aria-label="IEP 계획으로 돌아가기"
        >
          &larr; 계획으로 돌아가기
        </Link>
      </div>

      {/* 보고서 제목 */}
      <div className="text-center">
        <h1 className="text-2xl font-bold print:text-xl">
          IEP 진행 보고서
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {plan.title} &middot; {plan.subject}
        </p>
      </div>

      {/* 학생 정보 + 계획 기간 */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">학생</p>
              <p className="font-medium">{student.name}</p>
              <p className="text-xs text-muted-foreground">{student.grade}</p>
            </div>
            <div>
              <p className="text-muted-foreground">기간</p>
              <p className="font-medium">
                {plan.period_start} ~ {plan.period_end}
              </p>
              <p className="text-xs text-muted-foreground">
                {plan.status === 'active' ? '진행 중' : plan.status === 'completed' ? '완료' : '초안'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 전체 진도 요약 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">전체 진도</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <div
              className="h-3 flex-1 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={progress.completedPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`진도 ${progress.completedPct}% 완료`}
            >
              <div className="flex h-full">
                {progress.completed > 0 && (
                  <div
                    className="bg-green-500"
                    style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                  />
                )}
                {progress.inProgress > 0 && (
                  <div
                    className="bg-blue-500"
                    style={{ width: `${(progress.inProgress / progress.total) * 100}%` }}
                  />
                )}
              </div>
            </div>
            <span className="text-sm font-bold tabular-nums">
              {progress.completedPct}%
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-green-50 p-2 dark:bg-green-900/20">
              <p className="text-lg font-bold text-green-700 dark:text-green-400">
                {progress.completed}
              </p>
              <p className="text-xs text-muted-foreground">완료</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20">
              <p className="text-lg font-bold text-blue-700 dark:text-blue-400">
                {progress.inProgress}
              </p>
              <p className="text-xs text-muted-foreground">진행 중</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-2">
              <p className="text-lg font-bold text-muted-foreground">
                {progress.planned}
              </p>
              <p className="text-xs text-muted-foreground">예정</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 목표별 달성도 */}
      {goalSummaries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">목표별 달성도</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {goalSummaries.map((gs) => {
              const goal = plan.goals.find(
                (g) => g.achievement_standard_id === gs.achievementStandardId,
              )
              return (
                <div key={gs.achievementStandardId} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="shrink-0">
                      {goal?.achievement_standard_code ?? gs.achievementStandardId}
                    </Badge>
                    <span className="text-sm font-medium">
                      {goal?.description ?? ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-green-600 dark:text-green-400">
                      달성+초과 {gs.met + gs.exceeded}/{gs.total}
                    </span>
                    <span className="text-red-600 dark:text-red-400">
                      미달 {gs.notMet}/{gs.total}
                    </span>
                    <Badge variant={gs.metRate >= 70 ? 'default' : 'secondary'}>
                      달성률 {gs.metRate}%
                    </Badge>
                  </div>
                  {/* 달성도 바 */}
                  {gs.total > 0 && (
                    <div className="flex h-2 overflow-hidden rounded-full bg-muted">
                      {gs.exceeded > 0 && (
                        <div
                          className="bg-blue-500"
                          style={{ width: `${(gs.exceeded / gs.total) * 100}%` }}
                        />
                      )}
                      {gs.met > 0 && (
                        <div
                          className="bg-green-500"
                          style={{ width: `${(gs.met / gs.total) * 100}%` }}
                        />
                      )}
                      {gs.notMet > 0 && (
                        <div
                          className="bg-red-400"
                          style={{ width: `${(gs.notMet / gs.total) * 100}%` }}
                        />
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* 주차별 관찰 기록 */}
      {observations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">관찰 기록</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {observations.map((obs, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <Badge variant="outline" className="shrink-0">
                    {obs.weekNumber}주차
                  </Badge>
                  <div>
                    <span className={RATING_COLORS[obs.rating]}>
                      [{RATING_LABELS[obs.rating]}]
                    </span>{' '}
                    {obs.notes}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task 9: AI 종합 의견 */}
      <AiSummarySection
        student={student}
        plan={plan}
        progress={progress}
        goalSummaries={goalSummaries}
        observations={observations}
      />

      {/* 내보내기 툴바 (인쇄 시 숨김) */}
      <div className="print:hidden">
        <ReportExportToolbar
          student={student}
          plan={plan}
          progress={progress}
          goalSummaries={goalSummaries}
          observations={observations}
        />
      </div>
    </div>
  )
}
