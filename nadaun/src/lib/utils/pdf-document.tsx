import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import type { IepPlan, WeeklyPlan } from '@/types/students'

/* ── Font ── */
const NOTO_SANS_KR_CDN =
  'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/notosanskr/NotoSansKR%5Bwght%5D.ttf'

Font.register({ family: 'NotoSansKR', src: NOTO_SANS_KR_CDN })

/* ── Styles ── */
const s = StyleSheet.create({
  page: { fontFamily: 'NotoSansKR', fontSize: 9, padding: 40, color: '#111' },
  /* Cover */
  coverTitle: {
    fontFamily: 'NotoSansKR',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 80,
    marginBottom: 60,
  },
  /* Table building blocks */
  table: { borderWidth: 1, borderColor: '#333' },
  row: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#999' },
  rowLast: { flexDirection: 'row' },
  cellLabel: {
    fontFamily: 'NotoSansKR',
    fontWeight: 'bold',
    fontSize: 9,
    backgroundColor: '#dde5f0',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRightWidth: 0.5,
    borderRightColor: '#999',
    textAlign: 'center',
    justifyContent: 'center',
  },
  cellValue: {
    fontFamily: 'NotoSansKR',
    fontSize: 9,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRightWidth: 0.5,
    borderRightColor: '#999',
    justifyContent: 'center',
  },
  cellValueNoBorder: {
    fontFamily: 'NotoSansKR',
    fontSize: 9,
    paddingVertical: 6,
    paddingHorizontal: 6,
    justifyContent: 'center',
  },
  /* Section titles */
  sectionNum: {
    fontFamily: 'NotoSansKR',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
  },
  subSection: {
    fontFamily: 'NotoSansKR',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 6,
  },
  /* Text */
  bold: { fontFamily: 'NotoSansKR', fontWeight: 'bold', fontSize: 9 },
  normal: { fontFamily: 'NotoSansKR', fontSize: 9 },
  small: { fontFamily: 'NotoSansKR', fontSize: 8 },
  bullet: { fontFamily: 'NotoSansKR', fontSize: 9, marginBottom: 2, paddingLeft: 8 },
  /* Weekly plan table */
  weekHeader: {
    flexDirection: 'row',
    backgroundColor: '#dde5f0',
    borderBottomWidth: 0.5,
    borderBottomColor: '#999',
  },
  weekRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    minHeight: 20,
  },
  headerCell: {
    fontFamily: 'NotoSansKR',
    fontSize: 8,
    fontWeight: 'bold',
    paddingVertical: 4,
    paddingHorizontal: 3,
    borderRightWidth: 0.5,
    borderRightColor: '#999',
    textAlign: 'center',
    justifyContent: 'center',
  },
  dataCell: {
    fontFamily: 'NotoSansKR',
    fontSize: 8,
    paddingVertical: 3,
    paddingHorizontal: 3,
    borderRightWidth: 0.5,
    borderRightColor: '#999',
    justifyContent: 'center',
  },
  dataCellLast: {
    fontFamily: 'NotoSansKR',
    fontSize: 8,
    paddingVertical: 3,
    paddingHorizontal: 3,
    justifyContent: 'center',
    textAlign: 'center',
  },
  /* Approval */
  approvalTitle: {
    fontFamily: 'NotoSansKR',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 16,
  },
})

/* ── Helpers ── */
function weekToMonth(periodStart: string, weekNum: number): number {
  const start = new Date(periodStart)
  const d = new Date(start.getTime() + (weekNum - 1) * 7 * 24 * 60 * 60 * 1000)
  return d.getMonth() + 1
}

function groupWeeksByMonth(
  weeklyPlans: WeeklyPlan[],
  periodStart: string,
): Map<number, WeeklyPlan[]> {
  const map = new Map<number, WeeklyPlan[]>()
  for (const wp of weeklyPlans) {
    const month = weekToMonth(periodStart, wp.week_number)
    const arr = map.get(month) ?? []
    arr.push(wp)
    map.set(month, arr)
  }
  return map
}

const SUBJECT_LABEL: Record<string, string> = {
  국어: '국어과',
  수학: '수학과',
  생활영어: '영어과',
  '진로와 직업': '진로와 직업(생활교육)',
}

const SUBJECT_ORDER = ['가', '나', '다', '라']

/* ── Cover Page ── */
function CoverPage({
  studentName,
  semesterLabel,
  year,
}: {
  studentName: string
  semesterLabel: string
  year: number
}) {
  return (
    <Page size="A4" style={s.page}>
      <Text style={s.coverTitle}>
        {year}학년도 {semesterLabel} 개별화교육계획
      </Text>

      <View style={[s.table, { width: 280, alignSelf: 'center', marginBottom: 60 }]}>
        <View style={s.row}>
          <View style={[s.cellLabel, { width: 100 }]}>
            <Text>학 생 명</Text>
          </View>
          <View style={[s.cellValueNoBorder, { width: 180 }]}>
            <Text style={{ textAlign: 'center' }}>{studentName}</Text>
          </View>
        </View>
        <View style={s.row}>
          <View style={[s.cellLabel, { width: 100 }]}>
            <Text>학 년</Text>
          </View>
          <View style={[s.cellValueNoBorder, { width: 180 }]}>
            <Text style={{ textAlign: 'center' }}> </Text>
          </View>
        </View>
        <View style={s.rowLast}>
          <View style={[s.cellLabel, { width: 100 }]}>
            <Text>생년월일</Text>
          </View>
          <View style={[s.cellValueNoBorder, { width: 180 }]}>
            <Text style={{ textAlign: 'center' }}> </Text>
          </View>
        </View>
      </View>

      <Text style={s.approvalTitle}>
        위 학생의 {year}학년도 {semesterLabel} 개별화교육계획을 다음과 같이 승인합니다.
      </Text>

      <View style={[s.table, { alignSelf: 'center', width: '90%' }]}>
        <View style={s.row}>
          <View style={[s.cellLabel, { width: 60 }]} />
          <View style={[s.cellLabel, { width: 60 }]}>
            <Text>간사</Text>
          </View>
          <View style={[s.cellLabel, { flex: 1 }]}>
            <Text>위원</Text>
          </View>
          <View style={[s.cellLabel, { width: 60 }]}>
            <Text>위원장</Text>
          </View>
        </View>
        <View style={s.row}>
          <View style={[s.cellLabel, { width: 60 }]}>
            <Text>수립일</Text>
          </View>
          <View style={[s.cellLabel, { width: 60 }]}>
            <Text style={s.small}>특수교사</Text>
          </View>
          <View style={[s.cellValue, { flex: 1 }]}>
            <Text style={[s.small, { textAlign: 'center' }]}>
              보호자 / 통합학급 담임교사 / 보건교사 / 교무기획부장
            </Text>
          </View>
          <View style={[s.cellValueNoBorder, { width: 60 }]}>
            <Text style={[s.small, { textAlign: 'center' }]}>교감</Text>
          </View>
        </View>
        <View style={s.rowLast}>
          <View style={[s.cellValue, { width: 60, minHeight: 40 }]}>
            <Text> </Text>
          </View>
          <View style={[s.cellValue, { width: 60, minHeight: 40 }]}>
            <Text> </Text>
          </View>
          <View style={[s.cellValue, { flex: 1, minHeight: 40 }]}>
            <Text style={{ textAlign: 'center' }}>전자결재로 갈음</Text>
          </View>
          <View style={[s.cellValueNoBorder, { width: 60, minHeight: 40 }]}>
            <Text> </Text>
          </View>
        </View>
      </View>
    </Page>
  )
}

/* ── Subject Section ── */
function SubjectSection({
  plan,
  weeklyPlans,
  orderLabel,
  studentGrade,
  teacherName,
}: {
  plan: IepPlan
  weeklyPlans: WeeklyPlan[]
  orderLabel: string
  studentGrade: string
  teacherName: string
}) {
  const label = SUBJECT_LABEL[plan.subject] ?? plan.subject
  const monthGroups = groupWeeksByMonth(weeklyPlans, plan.period_start)
  const sortedMonths = Array.from(monthGroups.keys()).sort((a, b) => a - b)
  const today = new Date()
  const dateStr = `${today.getFullYear()}. ${today.getMonth() + 1}. ${today.getDate()}.`

  return (
    <Page size="A4" style={s.page} wrap>
      <Text style={s.subSection}>
        {orderLabel}. {label}
      </Text>

      {/* Header info table */}
      <View style={s.table}>
        <View style={s.row}>
          <View style={[s.cellLabel, { width: 70 }]}>
            <Text>교육과정</Text>
          </View>
          <View style={[s.cellValue, { flex: 1 }]}>
            <Text>기본교육과정 {studentGrade} {plan.subject}</Text>
          </View>
          <View style={[s.cellLabel, { width: 50 }]}>
            <Text>작성자</Text>
          </View>
          <View style={[s.cellValue, { width: 70 }]}>
            <Text>{teacherName}</Text>
          </View>
          <View style={[s.cellLabel, { width: 50 }]}>
            <Text>작성일</Text>
          </View>
          <View style={[s.cellValueNoBorder, { width: 80 }]}>
            <Text>{dateStr}</Text>
          </View>
        </View>

        <View style={s.row}>
          <View style={[s.cellLabel, { width: 70 }]}>
            <Text>현행 학습{'\n'}수준</Text>
          </View>
          <View style={[s.cellValueNoBorder, { flex: 1, minHeight: 40 }]}>
            {plan.goals.map((g, i) => (
              <Text key={i} style={s.bullet}>
                • {g.achievement_standard_code}: {g.description}
              </Text>
            ))}
          </View>
        </View>

        <View style={s.rowLast}>
          <View style={[s.cellLabel, { width: 70 }]}>
            <Text>목표</Text>
          </View>
          <View style={[s.cellValueNoBorder, { flex: 1, minHeight: 50 }]}>
            <Text style={[s.bold, { marginBottom: 4 }]}>• 연간 목표</Text>
            {plan.goals.map((g, i) => (
              <Text key={i} style={s.bullet}>
                - {g.description} (도달 수준: {g.target_level})
              </Text>
            ))}
          </View>
        </View>
      </View>

      {/* Weekly plan table */}
      {weeklyPlans.length > 0 && (
        <View style={[s.table, { marginTop: 12 }]}>
          <View style={s.weekHeader}>
            <View style={[s.headerCell, { width: 25 }]}>
              <Text>월</Text>
            </View>
            <View style={[s.headerCell, { width: 25 }]}>
              <Text>주</Text>
            </View>
            <View style={[s.headerCell, { flex: 1 }]}>
              <Text>학습내용</Text>
            </View>
            <View style={[s.headerCell, { width: 160 }]}>
              <Text>성취기준 및 평가내용</Text>
            </View>
            <View style={{ ...s.headerCell, width: 35, borderRightWidth: 0 }}>
              <Text>평가</Text>
            </View>
          </View>

          {sortedMonths.map((month) => {
            const weeks = monthGroups.get(month) ?? []
            return weeks.map((wp, idx) => (
              <View
                style={s.weekRow}
                key={wp.id}
                wrap={false}
              >
                {idx === 0 ? (
                  <View style={[s.dataCell, { width: 25, textAlign: 'center' }]}>
                    <Text>{month}</Text>
                  </View>
                ) : (
                  <View style={[s.dataCell, { width: 25 }]}>
                    <Text> </Text>
                  </View>
                )}
                <View style={[s.dataCell, { width: 25, textAlign: 'center' }]}>
                  <Text>{wp.week_number}</Text>
                </View>
                <View style={[s.dataCell, { flex: 1 }]}>
                  <Text>{wp.activity}</Text>
                  {wp.materials && (
                    <Text style={s.small}>교재: {wp.materials}</Text>
                  )}
                </View>
                <View style={[s.dataCell, { width: 160 }]}>
                  <Text>{wp.evaluation_method ?? ''}</Text>
                  {wp.notes && <Text style={s.small}>{wp.notes}</Text>}
                </View>
                <View style={{ ...s.dataCellLast, width: 35 }}>
                  <Text style={s.small}>별도{'\n'}기록</Text>
                </View>
              </View>
            ))
          })}
        </View>
      )}

      {weeklyPlans.length === 0 && (
        <View style={[s.table, { marginTop: 12, padding: 16 }]}>
          <Text style={[s.normal, { textAlign: 'center', color: '#888' }]}>
            AI 채비를 실행하면 주차별 계획이 생성됩니다.
          </Text>
        </View>
      )}

      {/* 교수-학습 방법 */}
      <View style={[s.table, { marginTop: 12 }]}>
        <View style={s.rowLast}>
          <View style={[s.cellLabel, { width: 70 }]}>
            <Text>교수-학습{'\n'}방법</Text>
          </View>
          <View style={[s.cellValueNoBorder, { flex: 1, minHeight: 40 }]}>
            <Text style={s.bullet}>
              • 학습자의 발달 특성과 학업 능력, 교육적 요구 및 학습 준비도 등을 고려한 개별화된 수업을 지도한다.
            </Text>
            <Text style={s.bullet}>
              • 구체적인 조작 활동을 통한 수업이 이루어지도록 한다.
            </Text>
            <Text style={s.bullet}>
              • 실생활 중심의 학습 활동으로 전개되도록 지도하여 문제 해결 능력과 태도를 신장시킨다.
            </Text>
            <Text style={s.bullet}>
              • 다양한 교육 자료를 활용하도록 한다.
            </Text>
          </View>
        </View>
      </View>

      {/* 평가계획 */}
      <View style={[s.table, { marginTop: 12 }]}>
        <View style={s.rowLast}>
          <View style={[s.cellLabel, { width: 70 }]}>
            <Text>평가계획</Text>
          </View>
          <View style={[s.cellValueNoBorder, { flex: 1, minHeight: 50 }]}>
            <Text style={[s.bold, { marginBottom: 2 }]}>1. 개별화교육 평가</Text>
            <Text style={s.bullet}>
              • 교육과정에 제시된 내용의 수준과 범위를 준수하고, 교육과정에 제시된 목표와 내용, 교수·학습 방법과 일관성을 갖는다.
            </Text>
            <Text style={s.bullet}>
              • 관찰, 평정 척도, 면담 등 다양한 평가 방법을 사용해 종합적인 평가가 이루어지도록 한다.
            </Text>
            <Text style={s.bullet}>
              • 평가 결과는 학생, 학부모, 교사 자신에게 환류해 학습 개선에 도움이 되도록 한다.
            </Text>
          </View>
        </View>
      </View>
    </Page>
  )
}

/* ── Types ── */
export interface SubjectPlanData {
  plan: IepPlan
  weeklyPlans: WeeklyPlan[]
}

/* ── Main: Full IEP Document (multi-subject) ── */
export function FullIepDocument({
  studentName,
  studentGrade,
  teacherName,
  subjectPlans,
  semesterLabel,
  year,
}: {
  studentName: string
  studentGrade: string
  teacherName: string
  subjectPlans: SubjectPlanData[]
  semesterLabel: string
  year: number
}) {
  return (
    <Document>
      <CoverPage
        studentName={studentName}
        semesterLabel={semesterLabel}
        year={year}
      />
      {subjectPlans.map((sp, idx) => (
        <SubjectSection
          key={sp.plan.id}
          plan={sp.plan}
          weeklyPlans={sp.weeklyPlans}
          orderLabel={SUBJECT_ORDER[idx] ?? String(idx + 1)}
          studentGrade={studentGrade}
          teacherName={teacherName}
        />
      ))}
    </Document>
  )
}

/* ── Legacy: Single plan export (기존 호환) ── */
export function IepPdfDocument({
  plan,
  studentName,
  weeklyPlans,
}: {
  plan: IepPlan
  studentName: string
  weeklyPlans: WeeklyPlan[]
}) {
  const now = new Date()
  const month = now.getMonth() + 1
  const semesterLabel = month >= 3 && month <= 7 ? '1학기' : '2학기'

  return (
    <FullIepDocument
      studentName={studentName}
      studentGrade=""
      teacherName=""
      subjectPlans={[{ plan, weeklyPlans }]}
      semesterLabel={semesterLabel}
      year={now.getFullYear()}
    />
  )
}
