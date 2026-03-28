import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import path from 'path'
import type { IepGoal, IepPlan, WeeklyPlan } from '@/types/students'

/* ── Font Registration ── */
Font.register({
  family: 'NotoSansKR',
  fonts: [
    {
      src: path.join(process.cwd(), 'public/fonts/NotoSansKR-Regular.ttf'),
      fontWeight: 'normal',
    },
    {
      src: path.join(process.cwd(), 'public/fonts/NotoSansKR-Bold.ttf'),
      fontWeight: 'bold',
    },
  ],
})

/* ── Styles ── */
const s = StyleSheet.create({
  page: {
    fontFamily: 'NotoSansKR',
    fontSize: 10,
    padding: 40,
    color: '#111',
  },
  /* Header */
  headerTitle: {
    fontFamily: 'NotoSansKR',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  metaLabel: {
    fontFamily: 'NotoSansKR',
    fontWeight: 'bold',
    width: 80,
    fontSize: 10,
  },
  metaValue: {
    fontFamily: 'NotoSansKR',
    fontSize: 10,
  },
  /* Section */
  sectionTitle: {
    fontFamily: 'NotoSansKR',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 4,
  },
  /* Table */
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderTopWidth: 1,
    borderTopColor: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    minHeight: 24,
    alignItems: 'center',
  },
  /* Goal table cells */
  goalNumCell: { width: 30, paddingHorizontal: 4, paddingVertical: 4 },
  goalCodeCell: { width: 100, paddingHorizontal: 4, paddingVertical: 4 },
  goalDescCell: { flex: 1, paddingHorizontal: 4, paddingVertical: 4 },
  goalLevelCell: { width: 60, paddingHorizontal: 4, paddingVertical: 4 },
  /* Weekly table cells */
  weekNumCell: { width: 40, paddingHorizontal: 4, paddingVertical: 4 },
  weekActivityCell: { flex: 1, paddingHorizontal: 4, paddingVertical: 4 },
  weekMaterialCell: { width: 100, paddingHorizontal: 4, paddingVertical: 4 },
  weekEvalCell: { width: 100, paddingHorizontal: 4, paddingVertical: 4 },
  weekNotesCell: { width: 80, paddingHorizontal: 4, paddingVertical: 4 },
  /* Common text */
  cellText: { fontFamily: 'NotoSansKR', fontSize: 9 },
  headerText: { fontFamily: 'NotoSansKR', fontSize: 9, fontWeight: 'bold' },
})

/* ── Helper: Header ── */
function PdfHeader({
  plan,
  studentName,
}: {
  plan: IepPlan
  studentName: string
}) {
  return (
    <View>
      <Text style={s.headerTitle}>{plan.title}</Text>
      <View style={s.metaRow}>
        <Text style={s.metaLabel}>학생</Text>
        <Text style={s.metaValue}>{studentName}</Text>
      </View>
      <View style={s.metaRow}>
        <Text style={s.metaLabel}>교과</Text>
        <Text style={s.metaValue}>{plan.subject}</Text>
      </View>
      <View style={s.metaRow}>
        <Text style={s.metaLabel}>기간</Text>
        <Text style={s.metaValue}>
          {plan.period_start} ~ {plan.period_end}
        </Text>
      </View>
      <View style={s.metaRow}>
        <Text style={s.metaLabel}>상태</Text>
        <Text style={s.metaValue}>
          {plan.status === 'draft'
            ? '초안'
            : plan.status === 'active'
              ? '진행중'
              : '완료'}
        </Text>
      </View>
    </View>
  )
}

/* ── Helper: Goals Table ── */
function PdfGoalsTable({ goals }: { goals: IepGoal[] }) {
  return (
    <View>
      <Text style={s.sectionTitle}>교육 목표</Text>
      {/* Header */}
      <View style={s.tableHeader}>
        <View style={s.goalNumCell}>
          <Text style={s.headerText}>번호</Text>
        </View>
        <View style={s.goalCodeCell}>
          <Text style={s.headerText}>성취기준코드</Text>
        </View>
        <View style={s.goalDescCell}>
          <Text style={s.headerText}>목표 설명</Text>
        </View>
        <View style={s.goalLevelCell}>
          <Text style={s.headerText}>도달 수준</Text>
        </View>
      </View>
      {/* Rows */}
      {goals.map((goal, idx) => (
        <View style={s.tableRow} key={goal.achievement_standard_id}>
          <View style={s.goalNumCell}>
            <Text style={s.cellText}>{idx + 1}</Text>
          </View>
          <View style={s.goalCodeCell}>
            <Text style={s.cellText}>{goal.achievement_standard_code}</Text>
          </View>
          <View style={s.goalDescCell}>
            <Text style={s.cellText}>{goal.description}</Text>
          </View>
          <View style={s.goalLevelCell}>
            <Text style={s.cellText}>{goal.target_level}</Text>
          </View>
        </View>
      ))}
    </View>
  )
}

/* ── Helper: Weekly Plans Table ── */
function PdfWeeklyTable({ plans }: { plans: WeeklyPlan[] }) {
  if (plans.length === 0) return null
  return (
    <View>
      <Text style={s.sectionTitle}>주차별 계획</Text>
      {/* Header */}
      <View style={s.tableHeader}>
        <View style={s.weekNumCell}>
          <Text style={s.headerText}>주차</Text>
        </View>
        <View style={s.weekActivityCell}>
          <Text style={s.headerText}>활동 내용</Text>
        </View>
        <View style={s.weekMaterialCell}>
          <Text style={s.headerText}>교재/자료</Text>
        </View>
        <View style={s.weekEvalCell}>
          <Text style={s.headerText}>평가 방법</Text>
        </View>
        <View style={s.weekNotesCell}>
          <Text style={s.headerText}>비고</Text>
        </View>
      </View>
      {/* Rows */}
      {plans.map((wp) => (
        <View style={s.tableRow} key={wp.id}>
          <View style={s.weekNumCell}>
            <Text style={s.cellText}>{wp.week_number}주</Text>
          </View>
          <View style={s.weekActivityCell}>
            <Text style={s.cellText}>{wp.activity}</Text>
          </View>
          <View style={s.weekMaterialCell}>
            <Text style={s.cellText}>{wp.materials ?? '-'}</Text>
          </View>
          <View style={s.weekEvalCell}>
            <Text style={s.cellText}>{wp.evaluation_method ?? '-'}</Text>
          </View>
          <View style={s.weekNotesCell}>
            <Text style={s.cellText}>{wp.notes ?? '-'}</Text>
          </View>
        </View>
      ))}
    </View>
  )
}

/* ── Main Document ── */
export function IepPdfDocument({
  plan,
  studentName,
  weeklyPlans,
}: {
  plan: IepPlan
  studentName: string
  weeklyPlans: WeeklyPlan[]
}) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <PdfHeader plan={plan} studentName={studentName} />
        <PdfGoalsTable goals={plan.goals} />
        <PdfWeeklyTable plans={weeklyPlans} />
      </Page>
    </Document>
  )
}
