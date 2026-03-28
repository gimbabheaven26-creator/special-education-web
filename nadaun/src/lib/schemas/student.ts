import { z } from 'zod'

export const GRADES = ['중1', '중2', '중3'] as const
export type Grade = (typeof GRADES)[number]

export const studentSchema = z.object({
  name: z
    .string()
    .min(1, '이름을 입력하세요.')
    .max(50, '이름은 50자 이내로 입력하세요.'),
  grade: z.enum(GRADES, {
    message: '학년을 선택하세요.',
  }),
  disability_type: z.string().optional(),
  notes: z.string().optional(),
})

export type StudentFormData = z.infer<typeof studentSchema>
