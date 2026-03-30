import { z } from 'zod'

export const TARGET_LEVELS = ['기초', '보통', '우수'] as const
export type TargetLevel = (typeof TARGET_LEVELS)[number]

export const SUBJECTS = ['국어', '수학', '생활영어', '진로와 직업'] as const

const AXES = [
  'knowledge_understanding',
  'process_skills',
  'values_attitudes',
] as const

export const presentLevelAxisSchema = z.object({
  axis: z.enum(AXES),
  axis_label: z.string(),
  selected_index: z.number().int().min(0),
  selected_text: z.string(),
})

export const presentLevelSchema = z.object({
  levels: z.array(presentLevelAxisSchema).min(1).max(3),
  notes: z.string().max(1000).default(''),
  recommended_target: z.enum(TARGET_LEVELS),
})

export const goalSchema = z.object({
  achievement_standard_id: z.string().uuid('성취기준을 선택하세요.'),
  achievement_standard_code: z.string().min(1),
  description: z
    .string()
    .min(1, '목표 설명을 입력하세요.')
    .max(500, '목표 설명은 500자 이내로 입력하세요.'),
  target_level: z.enum(TARGET_LEVELS, {
    message: '도달 수준을 선택하세요.',
  }),
  present_level: presentLevelSchema.optional(),
})

export const iepPlanSchema = z
  .object({
    title: z
      .string()
      .min(1, '제목을 입력하세요.')
      .max(100, '제목은 100자 이내로 입력하세요.'),
    subject: z.enum(SUBJECTS, {
      message: '과목을 선택하세요.',
    }),
    period_start: z
      .string()
      .min(1, '시작일을 입력하세요.')
      .regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)'),
    period_end: z
      .string()
      .min(1, '종료일을 입력하세요.')
      .regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)'),
    goals: z.array(goalSchema).min(1, '목표를 최소 1개 추가하세요.'),
  })
  .refine((data) => data.period_end > data.period_start, {
    message: '종료일은 시작일 이후여야 합니다.',
    path: ['period_end'],
  })

export const weeklyPlanSchema = z.object({
  week_number: z
    .number()
    .int()
    .min(1, '주차는 1 이상이어야 합니다.')
    .max(52, '주차는 52 이하여야 합니다.'),
  achievement_standard_id: z.string().uuid().optional(),
  activity: z.string().min(1, '활동 내용을 입력하세요.'),
  materials: z.string().optional(),
  evaluation_method: z.string().optional(),
  notes: z.string().optional(),
})

export type PresentLevelFormData = z.infer<typeof presentLevelSchema>
export type GoalFormData = z.infer<typeof goalSchema>
export type IepPlanFormData = z.infer<typeof iepPlanSchema>
export type WeeklyPlanFormData = z.infer<typeof weeklyPlanSchema>
