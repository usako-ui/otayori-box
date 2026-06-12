// =============================================
// 【ChildService.gs】子ども管理（F-03 F-04 F-05）
// 子どもの追加・編集・削除・一覧取得を提供する
// google.script.run 経由でフロントから呼ばれる
//
// 設計方針：
//   - 列番号はハードコードせず getColIndex でヘッダー名から動的に取得
//   - addChild / updateChild / deleteChild は最終的に getChildren() を返す
//   - 全関数 try-catch で Logger.log + rethrow
// =============================================

// =============================================
// 【一覧取得】子どもをorder昇順で全件返す
// 戻り値：[{id, name, order, createdDate}, ...]
// =============================================
function getChildren() {
  try {
    var sheetName = CONSTANTS.SHEET.CHILDREN;
    var rows = getAllRows(sheetName);
    if (rows.length === 0) return [];

    // ヘッダー位置を1回だけ取得（毎行で getValueByHeader を呼ぶより高速）
    var idCol     = getColIndex(sheetName, CONSTANTS.HEADER_CHILDREN.ID);
    var nameCol   = getColIndex(sheetName, CONSTANTS.HEADER_CHILDREN.NAME);
    var orderCol  = getColIndex(sheetName, CONSTANTS.HEADER_CHILDREN.ORDER);
    var dateCol   = getColIndex(sheetName, CONSTANTS.HEADER_CHILDREN.CREATED_DATE);
    var avatarCol = getColIndex(sheetName, CONSTANTS.HEADER_CHILDREN.AVATAR);
    var colorCol  = getColIndex(sheetName, CONSTANTS.HEADER_CHILDREN.COLOR);
    if (idCol === -1 || nameCol === -1 || orderCol === -1 || dateCol === -1) {
      throw new Error('子ども一覧シートのヘッダーが見つかりません');
    }
    // AVATAR列・COLOR列は未マイグレーション環境を許容するため -1 でも throw しない

    var result = [];
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      var rawId   = r[idCol - 1];
      var rawName = r[nameCol - 1];

      // 空行・不完全行を除外（id と name が両方とも有効な行のみ採用）
      var idStr   = (rawId   === undefined || rawId   === null) ? '' : String(rawId).trim();
      var nameStr = (rawName === undefined || rawName === null) ? '' : String(rawName).trim();
      if (idStr === '' || nameStr === '') continue;

      // createdDate が Date型なら「YYYY-MM-DD」文字列に変換
      var rawDate = r[dateCol - 1];
      var createdDate = '';
      if (rawDate instanceof Date) {
        var y = rawDate.getFullYear();
        var m = String(rawDate.getMonth() + 1).padStart(2, '0');
        var d = String(rawDate.getDate()).padStart(2, '0');
        createdDate = y + '-' + m + '-' + d;
      } else {
        createdDate = String(rawDate);
      }

      // avatarFileId（列が無い場合や空セルは空文字）
      var avatarFileId = '';
      if (avatarCol !== -1) {
        var rawAvatar = r[avatarCol - 1];
        if (rawAvatar !== undefined && rawAvatar !== null) {
          avatarFileId = String(rawAvatar).trim();
        }
      }

      // color（列が無い場合や空セルは空文字・後段で index 偶奇のデフォルトを適用）
      var color = '';
      if (colorCol !== -1) {
        var rawColor = r[colorCol - 1];
        if (rawColor !== undefined && rawColor !== null) {
          color = String(rawColor).trim();
        }
      }

      result.push({
        id:           idStr,
        name:         nameStr,
        order:        Number(r[orderCol - 1]),
        createdDate:  createdDate,
        avatarFileId: avatarFileId,
        color:        color
      });
    }

    // order 昇順でソート（NaNは末尾扱い）
    result.sort(function(a, b) {
      var oa = isNaN(a.order) ? Infinity : a.order;
      var ob = isNaN(b.order) ? Infinity : b.order;
      return oa - ob;
    });

    // 未設定（空文字）の color にデフォルトを適用：order ソート後の index 偶奇で青/桜を交互
    // 偶数 index → 青（#4D96FF）、奇数 index → 桜（#FFB7C5）
    for (var k = 0; k < result.length; k++) {
      if (!result[k].color) {
        result[k].color = (k % 2 === 0) ? '#4D96FF' : '#FFB7C5';
      }
    }

    return result;
  } catch (e) {
    Logger.log('getChildren エラー: ' + e.toString());
    throw e;
  }
}

// =============================================
// 【追加】子どもを新規登録する
// 引数：name（文字列）
// 戻り値：getChildren() の結果（登録後の全件）
// バリデーション：空名前・登録上限（MAX_CHILDREN）
// =============================================
function addChild(name) {
  try {
    var sheetName = CONSTANTS.SHEET.CHILDREN;

    // バリデーション：名前（trim後に空ならエラー）
    var trimmed = String(name || '').trim();
    if (trimmed === '') {
      throw new Error('子ども名が入力されていません');
    }

    // バリデーション：登録上限（MAX_CHILDREN = 10）
    var existing = getChildren();
    if (existing.length >= CONSTANTS.APP.MAX_CHILDREN) {
      throw new Error('登録上限（' + CONSTANTS.APP.MAX_CHILDREN + '人）に達しています');
    }

    // 表示順 = 現在の最大 + 1（0件なら1）
    var maxOrder = 0;
    for (var i = 0; i < existing.length; i++) {
      var o = existing[i].order;
      if (!isNaN(o) && o > maxOrder) maxOrder = o;
    }
    var newOrder = maxOrder + 1;

    // ヘッダー位置を取得
    var idCol    = getColIndex(sheetName, CONSTANTS.HEADER_CHILDREN.ID);
    var nameCol  = getColIndex(sheetName, CONSTANTS.HEADER_CHILDREN.NAME);
    var orderCol = getColIndex(sheetName, CONSTANTS.HEADER_CHILDREN.ORDER);
    var dateCol  = getColIndex(sheetName, CONSTANTS.HEADER_CHILDREN.CREATED_DATE);
    if (idCol === -1 || nameCol === -1 || orderCol === -1 || dateCol === -1) {
      throw new Error('子ども一覧シートのヘッダーが見つかりません');
    }

    // 行配列を組み立てる（ヘッダー位置に合わせて値を配置）
    var maxCol = Math.max(idCol, nameCol, orderCol, dateCol);
    var row = [];
    for (var j = 0; j < maxCol; j++) row.push('');
    row[idCol - 1]    = generateChildId();
    row[nameCol - 1]  = trimmed;
    row[orderCol - 1] = newOrder;
    row[dateCol - 1]  = getFormattedDate();

    appendRow(sheetName, row);
    return getChildren();
  } catch (e) {
    Logger.log('addChild エラー: ' + e.toString());
    throw e;
  }
}

// =============================================
// 【更新】子どもの名前・表示順を変更する
// 引数：id（文字列）, name（文字列）, order（数値）
// 戻り値：getChildren() の結果
// 注：登録日は変更しない（履歴情報のため）
// =============================================
function updateChild(id, name, order) {
  try {
    var sheetName = CONSTANTS.SHEET.CHILDREN;

    // バリデーション
    if (!id) throw new Error('IDが指定されていません');
    var trimmed = String(name || '').trim();
    if (trimmed === '') throw new Error('子ども名が入力されていません');
    var orderNum = Number(order);
    if (order === undefined || order === null || order === '' || isNaN(orderNum)) {
      throw new Error('表示順が指定されていません');
    }

    // ヘッダー位置を取得
    var idCol    = getColIndex(sheetName, CONSTANTS.HEADER_CHILDREN.ID);
    var nameCol  = getColIndex(sheetName, CONSTANTS.HEADER_CHILDREN.NAME);
    var orderCol = getColIndex(sheetName, CONSTANTS.HEADER_CHILDREN.ORDER);
    if (idCol === -1 || nameCol === -1 || orderCol === -1) {
      throw new Error('子ども一覧シートのヘッダーが見つかりません');
    }

    // 対象行を特定
    var rowIndex = findRowIndexById(sheetName, idCol, id);
    if (rowIndex === -1) throw new Error('指定IDが見つかりません: ' + id);

    // 名前と表示順のみ更新
    updateCell(sheetName, rowIndex, nameCol, trimmed);
    updateCell(sheetName, rowIndex, orderCol, orderNum);

    return getChildren();
  } catch (e) {
    Logger.log('updateChild エラー: ' + e.toString());
    throw e;
  }
}

// =============================================
// 【削除】子どもを削除する
// 引数：id（文字列）
// 戻り値：getChildren() の結果
// 注：確認ダイアログはフロント側で実装する（GAS側は行削除のみ）
// 注：その子のおたより行・Driveサブフォルダは無干渉（孤立状態で残る）
//     フロント側の確認ダイアログに「この子のおたよりデータは削除されません」を併記すること
// =============================================
function deleteChild(id) {
  try {
    var sheetName = CONSTANTS.SHEET.CHILDREN;

    if (!id) throw new Error('IDが指定されていません');

    var idCol = getColIndex(sheetName, CONSTANTS.HEADER_CHILDREN.ID);
    if (idCol === -1) throw new Error('子ども一覧シートのIDヘッダーが見つかりません');

    var rowIndex = findRowIndexById(sheetName, idCol, id);
    if (rowIndex === -1) throw new Error('指定IDが見つかりません: ' + id);

    deleteRow(sheetName, rowIndex);
    return getChildren();
  } catch (e) {
    Logger.log('deleteChild エラー: ' + e.toString());
    throw e;
  }
}

// =============================================
// 【アバター更新】子どものアバター画像を保存（Drive）し、AVATARセルにfileIdを記録
// 引数：
//   childId（文字列）
//   base64Data（文字列・data URL形式 or 純base64）
//   mimeType（文字列・例：'image/jpeg'）
// 戻り値：{ fileId, dataUrl } ※dataUrl は呼び出し元の即時プレビュー更新用
// 注：既存アバターがあれば古いファイルをゴミ箱に移動（失敗してもメイン成功扱い・ログのみ）
// =============================================
function updateChildAvatar(childId, base64Data, mimeType) {
  try {
    if (!childId)    throw new Error('IDが指定されていません');
    if (!base64Data) throw new Error('画像データが指定されていません');
    if (!mimeType)   throw new Error('画像種別（MIMEタイプ）が指定されていません');

    var sheetName = CONSTANTS.SHEET.CHILDREN;

    var idCol     = getColIndex(sheetName, CONSTANTS.HEADER_CHILDREN.ID);
    var avatarCol = getColIndex(sheetName, CONSTANTS.HEADER_CHILDREN.AVATAR);
    if (idCol === -1)     throw new Error('子ども一覧シートのIDヘッダーが見つかりません');
    if (avatarCol === -1) throw new Error('「アバター」列が見つかりません。設定画面の「再セットアップを実行する」を行ってください');

    // 対象行を特定
    var rowIndex = findRowIndexById(sheetName, idCol, childId);
    if (rowIndex === -1) throw new Error('指定IDが見つかりません: ' + childId);

    // 既存アバター fileId を取得（後でゴミ箱へ）
    var sheet = getSheet(sheetName);
    var oldFileId = String(sheet.getRange(rowIndex, avatarCol).getValue() || '').trim();

    // 拡張子推定（mimeType → ext）
    var ext = 'png';
    if      (mimeType === 'image/jpeg') ext = 'jpg';
    else if (mimeType === 'image/png')  ext = 'png';
    else if (mimeType === 'image/heic') ext = 'heic';
    else if (mimeType === 'image/heif') ext = 'heif';

    // タイムスタンプ込みのファイル名（重複防止）
    var ts = getFormattedDateTime().replace(/[\s:\-]/g, '');
    var fileName = String(childId) + '_' + ts + '.' + ext;

    // Drive に保存（avatars フォルダ配下）
    var saved = saveAvatarFile(base64Data, mimeType, fileName);

    // シートの AVATAR セルを新 fileId で更新
    updateCell(sheetName, rowIndex, avatarCol, saved.fileId);

    // 旧アバターをゴミ箱へ（メイン処理成功後の後始末・失敗は許容）
    if (oldFileId && oldFileId !== saved.fileId) {
      try {
        DriveApp.getFileById(oldFileId).setTrashed(true);
      } catch (eTrash) {
        Logger.log('updateChildAvatar 旧アバター削除失敗（無視）: ' + eTrash.toString());
      }
    }

    // dataUrl 構築（呼び出し元のフロントが即時プレビュー更新できるよう、入力 base64 をそのまま返す）
    var pureBase64 = String(base64Data);
    var idx = pureBase64.indexOf(',');
    if (pureBase64.indexOf('data:') === 0 && idx !== -1) {
      pureBase64 = pureBase64.substring(idx + 1);
    }
    var dataUrl = 'data:' + mimeType + ';base64,' + pureBase64;

    return {
      fileId:  saved.fileId,
      dataUrl: dataUrl
    };
  } catch (e) {
    Logger.log('updateChildAvatar エラー: ' + e.toString());
    throw e;
  }
}

// =============================================
// 【アバター取得】指定子どもの fileId を参照し、画像 dataUrl を返す
// 引数：childId（文字列）
// 戻り値：dataUrl（文字列）または null
// 注：throw せず null 返却で「未設定扱い」とする
//     getNoticeImage(fileId) と同じ方法（Blob → base64）で取得
// =============================================
function getChildAvatar(childId) {
  try {
    if (!childId) return null;

    var sheetName = CONSTANTS.SHEET.CHILDREN;
    var idCol     = getColIndex(sheetName, CONSTANTS.HEADER_CHILDREN.ID);
    var avatarCol = getColIndex(sheetName, CONSTANTS.HEADER_CHILDREN.AVATAR);
    if (idCol === -1 || avatarCol === -1) return null;

    var rowIndex = findRowIndexById(sheetName, idCol, childId);
    if (rowIndex === -1) return null;

    var fileId = String(getSheet(sheetName).getRange(rowIndex, avatarCol).getValue() || '').trim();
    if (!fileId) return null;

    // 既存の getNoticeImage と同じ実装で dataUrl 化
    try {
      return getNoticeImage(fileId);
    } catch (eFile) {
      Logger.log('getChildAvatar Drive取得失敗（null返却）: ' + eFile.toString());
      return null;
    }
  } catch (e) {
    Logger.log('getChildAvatar エラー: ' + e.toString());
    return null;   // throw せず null 返却（UIを止めない）
  }
}

// =============================================
// 【カラー更新】子どものバッジカラーを更新する（T-32）
// 引数：
//   childId（文字列）
//   color（文字列・'#RRGGBB' 形式）
// 戻り値：{ success: true }
// 注：COLOR列が無い場合は再セットアップ案内をthrow
// =============================================
function updateChildColor(childId, color) {
  try {
    if (!childId) throw new Error('IDが指定されていません');

    // カラー形式チェック（#RRGGBB の6桁HEX固定）
    var colorStr = String(color || '').trim();
    if (!/^#[0-9A-Fa-f]{6}$/.test(colorStr)) {
      throw new Error('カラー値が不正です（#RRGGBB 形式で指定してください）');
    }

    var sheetName = CONSTANTS.SHEET.CHILDREN;

    var idCol    = getColIndex(sheetName, CONSTANTS.HEADER_CHILDREN.ID);
    var colorCol = getColIndex(sheetName, CONSTANTS.HEADER_CHILDREN.COLOR);
    if (idCol === -1)    throw new Error('子ども一覧シートのIDヘッダーが見つかりません');
    if (colorCol === -1) throw new Error('「バッジカラー」列が見つかりません。設定画面の「再セットアップを実行する」を行ってください');

    // 対象行を特定
    var rowIndex = findRowIndexById(sheetName, idCol, childId);
    if (rowIndex === -1) throw new Error('指定IDが見つかりません: ' + childId);

    // COLOR セル更新
    updateCell(sheetName, rowIndex, colorCol, colorStr);

    return { success: true };
  } catch (e) {
    Logger.log('updateChildColor エラー: ' + e.toString());
    throw e;
  }
}

// =============================================
// 【内部】子どもIDを生成する
// CHILDRENシートのID列を走査して最大連番+1の 'child_NNN' を返す
// 列特定は getColIndex で動的に行うため列が前後しても壊れない
// =============================================
function generateChildId() {
  try {
    var sheetName = CONSTANTS.SHEET.CHILDREN;
    var idCol = getColIndex(sheetName, CONSTANTS.HEADER_CHILDREN.ID);
    if (idCol === -1) throw new Error('IDヘッダーが見つかりません');

    var sheet = getSheet(sheetName);
    var last = sheet.getLastRow();
    var maxNum = 0;
    if (last >= 2) {
      // ID列のみを走査（全列読みは不要）
      var ids = sheet.getRange(2, idCol, last - 1, 1).getValues();
      var re = /^child_(\d+)$/;
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
    return 'child_' + s;
  } catch (e) {
    Logger.log('generateChildId エラー: ' + e.toString());
    throw e;
  }
}
