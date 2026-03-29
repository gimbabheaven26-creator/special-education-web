import { describe, it, expect } from 'vitest'
import ExcelJS from 'exceljs'
import { generateIepExcel } from '@/lib/utils/excel-generator'
import type { IepGoal, IepPlan, WeeklyPlan } from '@/types/students'

// ─── Fixture Helpers ───────────────────────────────────────

function makeGoal(overrides: Partial<IepGoal> = {}): IepGoal {
  return {
    achievement_standard_id: 'std-001',
    achievement_standard_code: '[9국01-01]',
    description: '듣기 능력을 향상시킨다',
    target_level: '보통',
    ...overrides,
  }
}

function makePlan(overrides: Partial<IepPlan> = {}): IepPlan {
  return {
    id: 'plan-001',
    student_id: 'stu-001',
    teacher_id: 'tea-001',
    title: '2026 1학기 국어',
    subject: '국어',
    period_start: '2026-03-02',
    period_end: '2026-07-15',
    status: 'active',
    goals: [makeGoal()],
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
    ...overrides,
  }
}

function makeWeekly(overrides: Partial<WeeklyPlan> = {}): WeeklyPlan {
  return {
    id: 'wp-001',
    iep_plan_id: 'plan-001',
    week_number: 1,
    achievement_standard_id: 'std-001',
    activity: '그림책 읽고 이야기 나누기',
    materials: '그림책 3권',
    evaluation_method: '관찰 평가',
    notes: null,
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
    ...overrides,
  }
}

// ─── Helper: Buffer → Workbook ─────────────────────────────

async function bufferToWorkbook(buf: Buffer): Promise<ExcelJS.Workbook> {
  const wb = new ExcelJS.Workbook()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await wb.xlsx.load(buf as any)
  return wb
}

// ─── Tests ─────────────────────────────────────────────────

describe('generateIepExcel', () => {
  it('returns a non-empty Buffer', async () => {
    const buf = await generateIepExcel(makePlan(), '김학생', [makeWeekly()])
    expect(buf).toBeInstanceOf(Buffer)
    expect(buf.length).toBeGreaterThan(0)
  })

  it('buffer starts with PK zip header (0x50, 0x4B)', async () => {
    const buf = await generateIepExcel(makePlan(), '김학생', [makeWeekly()])
    expect(buf[0]).toBe(0x50)
    expect(buf[1]).toBe(0x4b)
  })

  it('workbook has 2 sheets: "IEP 목표" and "주차별 계획"', async () => {
    const buf = await generateIepExcel(makePlan(), '김학생', [makeWeekly()])
    const wb = await bufferToWorkbook(buf)

    expect(wb.worksheets).toHaveLength(2)
    expect(wb.worksheets[0].name).toBe('IEP 목표')
    expect(wb.worksheets[1].name).toBe('주차별 계획')
  })

  it('goals sheet has header row + correct number of data rows', async () => {
    const goals = [
      makeGoal({ achievement_standard_code: '[9국01-01]' }),
      makeGoal({ achievement_standard_code: '[9국01-02]' }),
      makeGoal({ achievement_standard_code: '[9국01-03]' }),
    ]
    const plan = makePlan({ goals })
    const buf = await generateIepExcel(plan, '김학생', [])
    const wb = await bufferToWorkbook(buf)
    const sheet = wb.getWorksheet('IEP 목표')!

    // Row 1: title, Row 2: info, Row 3: empty, Row 4: header, Row 5+: data
    const dataStartRow = 5
    const expectedLastRow = dataStartRow + goals.length - 1

    // Check header row (row 4)
    const headerRow = sheet.getRow(4)
    expect(headerRow.getCell(1).value).toBe('번호')
    expect(headerRow.getCell(2).value).toBe('성취기준코드')

    // Check data rows exist
    for (let i = 0; i < goals.length; i++) {
      const row = sheet.getRow(dataStartRow + i)
      expect(row.getCell(1).value).toBe(i + 1)
      expect(row.getCell(2).value).toBe(goals[i].achievement_standard_code)
    }

    // Row after last data should be empty
    const afterLast = sheet.getRow(expectedLastRow + 1)
    expect(afterLast.getCell(1).value).toBeNull()
  })

  it('weekly plans sheet has correct number of rows', async () => {
    const weeklyPlans = [
      makeWeekly({ week_number: 1, activity: '1주차 활동' }),
      makeWeekly({ week_number: 2, activity: '2주차 활동' }),
    ]
    const buf = await generateIepExcel(makePlan(), '김학생', weeklyPlans)
    const wb = await bufferToWorkbook(buf)
    const sheet = wb.getWorksheet('주차별 계획')!

    // Row 1: headers, Row 2+: data
    const headerRow = sheet.getRow(1)
    expect(headerRow.getCell(1).value).toBe('주차')
    expect(headerRow.getCell(2).value).toBe('활동 내용')

    for (let i = 0; i < weeklyPlans.length; i++) {
      const row = sheet.getRow(2 + i)
      expect(row.getCell(1).value).toBe(weeklyPlans[i].week_number)
      expect(row.getCell(2).value).toBe(weeklyPlans[i].activity)
    }

    // Row after last data should be empty
    const afterLast = sheet.getRow(2 + weeklyPlans.length)
    expect(afterLast.getCell(1).value).toBeNull()
  })

  it('handles empty goals array', async () => {
    const plan = makePlan({ goals: [] })
    const buf = await generateIepExcel(plan, '김학생', [makeWeekly()])
    const wb = await bufferToWorkbook(buf)
    const sheet = wb.getWorksheet('IEP 목표')!

    // Row 4: header, Row 5: should be empty (no data rows)
    const headerRow = sheet.getRow(4)
    expect(headerRow.getCell(1).value).toBe('번호')
    const firstDataRow = sheet.getRow(5)
    expect(firstDataRow.getCell(1).value).toBeNull()
  })

  it('handles empty weekly plans', async () => {
    const buf = await generateIepExcel(makePlan(), '김학생', [])
    const wb = await bufferToWorkbook(buf)
    const sheet = wb.getWorksheet('주차별 계획')!

    // Row 1: header, Row 2: should be empty (no data rows)
    const headerRow = sheet.getRow(1)
    expect(headerRow.getCell(1).value).toBe('주차')
    const firstDataRow = sheet.getRow(2)
    expect(firstDataRow.getCell(1).value).toBeNull()
  })
})
