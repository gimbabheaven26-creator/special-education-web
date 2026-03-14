import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DialogueBlock } from './DialogueBlock'
import { SubItemsBlock } from './SubItemsBlock'
import { ModelAnswers } from './ModelAnswers'
import { SUBJECT_LABELS } from '@/types/kice'
import type { KiceQuestion } from '@/types/kice'

interface QuestionCardProps {
  question: KiceQuestion
}

const TYPE_LABEL: Record<string, string> = {
  fill_in: '서술형',
  descriptive: '논술형',
}

export function QuestionCard({ question }: QuestionCardProps) {
  const scenarioDialogue = typeof question.scenario === 'object' && question.scenario?.dialogue
    ? question.scenario.dialogue
    : null

  return (
    <Card size="sm">
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold">
              {question.number}
            </span>
            <Badge variant="outline" className="text-xs">
              {TYPE_LABEL[question.type] ?? question.type}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {question.points}점
            </Badge>
          </CardTitle>

          <div className="flex gap-1 flex-wrap">
            {question.subjects.map(s => (
              <Badge key={s} variant="ghost" className="text-xs">
                {SUBJECT_LABELS[s] ?? s}
              </Badge>
            ))}
          </div>
        </div>

        {question.keywords.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-1">
            {question.keywords.map(kw => (
              <span key={kw} className="text-xs text-muted-foreground bg-muted/50 rounded px-1.5 py-0.5">
                #{kw}
              </span>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* 문제 지문 */}
        <p className="text-sm whitespace-pre-wrap text-foreground/90 leading-relaxed">
          {question.context}
        </p>

        {/* 시나리오 */}
        {typeof question.scenario === 'object' && question.scenario?.details && (
          <div className="rounded-lg bg-muted/30 p-3 text-sm space-y-1">
            {question.scenario.title && (
              <div className="font-semibold text-xs text-muted-foreground mb-2">
                {question.scenario.title}
              </div>
            )}
            {Object.entries(question.scenario.details).map(([key, value]) => (
              <div key={key} className="flex gap-2">
                <span className="font-medium text-muted-foreground shrink-0">{key}:</span>
                <span className="text-foreground/90">{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* 대화 */}
        {question.dialogue && <DialogueBlock lines={question.dialogue} />}
        {scenarioDialogue && <DialogueBlock lines={scenarioDialogue} />}

        {/* 하위 항목 */}
        {question.sub_items && <SubItemsBlock items={question.sub_items} />}

        {/* 참고 */}
        {question.note && (
          <div className="text-xs text-muted-foreground bg-muted/30 rounded px-3 py-2 italic">
            {question.note}
          </div>
        )}

        {/* 작성 방법 (서술형) */}
        {question.tasks && question.tasks.length > 0 && (
          <div className="rounded-lg border border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-950/30 p-3">
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1.5">
              작성 방법
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm text-foreground/90">
              {question.tasks.map((task, i) => (
                <li key={i} className="whitespace-pre-wrap">{task}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 모범답안 */}
        <ModelAnswers question={question} />
      </CardContent>
    </Card>
  )
}
