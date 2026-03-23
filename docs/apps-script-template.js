// ============================================================
// Google Sheets <-> Supabase 양방향 동기화
// 설정: ADMIN_API_KEY와 API_BASE_URL을 채워넣으세요
// ============================================================

const CONFIG = {
  API_BASE_URL: 'https://your-app.vercel.app', // 앱 URL
  ADMIN_API_KEY: 'your-admin-api-key',         // ADMIN_API_KEY 환경변수 값
  SHEET_NAME: 'quiz_questions',                 // 시트 이름
};

// 컬럼 매핑 (시트 컬럼 순서)
const COLUMNS = [
  'id', 'subject', 'chapter', 'type', 'difficulty',
  'question', 'answer', 'explanation', 'options',
  'caseContext', 'wrongExplanations', 'source', 'tags',
];

/**
 * 시트 수정 시 자동 호출 -> 변경된 행을 API로 전송
 */
function onEdit(e) {
  var sheet = e.source.getActiveSheet();
  if (sheet.getName() !== CONFIG.SHEET_NAME) return;

  var row = e.range.getRow();
  if (row <= 1) return; // 헤더 무시

  var values = sheet.getRange(row, 1, 1, COLUMNS.length).getValues()[0];
  var question = {};

  COLUMNS.forEach(function (col, i) {
    var val = values[i];
    // JSON 컬럼 파싱
    if (['options', 'wrongExplanations', 'tags'].indexOf(col) !== -1
        && typeof val === 'string' && val) {
      try { val = JSON.parse(val); } catch (_e) { /* keep as string */ }
    }
    if (val !== '' && val !== null) question[col] = val;
  });

  if (!question.id) return; // ID 없으면 무시

  // API 호출
  var response = UrlFetchApp.fetch(CONFIG.API_BASE_URL + '/api/admin/quiz/bulk', {
    method: 'POST',
    contentType: 'application/json',
    headers: { 'Authorization': 'Bearer ' + CONFIG.ADMIN_API_KEY },
    payload: JSON.stringify({ questions: [question] }),
    muteHttpExceptions: true,
  });

  var status = response.getResponseCode();
  if (status !== 200) {
    SpreadsheetApp.getActiveSpreadsheet().toast(
      '동기화 실패 (' + status + ')', '오류', 5
    );
  }
}

/**
 * DB에서 최신 데이터를 시트로 가져오기 (메뉴에서 수동 실행 또는 타이머)
 */
function syncFromDB() {
  var response = UrlFetchApp.fetch(CONFIG.API_BASE_URL + '/api/admin/quiz/export?format=json', {
    headers: { 'Authorization': 'Bearer ' + CONFIG.ADMIN_API_KEY },
    muteHttpExceptions: true,
  });

  if (response.getResponseCode() !== 200) {
    SpreadsheetApp.getActiveSpreadsheet().toast('데이터 가져오기 실패', '오류', 5);
    return;
  }

  var parsed = JSON.parse(response.getContentText());
  var questions = parsed.questions || parsed;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAME) || ss.insertSheet(CONFIG.SHEET_NAME);

  // 헤더
  sheet.getRange(1, 1, 1, COLUMNS.length).setValues([COLUMNS]);

  // 데이터
  var rows = questions.map(function (q) {
    return COLUMNS.map(function (col) {
      var val = q[col];
      if (val === null || val === undefined) return '';
      if (typeof val === 'object') return JSON.stringify(val);
      return val;
    });
  });

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, COLUMNS.length).setValues(rows);
  }

  // 남은 행 삭제 (이전 데이터 정리)
  var lastRow = sheet.getLastRow();
  if (lastRow > rows.length + 1) {
    sheet.deleteRows(rows.length + 2, lastRow - rows.length - 1);
  }

  ss.toast(rows.length + '건 동기화 완료', '성공', 3);
}

/**
 * 커스텀 메뉴 추가
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('퀴즈 관리')
    .addItem('DB에서 가져오기', 'syncFromDB')
    .addToUi();
}

/**
 * 5분 간격 자동 동기화 설정 (한 번만 실행)
 */
function setupTimeTrigger() {
  ScriptApp.newTrigger('syncFromDB')
    .timeBased()
    .everyMinutes(5)
    .create();
}
