// =============================================
// 【Utils.gs】共通ユーティリティ（日付フォーマット）
// Spreadsheet操作には依存しない純粋関数のみを置く
// ID生成は各Serviceに配置する：
//   - generateChildId()  → ChildService.gs（T-07）
//   - generateNoticeId() → NoticeService.gs（T-10）
// =============================================

// =============================================
// 【日付】現在日時を「YYYY-MM-DD HH:mm:ss」形式で返す
// 引数：なし
// 戻り値：文字列（例：2026-06-09 14:25:03）
// =============================================
function getFormattedDateTime() {
  try {
    var now = new Date();
    var y  = now.getFullYear();
    var mo = _pad2(now.getMonth() + 1);
    var d  = _pad2(now.getDate());
    var h  = _pad2(now.getHours());
    var mi = _pad2(now.getMinutes());
    var s  = _pad2(now.getSeconds());
    return y + '-' + mo + '-' + d + ' ' + h + ':' + mi + ':' + s;
  } catch (e) {
    Logger.log('getFormattedDateTime エラー: ' + e.toString());
    throw e;
  }
}

// =============================================
// 【日付】現在日付を「YYYY-MM-DD」形式で返す
// 引数：なし
// 戻り値：文字列（例：2026-06-09）
// =============================================
function getFormattedDate() {
  try {
    var now = new Date();
    return now.getFullYear() + '-' + _pad2(now.getMonth() + 1) + '-' + _pad2(now.getDate());
  } catch (e) {
    Logger.log('getFormattedDate エラー: ' + e.toString());
    throw e;
  }
}

// =============================================
// 【日付】指定日（省略時は現在）を「YYYY-MM」形式で返す
// 引数：date（Dateオブジェクト・省略時は現在）
// 戻り値：文字列（例：2026-06）
// =============================================
function getFormattedYearMonth(date) {
  try {
    if (!date) date = new Date();
    return date.getFullYear() + '-' + _pad2(date.getMonth() + 1);
  } catch (e) {
    Logger.log('getFormattedYearMonth エラー: ' + e.toString());
    throw e;
  }
}

// =============================================
// 【内部】2桁ゼロ埋め（ES5互換・padStart不使用）
// =============================================
function _pad2(n) {
  return (n < 10 ? '0' : '') + n;
}
