/** 학생 (DB row) */
export interface Student {
  id: string
  teacher_id: string
  name: string
  grade: string
  disability_type: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

/** 학생 + IEP 계획 수 (목록용) */
export interface StudentWithIepCount extends Student {
  iep_count: number
}

/** IEP 목표 (goals JSONB 배열 아이템) */
export interface IepGoal {
  achievement_standard_id: string
  achievement_standard_code: string
  description: string
  target_level: '기초' | '보통' | '우수'
}

/** IEP 계획 (DB row) */
export interface IepPlan {
  id: string
  student_id: string
  teacher_id: string
  title: string
  subject: string
  period_start: string
  period_end: string
  status: 'draft' | 'active' | 'completed'
  goals: IepGoal[]
  created_at: string
  updated_at: string
}

/** 주차별 계획 (DB row) */
export interface WeeklyPlan {
  id: string
  iep_plan_id: string
  week_number: number
  achievement_standard_id: string | null
  activity: string
  materials: string | null
  evaluation_method: string | null
  notes: string | null
  created_at: string
  updated_at: string
}
