// =============================================
// 【NoticeService.gs】おたより管理（F-07 F-08 F-17）
// おたよりの登録・一覧取得・削除を提供するサービス層
// google.script.run 経由でフロントから呼ばれる
//
// 設計方針：
//   - Drive保存は DriveService.saveFile() に委譲（責務分離）
//   - 列番号はハードコードせず getColIndex でヘッダー名から動的に取得
//   - 全関数 try-catch で Logger.log + rethrow
//   - PINNED は 'true'/'false' の文字列で管理（CLAUDE.md §6準拠）
//   - CREATED_AT は 'YYYY-MM-DD HH:mm:ss' 文字列で保存・辞書順=時系列順を利用
// =============================================

// =============================================
// 【追加】おたよりを新規登録する
// 引数：
//   childId   （文字列・例：'child_001'）
//   childName （文字列・例：'長男'）
//   yearMonth （文字列・'YYYY-MM'形式）
//   base64Data（文字列・data URL or 純base64）
//   mimeType  （文字列・例：'image/png' / 'application/pdf'）
//   fileName  （文字列・例：'IMG_1234.png'）
//   title     （文字列・任意・省略可・T-33）
// 戻り値：登録した noticeId（文字列）
// =============================================
function addNotice(childId, childName, yearMonth, base64Data, mimeType, fileName, title) {
  try {
    var sheetName = CONSTANTS.SHEET.NOTICES;

    // バリデーション：必須項目チェック
    if (!childId)    throw new Error('子どもIDが指定されていません');
    if (!childName)  throw new Error('子ども名が指定されていません');
    if (!yearMonth)  throw new Error('対象年月が指定されていません');
    if (!base64Data) throw new Error('ファイルデータが指定されていません');
    if (!mimeType)   throw new Error('ファイル種別（MIMEタイプ）が指定されていません');
    if (!fileName)   throw new Error('ファイル名が指定されていません');

    // mimeType から FILE_TYPE を判定（image/* と application/pdf のみ許容）
    var fileType;
    if (String(mimeType).indexOf('image/') === 0) {
      fileType = CONSTANTS.FILE.TYPE_IMAGE;
    } else if (mimeType === CONSTANTS.FILE.PDF_MIME_TYPE) {
      fileType = CONSTANTS.FILE.TYPE_PDF;
    } else {
      throw new Error('対応していないファイル形式です: ' + mimeType);
    }

    // Drive にファイルを保存（サイズ検証等は DriveService 内で実施）
    var drive = saveFile(base64Data, mimeType, fileName, childName, yearMonth);

    // ID採番と登録日時生成
    var noticeId = generateNoticeId();
    var createdAt = getFormattedDateTime();

    // ヘッダー位置を取得（NOTICESは13列・v2.0予約列含む）
    var col = {
      id:        getColIndex(sheetName, CONSTANTS.HEADER_NOTICES.ID),
      childId:   getColIndex(sheetName, CONSTANTS.HEADER_NOTICES.CHILD_ID),
      childName: getColIndex(sheetName, CONSTANTS.HEADER_NOTICES.CHILD_NAME),
      yearMonth: getColIndex(sheetName, CONSTANTS.HEADER_NOTICES.YEAR_MONTH),
      fileId:    getColIndex(sheetName, CONSTANTS.HEADER_NOTICES.FILE_ID),
      fileUrl:   getColIndex(sheetName, CONSTANTS.HEADER_NOTICES.FILE_URL),
      createdAt: getColIndex(sheetName, CONSTANTS.HEADER_NOTICES.CREATED_AT),
      fileType:  getColIndex(sheetName, CONSTANTS.HEADER_NOTICES.FILE_TYPE),
      pinned:    getColIndex(sheetName, CONSTANTS.HEADER_NOTICES.PINNED),
      summary:   getColIndex(sheetName, CONSTANTS.HEADER_NOTICES.SUMMARY),
      category:  getColIndex(sheetName, CONSTANTS.HEADER_NOTICES.CATEGORY),
      eventDate: getColIndex(sheetName, CONSTANTS.HEADER_NOTICES.EVENT_DATE),
      items:     getColIndex(sheetName, CONSTANTS.HEADER_NOTICES.ITEMS)
    };

    // ヘッダー欠落チェック（必須列が一つでも欠けていればセットアップ未完）
    for (var k in col) {
      if (col.hasOwnProperty(k) && col[k] === -1) {
        throw new Error('おたより一覧シートのヘッダーが見つかりません: ' + k);
      }
    }

    // TITLE列は任意列：存在すれば書き込む、-1 でも throw しない（T-33・グレースフル）
    var titleCol = getColIndex(sheetName, CONSTANTS.HEADER_NOTICES.TITLE);
    var titleStr = String(title || '').trim();

    // 行配列を組み立てる（最大列数まで空文字で埋め、ヘッダー位置に値を配置）
    var maxCol = 0;
    for (var k2 in col) {
      if (col.hasOwnProperty(k2) && col[k2] > maxCol) maxCol = col[k2];
    }
    // TITLE列が存在する場合は maxCol に含める
    if (titleCol !== -1 && titleCol > maxCol) maxCol = titleCol;

    var row = [];
    for (var i = 0; i < maxCol; i++) row.push('');

    row[col.id - 1]        = noticeId;
    row[col.childId - 1]   = childId;
    row[col.childName - 1] = childName;
    row[col.yearMonth - 1] = yearMonth;
    row[col.fileId - 1]    = drive.fileId;
    row[col.fileUrl - 1]   = drive.fileUrl;
    row[col.createdAt - 1] = createdAt;
    row[col.fileType - 1]  = fileType;
    row[col.pinned - 1]    = 'false';  // CLAUDE.md §6準拠：ピン留め未設定は'false'文字列
    row[col.summary - 1]   = '';       // v2.0予約
    row[col.category - 1]  = '';       // v2.0予約
    row[col.eventDate - 1] = '';       // v2.0予約
    row[col.items - 1]     = '';       // v2.0予約

    // TITLE列が存在する場合のみ書き込み（未マイグレーション環境でも保存は成功させる）
    if (titleCol !== -1) {
      row[titleCol - 1] = titleStr;
    }

    // シートに追記（失敗時はDriveファイルが残るがthrowで上位に伝播）
    appendRow(sheetName, row);

    return noticeId;
  } catch (e) {
    Logger.log('addNotice エラー: ' + e.toString());
    throw e;
  }
}

// =============================================
// 【一覧取得】おたよりを取得（子ども絞り込み or 全件）
// 引数：childId（文字列・null/undefined/'' なら全件取得）
// 戻り値：オブジェクト配列（CREATED_AT 降順）
// =============================================
function getNotices(childId) {
  try {
    var sheetName = CONSTANTS.SHEET.NOTICES;
    var rows = getAllRows(sheetName);
    if (rows.length === 0) return [];

    // childId フィルタの有無を判定（空文字も全件扱い）
    var filterChildId = (childId === undefined || childId === null) ? '' : String(childId).trim();
    var doFilter = (filterChildId !== '');

    // ヘッダー位置を1回だけ取得（毎行で getValueByHeader を呼ぶより高速）
    var col = {
      id:        getColIndex(sheetName, CONSTANTS.HEADER_NOTICES.ID),
      childId:   getColIndex(sheetName, CONSTANTS.HEADER_NOTICES.CHILD_ID),
      childName: getColIndex(sheetName, CONSTANTS.HEADER_NOTICES.CHILD_NAME),
      yearMonth: getColIndex(sheetName, CONSTANTS.HEADER_NOTICES.YEAR_MONTH),
      fileId:    getColIndex(sheetName, CONSTANTS.HEADER_NOTICES.FILE_ID),
      fileUrl:   getColIndex(sheetName, CONSTANTS.HEADER_NOTICES.FILE_URL),
      createdAt: getColIndex(sheetName, CONSTANTS.HEADER_NOTICES.CREATED_AT),
      fileType:  getColIndex(sheetName, CONSTANTS.HEADER_NOTICES.FILE_TYPE),
      pinned:    getColIndex(sheetName, CONSTANTS.HEADER_NOTICES.PINNED),
      summary:   getColIndex(sheetName, CONSTANTS.HEADER_NOTICES.SUMMARY),
      category:  getColIndex(sheetName, CONSTANTS.HEADER_NOTICES.CATEGORY),
      eventDate: getColIndex(sheetName, CONSTANTS.HEADER_NOTICES.EVENT_DATE),
      items:     getColIndex(sheetName, CONSTANTS.HEADER_NOTICES.ITEMS)
    };
    for (var k in col) {
      if (col.hasOwnProperty(k) && col[k] === -1) {
        throw new Error('おたより一覧シートのヘッダーが見つかりません: ' + k);
      }
    }

    // TITLE列は任意列：存在すれば値取得、-1 でも throw しない（T-33・グレースフル）
    var titleCol = getColIndex(sheetName, CONSTANTS.HEADER_NOTICES.TITLE);

    var result = [];
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];

      // 空行ガード：ID が空の行は除外
      var rawId = r[col.id - 1];
      var idStr = (rawId === undefined || rawId === null) ? '' : String(rawId).trim();
      if (idStr === '') continue;

      // 子ども絞り込み：CHILD_ID が一致する行のみ採用
      var rowChildId = String(r[col.childId - 1] || '').trim();
      if (doFilter && rowChildId !== filterChildId) continue;

      // CREATED_AT が万一 Date型で残っていた場合の防御（基本は文字列保存）
      var rawCreatedAt = r[col.createdAt - 1];
      var createdAtStr;
      if (rawCreatedAt instanceof Date) {
        var d = rawCreatedAt;
        createdAtStr = d.getFullYear() + '-' +
          _pad2(d.getMonth() + 1) + '-' + _pad2(d.getDate()) + ' ' +
          _pad2(d.getHours()) + ':' + _pad2(d.getMinutes()) + ':' + _pad2(d.getSeconds());
      } else {
        createdAtStr = String(rawCreatedAt || '');
      }

      // YEAR_MONTH が万一 Date型で残っていた場合の防御（基本は'YYYY-MM'文字列保存）
      var rawYm = r[col.yearMonth - 1];
      var yearMonthStr;
      if (rawYm instanceof Date) {
        var y = rawYm.getFullYear();
        var mo = String(rawYm.getMonth() + 1);
        while (mo.length < 2) mo = '0' + mo;
        yearMonthStr = y + '-' + mo;
      } else {
        yearMonthStr = String(rawYm || '');
      }

      // title（列未存在 or 空セルは空文字・T-33）
      var titleStr2 = '';
      if (titleCol !== -1) {
        var rawTitle = r[titleCol - 1];
        if (rawTitle !== undefined && rawTitle !== null) {
          titleStr2 = String(rawTitle).trim();
        }
      }

      result.push({
        id:        idStr,
        childId:   rowChildId,
        childName: String(r[col.childName - 1] || ''),
        yearMonth: yearMonthStr,
        fileId:    String(r[col.fileId - 1] || ''),
        fileUrl:   String(r[col.fileUrl - 1] || ''),
        createdAt: createdAtStr,
        fileType:  String(r[col.fileType - 1] || ''),
        pinned:    String(r[col.pinned - 1] || 'false'),
        summary:   String(r[col.summary - 1] || ''),
        category:  String(r[col.category - 1] || ''),
        eventDate: String(r[col.eventDate - 1] || ''),
        items:     String(r[col.items - 1] || ''),
        title:     titleStr2
      });
    }

    // CREATED_AT 降順ソート（'YYYY-MM-DD HH:mm:ss' は辞書順=時系列順）
    result.sort(function(a, b) {
      if (a.createdAt < b.createdAt) return 1;
      if (a.createdAt > b.createdAt) return -1;
      return 0;
    });

    return result;
  } catch (e) {
    Logger.log('getNotices エラー: ' + e.toString());
    throw e;
  }
}

// =============================================
// 【削除】おたよりを削除する（シート行＋Driveファイル）
// 引数：noticeId（文字列）
// 戻り値：true
// 注：Driveファイル削除は失敗を許容（既に手動削除済み・権限喪失等）
//     Drive側は setTrashed でゴミ箱送り（30日復元可能）
// =============================================
function deleteNotice(noticeId) {
  try {
    var sheetName = CONSTANTS.SHEET.NOTICES;

    // バリデーション
    if (!noticeId) throw new Error('noticeIdが指定されていません');

    // ヘッダー位置を取得
    var idCol     = getColIndex(sheetName, CONSTANTS.HEADER_NOTICES.ID);
    var fileIdCol = getColIndex(sheetName, CONSTANTS.HEADER_NOTICES.FILE_ID);
    if (idCol === -1 || fileIdCol === -1) {
      throw new Error('おたより一覧シートのヘッダーが見つかりません');
    }

    // 対象行を特定（見つからなければ throw）
    var rowIndex = findRowIndexById(sheetName, idCol, noticeId);
    if (rowIndex === -1) throw new Error('指定IDが見つかりません: ' + noticeId);

    // 対象行から FILE_ID を取得（Drive削除に使用）
    var sheet = getSheet(sheetName);
    var fileId = String(sheet.getRange(rowIndex, fileIdCol).getValue() || '').trim();

    // Driveファイルをゴミ箱送り（失敗してもログのみで握りつぶす）
    if (fileId) {
      try {
        DriveApp.getFileById(fileId).setTrashed(true);
      } catch (errDrive) {
        Logger.log('deleteNotice Drive削除失敗（無視）: ' + errDrive.toString());
      }
    }

    // シート行を物理削除
    deleteRow(sheetName, rowIndex);

    return true;
  } catch (e) {
    Logger.log('deleteNotice エラー: ' + e.toString());
    throw e;
  }
}

// =============================================
// 【更新】おたよりのピン留め状態を変更する（T-25 / F-16）
// 引数：
//   noticeId （文字列・例：'notice_001'）
//   pinned   （真偽値・true=ピン留め／false=解除）
// 戻り値：true
// 注：PINNED 列には 'true'/'false' の文字列で保存する（CLAUDE.md §6準拠）
// =============================================
function updateNoticePin(noticeId, pinned) {
  try {
    var sheetName = CONSTANTS.SHEET.NOTICES;

    // バリデーション
    if (!noticeId) throw new Error('noticeIdが指定されていません');

    // ヘッダー位置を取得（ID列とピン留め列が必要）
    var idCol     = getColIndex(sheetName, CONSTANTS.HEADER_NOTICES.ID);
    var pinnedCol = getColIndex(sheetName, CONSTANTS.HEADER_NOTICES.PINNED);
    if (idCol === -1 || pinnedCol === -1) {
      throw new Error('おたより一覧シートのヘッダーが見つかりません');
    }

    // 対象行を特定（見つからなければ throw）
    var rowIndex = findRowIndexById(sheetName, idCol, noticeId);
    if (rowIndex === -1) throw new Error('指定IDが見つかりません: ' + noticeId);

    // PINNED 列を 'true'/'false' 文字列で書き込み
    updateCell(sheetName, rowIndex, pinnedCol, pinned ? 'true' : 'false');

    return true;
  } catch (e) {
    Logger.log('updateNoticePin エラー: ' + e.toString());
    throw e;
  }
}

// =============================================
// 【更新】おたよりのタイトルを変更する（T-33b）
// 引数：
//   noticeId（文字列・例：'notice_001'）
//   title   （文字列・空文字許容＝タイトル削除と同義）
// 戻り値：true
// 注：TITLE列が無い場合は再セットアップ案内をthrow（updateChildColor と同方針）
// =============================================
function updateNoticeTitle(noticeId, title) {
  try {
    var sheetName = CONSTANTS.SHEET.NOTICES;

    // バリデーション
    if (!noticeId) throw new Error('noticeIdが指定されていません');

    // ヘッダー位置を取得（ID列とTITLE列が必要）
    var idCol    = getColIndex(sheetName, CONSTANTS.HEADER_NOTICES.ID);
    var titleCol = getColIndex(sheetName, CONSTANTS.HEADER_NOTICES.TITLE);
    if (idCol === -1)    throw new Error('おたより一覧シートのIDヘッダーが見つかりません');
    if (titleCol === -1) throw new Error('「タイトル」列が見つかりません。設定画面の「再セットアップを実行する」を行ってください');

    // 対象行を特定（見つからなければ throw）
    var rowIndex = findRowIndexById(sheetName, idCol, noticeId);
    if (rowIndex === -1) throw new Error('指定IDが見つかりません: ' + noticeId);

    // TITLE 列を空文字含む文字列で書き込み（空保存＝タイトル削除）
    var titleStr = String(title || '').trim();
    updateCell(sheetName, rowIndex, titleCol, titleStr);

    return true;
  } catch (e) {
    Logger.log('updateNoticeTitle エラー: ' + e.toString());
    throw e;
  }
}

// =============================================
// 【内部】おたよりIDを生成する
// NOTICESシートのID列を走査して最大連番+1の 'notice_NNN' を返す
// 列特定は getColIndex で動的に行うため列が前後しても壊れない
// =============================================
function generateNoticeId() {
  try {
    var sheetName = CONSTANTS.SHEET.NOTICES;
    var idCol = getColIndex(sheetName, CONSTANTS.HEADER_NOTICES.ID);
    if (idCol === -1) throw new Error('IDヘッダーが見つかりません');

    var sheet = getSheet(sheetName);
    var last = sheet.getLastRow();
    var maxNum = 0;
    if (last >= 2) {
      // ID列のみを走査（全列読みは不要）
      var ids = sheet.getRange(2, idCol, last - 1, 1).getValues();
      var re = /^notice_(\d+)$/;
      for (var i = 0; i < ids.length; i++) {
        var m = String(ids[i][0]).match(re);
        if (m) {
          var n = parseInt(m[1], 10);
          if (n > maxNum) maxNum = n;
        }
      }
    }

    // 3桁ゼロ埋め（ES5互換のため padStart 不使用）
    var s = String(maxNum + 1);
    while (s.length < 3) s = '0' + s;
    return 'notice_' + s;
  } catch (e) {
    Logger.log('generateNoticeId エラー: ' + e.toString());
    throw e;
  }
}
