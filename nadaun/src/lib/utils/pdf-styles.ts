import { StyleSheet, Font } from '@react-pdf/renderer'

/* ── Font ── */
const NOTO_SANS_KR_CDN =
  'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/notosanskr/NotoSansKR%5Bwght%5D.ttf'

Font.register({ family: 'NotoSansKR', src: NOTO_SANS_KR_CDN })

/* ── Styles ── */
export const pdfStyles = StyleSheet.create({
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
