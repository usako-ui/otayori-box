// =============================================
// 【DriveService.gs】Driveフォルダ・ファイル操作（F-07）
// おたよりの画像・PDFを「子ども別／月別」フォルダに保存する基盤層
// google.script.run 経由ではなく NoticeService.gs（T-10）から呼ばれる
//
// 設計方針：
//   - ルートフォルダは Setup.gs（T-03）で作成済み・Script Properties に ID 保管
//   - 子どもフォルダ・月フォルダは「無ければ作る」遅延作成
//   - 重複フォルダがある場合は1件目を採用（厳密一意は保証しない）
//   - 全関数 try-catch で Logger.log + rethrow
//
// Drive構成：
//   おたよりBOX/
//   └── 長男/
//       └── 2026-06/
//           └── 2026-06-09_142503.png
// =============================================

// =============================================
// 【ルート取得】Script Properties からルートフォルダを取得
// 引数：なし
// 戻り値：DriveApp.Folder（おたよりBOXフォルダ）
// 例外：未セットアップ・フォルダ削除・権限喪失時は throw
// =============================================
function getRootFolder() {
  try {
    // Script Properties から ID を取得（高頻度参照のためキャッシュ層を利用）
    var props = PropertiesService.getScriptProperties();
    var rootId = props.getProperty(CONSTANTS.PROP_KEY.ROOT_FOLDER_ID);

    // 未セットアップガード：初回セットアップ未実施の状態を明示的に通知
    if (!rootId) {
      throw new Error('初回セットアップが未実施です。スプレッドシートのメニューから「初回セットアップ実行」を行ってください。');
    }

    // ID からフォルダを取得。削除済み・権限喪失の場合は DriveApp が例外を投げる
    try {
      return DriveApp.getFolderById(rootId);
    } catch (errFolder) {
      throw new Error('ルートフォルダ「' + CONSTANTS.DRIVE.ROOT_FOLDER_NAME + '」が見つかりません。再セットアップしてください。');
    }
  } catch (e) {
    Logger.log('getRootFolder エラー: ' + e.toString());
    throw e;
  }
}

// =============================================
// 【子フォルダ取得or作成】ルート直下に「子ども名」フォルダを取得 or 作成
// 引数：childName（文字列・例：'長男'）
// 戻り値：DriveApp.Folder
// 構成：おたよりBOX/長男/
// =============================================
function getOrCreateChildFolder(childName) {
  try {
    // バリデーション：trim後に空ならエラー
    var name = String(childName || '').trim();
    if (name === '') {
      throw new Error('子ども名が指定されていません');
    }

    // ルートフォルダを取得（未セットアップ時はここで throw）
    var root = getRootFolder();

    // 既存フォルダを検索（同名複数あれば1件目を採用）
    var iter = root.getFoldersByName(name);
    if (iter.hasNext()) {
      return iter.next();
    }

    // 未作成 → 新規作成
    return root.createFolder(name);
  } catch (e) {
    Logger.log('getOrCreateChildFolder エラー: ' + e.toString());
    throw e;
  }
}

// =============================================
// 【月フォルダ取得or作成】子どもフォルダ直下に「YYYY-MM」フォルダを取得 or 作成
// 引数：childName（文字列）, yearMonth（文字列・'YYYY-MM'形式）
// 戻り値：DriveApp.Folder
// 構成：おたよりBOX/長男/2026-06/
// =============================================
function getOrCreateMonthFolder(childName, yearMonth) {
  try {
    // バリデーション：子ども名
    var name = String(childName || '').trim();
    if (name === '') {
      throw new Error('子ども名が指定されていません');
    }

    // バリデーション：年月は厳密に 'YYYY-MM' 形式
    var ym = String(yearMonth || '').trim();
    if (!/^\d{4}-\d{2}$/.test(ym)) {
      throw new Error('対象年月の形式が正しくありません（YYYY-MM形式で指定してください）: ' + ym);
    }

    // 子フォルダを取得（無ければ作成）
    var childFolder = getOrCreateChildFolder(name);

    // 月フォルダを検索（同名複数あれば1件目を採用）
    var iter = childFolder.getFoldersByName(ym);
    if (iter.hasNext()) {
      return iter.next();
    }

    // 未作成 → 新規作成
    return childFolder.createFolder(ym);
  } catch (e) {
    Logger.log('getOrCreateMonthFolder エラー: ' + e.toString());
    throw e;
  }
}

// =============================================
// 【アバター用フォルダ取得or作成】ルート直下に「avatars」フォルダを取得 or 作成
// 引数：なし
// 戻り値：DriveApp.Folder
// 構成：おたよりBOX/avatars/
// =============================================
function getOrCreateAvatarsFolder() {
  try {
    var root = getRootFolder();
    var name = CONSTANTS.DRIVE.AVATARS_FOLDER_NAME;
    var iter = root.getFoldersByName(name);
    if (iter.hasNext()) {
      return iter.next();
    }
    return root.createFolder(name);
  } catch (e) {
    Logger.log('getOrCreateAvatarsFolder エラー: ' + e.toString());
    throw e;
  }
}

// =============================================
// 【アバター保存】base64データを「avatars」フォルダに保存
// 引数：
//   base64Data（文字列・data URL形式 or 純base64）
//   mimeType  （文字列・例：'image/jpeg'）
//   fileName  （文字列・例：'child_001_20260601120000.jpg'）
// 戻り値：{ fileId, fileUrl }
// 注：saveFile() と処理は近いが、保存先が固定（子ども/月フォルダではない）ため別関数化
// =============================================
function saveAvatarFile(base64Data, mimeType, fileName) {
  try {
    if (!base64Data) throw new Error('ファイルデータが指定されていません');
    if (!mimeType)   throw new Error('ファイル種別（MIMEタイプ）が指定されていません');
    if (!fileName)   throw new Error('ファイル名が指定されていません');

    // data URL プレフィックス除去
    var pureBase64 = String(base64Data);
    var commaIdx = pureBase64.indexOf(',');
    if (pureBase64.indexOf('data:') === 0 && commaIdx !== -1) {
      pureBase64 = pureBase64.substring(commaIdx + 1);
    }

    // base64 → バイト配列
    var bytes = Utilities.base64Decode(pureBase64);

    // サイズ検証
    var maxBytes = CONSTANTS.APP.MAX_FILE_SIZE_MB * 1024 * 1024;
    if (bytes.length > maxBytes) {
      throw new Error('画像サイズが上限（' + CONSTANTS.APP.MAX_FILE_SIZE_MB + 'MB）を超えています');
    }

    // Blob 作成
    var blob = Utilities.newBlob(bytes, mimeType, String(fileName));

    // 保存先フォルダ取得 or 作成
    var folder = getOrCreateAvatarsFolder();

    // 保存
    var file = folder.createFile(blob);

    return {
      fileId:  file.getId(),
      fileUrl: file.getUrl()
    };
  } catch (e) {
    Logger.log('saveAvatarFile エラー: ' + e.toString());
    throw e;
  }
}

// =============================================
// 【ファイル保存】base64データをBlob化してDriveに保存
// 引数：
//   base64Data（文字列・data URL形式 or 純base64）
//   mimeType  （文字列・例：'image/png'）
//   fileName  （文字列・例：'2026-06-09_142503.png'）
//   childName （文字列・例：'長男'）
//   yearMonth （文字列・'YYYY-MM'形式）
// 戻り値：{ fileId, fileUrl }
// 例外：未入力・サイズ超過・Drive保存失敗時は throw
// =============================================
function saveFile(base64Data, mimeType, fileName, childName, yearMonth) {
  try {
    // バリデーション：必須項目チェック（trim前に存在チェック）
    if (!base64Data) throw new Error('ファイルデータが指定されていません');
    if (!mimeType)   throw new Error('ファイル種別（MIMEタイプ）が指定されていません');
    if (!fileName)   throw new Error('ファイル名が指定されていません');

    // childName / yearMonth のバリデーションは getOrCreateMonthFolder に委ねる

    // data URL プレフィックス除去（FileReader.readAsDataURL の出力に対応）
    // 例：'data:image/png;base64,iVBORw0...' → 'iVBORw0...'
    var pureBase64 = String(base64Data);
    var commaIdx = pureBase64.indexOf(',');
    if (pureBase64.indexOf('data:') === 0 && commaIdx !== -1) {
      pureBase64 = pureBase64.substring(commaIdx + 1);
    }

    // base64 → バイト配列にデコード
    var bytes = Utilities.base64Decode(pureBase64);

    // サイズ検証（バックエンド側の二重防御。フロント側は T-11 で実装）
    var maxBytes = CONSTANTS.APP.MAX_FILE_SIZE_MB * 1024 * 1024;
    if (bytes.length > maxBytes) {
      throw new Error('ファイルサイズが上限（' + CONSTANTS.APP.MAX_FILE_SIZE_MB + 'MB）を超えています');
    }

    // Blob を作成（ファイル名と MIMEタイプを指定）
    var blob = Utilities.newBlob(bytes, mimeType, String(fileName));

    // 保存先フォルダを取得 or 作成
    var folder = getOrCreateMonthFolder(childName, yearMonth);

    // Drive にファイル保存
    var file = folder.createFile(blob);

    // 呼び出し側（NoticeService）でシートに記録するための ID と URL を返す
    return {
      fileId:  file.getId(),
      fileUrl: file.getUrl()
    };
  } catch (e) {
    Logger.log('saveFile エラー: ' + e.toString());
    throw e;
  }
}
