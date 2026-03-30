import ExcelJS from 'exceljs'
import type { IepPlan, WeeklyPlan } from '@/types/students'

const HEADER_FONT: Partial<ExcelJS.Font> = { bold: true }
const THIN_BORDER: Partial<ExcelJS.Border> = {
  style: 'thin',
  color: { argb: 'FF000000' },
}
const CELL_BORDER: Partial<ExcelJS.Borders> = {
  top: THIN_BORDER,
  bottom: THIN_BORDER,
  left: THIN_BORDER,
  right: THIN_BORDER,
}

/**
 * IEP 계획 + 주차별 계획을 Excel 파일(Buffer)로 생성한다.
 * 2개 시트: "IEP 목표", "주차별 계획"
 */
export async function generateIepExcel(
  plan: IepPlan,
  studentName: string,
  weeklyPlans: WeeklyPlan[],
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()

  buildGoalsSheet(workbook, plan, studentName)
  buildWeeklySheet(workbook, weeklyPlans)

  const arrayBuffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(arrayBuffer)
}

/** Sheet 1: IEP 목표 */
function buildGoalsSheet(
  wb: ExcelJS.Workbook,
  plan: IepPlan,
  studentName: string,
): void {
  const sheet = wb.addWorksheet('IEP 목표')
  const colCount = 4

  // Row 1: title (merged)
  sheet.mergeCells(1, 1, 1, colCount)
  const titleCell = sheet.getCell(1, 1)
  titleCell.value = `IEP 계획: ${plan.title}`
  titleCell.font = { bold: true, size: 14 }

  // Row 2: meta info (merged)
  sheet.mergeCells(2, 1, 2, colCount)
  const infoCell = sheet.getCell(2, 1)
  infoCell.value = `학생: ${studentName} | 과목: ${plan.subject} | 기간: ${plan.period_start} ~ ${plan.period_end}`

  // Row 3: empty (spacer)

  // Row 4: column headers
  const headers = ['번호', '성취기준코드', '목표 설명', '도달 수준', '현행수준']
  const colCountGoals = 5
  const headerRow = sheet.getRow(4)
  headers.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1)
    cell.value = h
    cell.font = HEADER_FONT
    cell.border = CELL_BORDER
  })

  // Row 5+: goal data
  plan.goals.forEach((goal, idx) => {
    const row = sheet.getRow(5 + idx)

    let presentLevelText = ''
    if (goal.present_level) {
      const axes = goal.present_level.levels
        .map((lv) => `${lv.axis_label}: ${lv.selected_text}`)
        .join('; ')
      presentLevelText = axes
      if (goal.present_level.notes) {
        presentLevelText += ` | ${goal.present_level.notes}`
      }
    }

    const values = [
      idx + 1,
      goal.achievement_standard_code,
      goal.description,
      goal.target_level,
      presentLevelText,
    ]
    values.forEach((v, i) => {
      const cell = row.getCell(i + 1)
      cell.value = v
      cell.border = CELL_BORDER
    })
  })

  applyAutoWidth(sheet, colCountGoals)
}

/** Sheet 2: 주차별 계획 */
function buildWeeklySheet(
  wb: ExcelJS.Workbook,
  weeklyPlans: WeeklyPlan[],
): void {
  const sheet = wb.addWorksheet('주차별 계획')
  const colCount = 5

  // Row 1: column headers
  const headers = ['주차', '활동 내용', '교재/자료', '평가 방법', '비고']
  const headerRow = sheet.getRow(1)
  headers.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1)
    cell.value = h
    cell.font = HEADER_FONT
    cell.border = CELL_BORDER
  })

  // Row 2+: weekly plan data
  weeklyPlans.forEach((wp, idx) => {
    const row = sheet.getRow(2 + idx)
    const values = [
      wp.week_number,
      wp.activity,
      wp.materials ?? '',
      wp.evaluation_method ?? '',
      wp.notes ?? '',
    ]
    values.forEach((v, i) => {
      const cell = row.getCell(i + 1)
      cell.value = v
      cell.border = CELL_BORDER
    })
  })

  applyAutoWidth(sheet, colCount)
}

/** 열 너비를 내용 기반으로 자동 조정한다. */
function applyAutoWidth(sheet: ExcelJS.Worksheet, colCount: number): void {
  const MIN_WIDTH = 10
  const MAX_WIDTH = 50

  for (let c = 1; c <= colCount; c++) {
    let maxLen = MIN_WIDTH
    sheet.getColumn(c).eachCell({ includeEmpty: false }, (cell) => {
      const len = String(cell.value ?? '').length
      if (len > maxLen) maxLen = len
    })
    sheet.getColumn(c).width = Math.min(maxLen + 2, MAX_WIDTH)
  }
}
