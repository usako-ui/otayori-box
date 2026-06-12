// =============================================
// 【Setup.gs】初回セットアップ・マイグレーション・メニュー
// スプレッドシートのメニューバーから実行する管理機能を集約する
//   - 🚀 初回セットアップ実行 → runInitialSetup
//   - 🔄 シート・列を最新仕様に更新 → runMigration
//   - 🔗 Webアプリを開く → openWebApp
// =============================================

// =============================================
// 【トリガー】スプレッドシート起動時にカスタムメニューを追加
// onOpenは予約名トリガーで自動呼出される
// =============================================
function onOpen(e) {
  try {
    SpreadsheetApp.getUi()
      .createMenu('おたよりBOX')
      .addItem('🚀 初回セットアップ実行', 'runInitialSetup')
      .addItem('🔄 シート・列を最新仕様に更新', 'runMigration')
      .addItem('🔗 Webアプリを開く', 'openWebApp')
      .addToUi();
  } catch (e2) {
    // onOpenでthrowするとシート自体が開けなくなる事故が起きるためログのみ
    Logger.log('onOpen エラー: ' + e2.toString());
  }
}

// =============================================
// 【メニュー】初回セットアップ実行
// シート・ヘッダー・Driveフォルダ・Script Properties・システム設定を整える
// 再実行も安全（idempotent）：既存データは保持したまま列順を整える
// =============================================
function runInitialSetup() {
  try {
    var ui = SpreadsheetApp.getUi();
    var props = PropertiesService.getScriptProperties();

    // 二重実行ガード：既に SETUP_DONE が true なら確認を出す
    if (props.getProperty(CONSTANTS.PROP_KEY.SETUP_DONE) === 'true') {
      var resp = ui.alert(
        'おたよりBOX',
        '初回セットアップは実施済みです。再実行しますか？\n（既存シートはデータを保持したまま最新仕様に揃えます）',
        ui.ButtonSet.YES_NO
      );
      if (resp !== ui.Button.YES) return;
    }

    // 1) 全シートを揃える（無ければ作成・あれば安全マイグレーション）
    _ensureSheetWithHeaders(CONSTANTS.SHEET.CHILDREN, CONSTANTS.HEADER_CHILDREN);
    _ensureSheetWithHeaders(CONSTANTS.SHEET.NOTICES,  CONSTANTS.HEADER_NOTICES);
    _ensureSheetWithHeaders(CONSTANTS.SHEET.SETTINGS, CONSTANTS.HEADER_SETTINGS);

    // 2) Driveルートフォルダを取得または新規作成
    var folder = _getOrCreateRootFolder();

    // 3) ROOT_FOLDER_ID と SETUP_DONE をシート＋Script Properties に二重保存
    _saveSetting(CONSTANTS.SETTINGS_KEY.ROOT_FOLDER_ID, folder.getId());
    _saveSetting(CONSTANTS.SETTINGS_KEY.SETUP_DONE, 'true');

    // 4) 完了トースト
    SpreadsheetApp.getActiveSpreadsheet().toast(
      'セットアップ完了。Driveフォルダ「' + CONSTANTS.DRIVE.ROOT_FOLDER_NAME + '」を作成しました。',
      'おたよりBOX',
      5
    );
  } catch (e) {
    Logger.log('runInitialSetup エラー: ' + e.toString());
    SpreadsheetApp.getUi().alert('セットアップに失敗しました：' + e.message);
    throw e;
  }
}

// =============================================
// 【メニュー】シート・列を最新仕様に更新（マイグレーション）
// 既存データを保持しつつ、Constants定義のヘッダー順に並び替え
// Constants定義にない未知の列は末尾にそのまま保持する
// =============================================
function runMigration() {
  try {
    var defs = [
      { name: CONSTANTS.SHEET.CHILDREN, hd: CONSTANTS.HEADER_CHILDREN },
      { name: CONSTANTS.SHEET.NOTICES,  hd: CONSTANTS.HEADER_NOTICES  },
      { name: CONSTANTS.SHEET.SETTINGS, hd: CONSTANTS.HEADER_SETTINGS }
    ];
    for (var i = 0; i < defs.length; i++) {
      _ensureSheetWithHeaders(defs[i].name, defs[i].hd);
    }
    SpreadsheetApp.getActiveSpreadsheet().toast(
      'シート・列を最新仕様に更新しました。',
      'おたよりBOX',
      4
    );
  } catch (e) {
    Logger.log('runMigration エラー: ' + e.toString());
    SpreadsheetApp.getUi().alert('更新に失敗しました：' + e.message);
    throw e;
  }
}

// =============================================
// 【メニュー】Webアプリを開く
// 保存済み WEB_APP_URL を表示。未設定時はプロンプトで入力受付＋保存
// GASはサーバー側からURLを開けないため、リンク付きモーダルダイアログを表示する
// =============================================
function openWebApp() {
  try {
    var ui = SpreadsheetApp.getUi();
    var url = _loadWebAppUrl();

    // 1) URL未設定 → プロンプトで入力受付
    if (!url) {
      var resp = ui.prompt(
        'おたよりBOX Webアプリ URL設定',
        'GASのWebAppのURL（https://script.google.com で始まるURL）を入力してください：',
        ui.ButtonSet.OK_CANCEL
      );

      // キャンセル or 閉じる（×）→ 何もしない
      if (resp.getSelectedButton() !== ui.Button.OK) return;

      // 前後空白を除去（コピペ時の改行・空白混入対策）
      var input = String(resp.getResponseText() || '').trim();

      // 空入力チェック
      if (input === '') {
        ui.alert('URLが入力されていません');
        return;
      }

      // URL形式チェック（GAS WebAppのURLは https://script.google.com で始まる）
      if (input.indexOf('https://script.google.com') !== 0) {
        ui.alert('GASのWebAppのURLを入力してください（https://script.google.com で始まるURL）');
        return;
      }

      // 保存（Script Properties＋システム設定シート 二重保存）
      _saveSetting(CONSTANTS.SETTINGS_KEY.WEB_APP_URL, input);

      // 完了トースト：ユーザーは再度メニューを押す動線
      SpreadsheetApp.getActiveSpreadsheet().toast(
        'URLを保存しました。もう一度「Webアプリを開く」を押してください。',
        'おたよりBOX',
        5
      );
      return;
    }

    // 2) URL設定済み → リンク付きモーダルダイアログを表示
    var safeUrl = String(url).replace(/"/g, '&quot;');
    var html = HtmlService.createHtmlOutput(
      '<p style="font-family:sans-serif">下記リンクをクリックして開いてください：</p>' +
      '<p><a href="' + safeUrl + '" target="_blank" rel="noopener">おたよりBOXを開く</a></p>'
    ).setWidth(420).setHeight(140);
    ui.showModalDialog(html, 'おたよりBOX');
  } catch (e) {
    Logger.log('openWebApp エラー: ' + e.toString());
    SpreadsheetApp.getUi().alert('Webアプリの起動に失敗しました：' + e.message);
    throw e;
  }
}

// =============================================
// 【内部】シートを定義通りに揃える
// 存在しなければヘッダー付きで新規作成、存在すれば安全マイグレーション
// =============================================
function _ensureSheetWithHeaders(sheetName, headerDef) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      // 新規作成：ヘッダーを定義順で1行目に書き込む
      sheet = ss.insertSheet(sheetName);
      var names = getHeaderNames(headerDef);
      sheet.getRange(1, 1, 1, names.length).setValues([names]);
      sheet.setFrozenRows(1);
      return;
    }
    // 既存シートはデータ保持マイグレーションへ
    _safeMigrateSheet(sheet, headerDef);
  } catch (e) {
    Logger.log('_ensureSheetWithHeaders エラー: ' + e.toString());
    throw e;
  }
}

// =============================================
// 【内部・核心】既存シートを安全にマイグレーション
// 手順：
//   1. Constants定義のヘッダーを正しい順で先頭に並べる
//   2. 既存データをヘッダー名で対応させて正しい列に移動
//   3. Constants定義にない未知の列は末尾にそのまま保持
//   4. データは一切削除しない
// =============================================
function _safeMigrateSheet(sheet, headerDef) {
  try {
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    var defNames = getHeaderNames(headerDef);  // 定義順のヘッダー名配列

    // 完全に空のシート：ヘッダーだけ書いて終了
    if (lastCol < 1) {
      sheet.getRange(1, 1, 1, defNames.length).setValues([defNames]);
      sheet.setFrozenRows(1);
      return;
    }

    // 既存ヘッダー行を読む
    var existingHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0]
      .map(function(v) { return String(v); });

    // 既存データ行を読む（0件もOK）
    var existingData = (lastRow >= 2)
      ? sheet.getRange(2, 1, lastRow - 1, lastCol).getValues()
      : [];

    // 既存ヘッダー名 → colIdx(0-based) の対応マップを作る
    var existingIdx = {};
    for (var i = 0; i < existingHeaders.length; i++) {
      existingIdx[existingHeaders[i]] = i;
    }

    // Constants定義に無い「未知ヘッダー」を元の順序で抽出
    var unknownNames = [];
    for (var j = 0; j < existingHeaders.length; j++) {
      var h = existingHeaders[j];
      // 空文字ヘッダーは無視（誤って空列を残さないため）
      if (h !== '' && defNames.indexOf(h) === -1) {
        unknownNames.push(h);
      }
    }

    // 新ヘッダー順 = [Constants定義順] + [未知ヘッダー（元の順序）]
    var newHeaders = defNames.concat(unknownNames);

    // 各データ行を新ヘッダー順に組み直す
    var newData = existingData.map(function(row) {
      return newHeaders.map(function(h) {
        var ix = existingIdx[h];
        return (ix === undefined) ? '' : row[ix];
      });
    });

    // 値だけクリア（書式は保持）→ ヘッダー → データを書き戻す
    sheet.clearContents();
    sheet.getRange(1, 1, 1, newHeaders.length).setValues([newHeaders]);
    if (newData.length > 0) {
      sheet.getRange(2, 1, newData.length, newHeaders.length).setValues(newData);
    }
    sheet.setFrozenRows(1);
  } catch (e) {
    Logger.log('_safeMigrateSheet エラー: ' + e.toString());
    throw e;
  }
}

// =============================================
// 【内部】Driveルートフォルダを取得 or 作成
// 既存IDが残っていれば再利用、無効なら新規作成にフォールバック
// =============================================
function _getOrCreateRootFolder() {
  try {
    var props = PropertiesService.getScriptProperties();
    var savedId = props.getProperty(CONSTANTS.PROP_KEY.ROOT_FOLDER_ID);
    if (savedId) {
      try {
        return DriveApp.getFolderById(savedId);
      } catch (errIgnore) {
        // 既存IDが無効（削除済み・権限喪失）→ 新規作成にフォールバック
        Logger.log('既存ROOT_FOLDER_IDが無効。新規作成します: ' + errIgnore.toString());
      }
    }
    return DriveApp.createFolder(CONSTANTS.DRIVE.ROOT_FOLDER_NAME);
  } catch (e) {
    Logger.log('_getOrCreateRootFolder エラー: ' + e.toString());
    throw e;
  }
}

// =============================================
// 【内部】設定値を保存（Script Properties＋システム設定シート二重書き込み）
// 既存キー行があれば更新、無ければ新規追加
// =============================================
function _saveSetting(key, value) {
  try {
    // 1) Script Properties（高頻度参照用キャッシュ）
    PropertiesService.getScriptProperties().setProperty(key, String(value));

    // 2) システム設定シート（人間が見る診断用）
    var sheetName = CONSTANTS.SHEET.SETTINGS;
    var keyCol   = getColIndex(sheetName, CONSTANTS.HEADER_SETTINGS.KEY);
    var valueCol = getColIndex(sheetName, CONSTANTS.HEADER_SETTINGS.VALUE);
    if (keyCol === -1 || valueCol === -1) {
      throw new Error('システム設定シートのヘッダーが見つかりません');
    }

    // 既存キーがあれば値だけ更新、無ければ新規行を追加
    var rowIndex = findRowIndexById(sheetName, keyCol, key);
    if (rowIndex !== -1) {
      updateCell(sheetName, rowIndex, valueCol, String(value));
    } else {
      // キー列と値列の位置に合わせて行配列を組む
      var maxCol = Math.max(keyCol, valueCol);
      var row = [];
      for (var i = 0; i < maxCol; i++) row.push('');
      row[keyCol - 1]   = key;
      row[valueCol - 1] = String(value);
      appendRow(sheetName, row);
    }
  } catch (e) {
    Logger.log('_saveSetting エラー: ' + e.toString());
    throw e;
  }
}

// =============================================
// 【内部】WEB_APP_URLを読み出す
// Script Properties を優先、無ければシステム設定シートから検索
// =============================================
function _loadWebAppUrl() {
  try {
    // 1) Script Properties から
    var url = PropertiesService.getScriptProperties().getProperty(CONSTANTS.SETTINGS_KEY.WEB_APP_URL);
    if (url) return url;

    // 2) システム設定シートを走査
    var sheetName = CONSTANTS.SHEET.SETTINGS;
    var rows = getAllRows(sheetName);
    for (var i = 0; i < rows.length; i++) {
      var k = getValueByHeader(rows[i], sheetName, CONSTANTS.HEADER_SETTINGS.KEY);
      if (k === CONSTANTS.SETTINGS_KEY.WEB_APP_URL) {
        var v = getValueByHeader(rows[i], sheetName, CONSTANTS.HEADER_SETTINGS.VALUE);
        if (v) return String(v);
      }
    }
    return null;
  } catch (e) {
    Logger.log('_loadWebAppUrl エラー: ' + e.toString());
    throw e;
  }
}
