// =============================================
// 【UIService.gs】フロントエンド向けデータ整形・取得（T-15）
// google.script.run 経由でフロントから呼ばれる
// 今はおたより画像の base64 取得のみ。今後の整形系ヘルパは本ファイルに追記する
// =============================================

// =============================================
// 【画像取得】fileIdから data URL（base64）を返す
// 引数：fileId（文字列）
// 戻り値：'data:{mimeType};base64,{base64}' 形式の文字列
// 注：DriveのサムネURLが iframe 内で表示できないケースへの対策として
//     画像Blobをbase64化してフロントの <img src> に直接渡す
// =============================================
function getNoticeImage(fileId) {
  try {
    if (!fileId) throw new Error('fileIdが指定されていません');
    var file = DriveApp.getFileById(fileId);
    var blob = file.getBlob();
    var base64 = Utilities.base64Encode(blob.getBytes());
    var mimeType = blob.getContentType();
    return 'data:' + mimeType + ';base64,' + base64;
  } catch (e) {
    Logger.log('getNoticeImage エラー: ' + e.toString());
    throw e;
  }
}

// =============================================
// 【接続診断】Drive/Spreadsheet の接続状態・保存先URL・登録件数・バージョンを返す（T-16）
// 個別の失敗を握って構造化結果として返却する：
//   NG項目があってもフロントが「どこがNGか」を画面に出せるようにするため
// 戻り値：{
//   drive:       bool,    // Driveルートフォルダが取得できたか
//   spreadsheet: bool,    // NOTICESシートが取得できたか
//   folderUrl:   string|null,  // 取得成功時のみ Drive フォルダURL
//   noticeCount: number,  // おたより総数（NG時は 0）
//   version:     string   // アプリバージョン
// }
// =============================================
function getConnectionStatus() {
  try {
    var result = {
      drive:       false,
      spreadsheet: false,
      folderUrl:   null,
      noticeCount: 0,
      version:     CONSTANTS.APP.VERSION
    };

    // Drive チェック（成功時のみ folderUrl を取得）
    try {
      var folder = getRootFolder();
      result.drive = true;
      result.folderUrl = folder.getUrl();
    } catch (eDrive) {
      Logger.log('getConnectionStatus Drive NG: ' + eDrive.toString());
    }

    // Spreadsheet チェック（NOTICESシート存在＋件数取得）
    try {
      getSheet(CONSTANTS.SHEET.NOTICES);
      result.spreadsheet = true;
      try {
        result.noticeCount = getAllRows(CONSTANTS.SHEET.NOTICES).length;
      } catch (eCount) {
        Logger.log('getConnectionStatus noticeCount 取得失敗: ' + eCount.toString());
      }
    } catch (eSheet) {
      Logger.log('getConnectionStatus Spreadsheet NG: ' + eSheet.toString());
    }

    return result;
  } catch (e) {
    Logger.log('getConnectionStatus エラー: ' + e.toString());
    throw e;
  }
}

// =============================================
// 【Web版再セットアップ】UIプロンプト無しで初回セットアップを再実行（T-17）
// Setup.gs の runInitialSetup は SpreadsheetApp.getUi().alert を使うため
// WebApp 文脈から呼べない。本関数は内部ヘルパー（idempotent・非破壊）を
// 直接実行し、結果のみ返す
// フロント側で必ず confirm() を表示してから呼び出すこと
// 戻り値：{ ok: true } または例外
// =============================================
function runSetupFromWeb() {
  try {
    // 1) シート3種を最新仕様に揃える（既存データ保持マイグレーション）
    _ensureSheetWithHeaders(CONSTANTS.SHEET.CHILDREN, CONSTANTS.HEADER_CHILDREN);
    _ensureSheetWithHeaders(CONSTANTS.SHEET.NOTICES,  CONSTANTS.HEADER_NOTICES);
    _ensureSheetWithHeaders(CONSTANTS.SHEET.SETTINGS, CONSTANTS.HEADER_SETTINGS);

    // 2) Driveルートフォルダを取得 or 作成
    var folder = _getOrCreateRootFolder();

    // 3) Script Properties＋システム設定シートに二重保存
    _saveSetting(CONSTANTS.SETTINGS_KEY.ROOT_FOLDER_ID, folder.getId());
    _saveSetting(CONSTANTS.SETTINGS_KEY.SETUP_DONE, 'true');

    return { ok: true };
  } catch (e) {
    Logger.log('runSetupFromWeb エラー: ' + e.toString());
    throw e;
  }
}
