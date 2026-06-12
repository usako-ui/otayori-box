// =============================================
// 【SpreadsheetService.gs】Spreadsheet操作共通処理
// 全シートのCRUD（取得・追加・更新・削除）をここに集約する
// シート名・列番号は必ず Constants.gs の値を参照すること
// =============================================

// =============================================
// 【シート取得】アクティブスプレッドシートを返す
// スクリプトはコンテナバインド前提（Setup.gsで初期化）
// 引数：なし
// 戻り値：Spreadsheetオブジェクト
// =============================================
function getSpreadsheet() {
  try {
    return SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {
    Logger.log('getSpreadsheet エラー: ' + e.toString());
    throw e;
  }
}

// =============================================
// 【シート取得】シート名からSheetオブジェクトを返す
// 引数：sheetName（文字列・CONSTANTS.SHEET.*）
// 戻り値：Sheetオブジェクト
// シートが見つからない場合はエラーをthrowする
// =============================================
function getSheet(sheetName) {
  try {
    var sheet = getSpreadsheet().getSheetByName(sheetName);
    if (!sheet) {
      throw new Error('シートが見つかりません: ' + sheetName);
    }
    return sheet;
  } catch (e) {
    Logger.log('getSheet エラー: ' + e.toString());
    throw e;
  }
}

// =============================================
// 【読込】ヘッダー行を除く全データ行を二次元配列で返す
// 引数：sheetName（文字列）
// 戻り値：二次元配列（0件時は []）
// =============================================
function getAllRows(sheetName) {
  try {
    var sheet = getSheet(sheetName);
    var last = sheet.getLastRow();
    // データ行が無い場合（ヘッダーのみ or 完全空）は空配列を返す
    if (last < 2) return [];
    var lastCol = sheet.getLastColumn();
    return sheet.getRange(2, 1, last - 1, lastCol).getValues();
  } catch (e) {
    Logger.log('getAllRows エラー: ' + e.toString());
    throw e;
  }
}

// =============================================
// 【検索】指定ID列を走査し、該当行番号（1-indexed）を返す
// 引数：sheetName（文字列）, idColIndex（数値・1-indexed）, idValue（文字列）
// 戻り値：行番号（数値・見つからなければ -1）
// =============================================
function findRowIndexById(sheetName, idColIndex, idValue) {
  try {
    var sheet = getSheet(sheetName);
    var last = sheet.getLastRow();
    if (last < 2) return -1;
    // ID列のみを縦に取得して走査する
    var ids = sheet.getRange(2, idColIndex, last - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(idValue)) {
        // ヘッダー分+1、配列0始まり分+1 → +2
        return i + 2;
      }
    }
    return -1;
  } catch (e) {
    Logger.log('findRowIndexById エラー: ' + e.toString());
    throw e;
  }
}

// =============================================
// 【書込】末尾に1行追加する
// 引数：sheetName（文字列）, rowArray（配列）
// 戻り値：なし
// =============================================
function appendRow(sheetName, rowArray) {
  try {
    getSheet(sheetName).appendRow(rowArray);
  } catch (e) {
    Logger.log('appendRow エラー: ' + e.toString());
    throw e;
  }
}

// =============================================
// 【更新】指定行を配列の値で上書きする
// 引数：sheetName（文字列）, rowIndex（数値・1-indexed）, rowArray（配列）
// 戻り値：なし
// =============================================
function updateRow(sheetName, rowIndex, rowArray) {
  try {
    var sheet = getSheet(sheetName);
    sheet.getRange(rowIndex, 1, 1, rowArray.length).setValues([rowArray]);
  } catch (e) {
    Logger.log('updateRow エラー: ' + e.toString());
    throw e;
  }
}

// =============================================
// 【更新】指定セルを1つだけ更新する
// 引数：sheetName（文字列）, rowIndex（数値）, colIndex（数値）, value（任意）
// 戻り値：なし
// =============================================
function updateCell(sheetName, rowIndex, colIndex, value) {
  try {
    getSheet(sheetName).getRange(rowIndex, colIndex).setValue(value);
  } catch (e) {
    Logger.log('updateCell エラー: ' + e.toString());
    throw e;
  }
}

// =============================================
// 【削除】指定行を物理削除する
// 引数：sheetName（文字列）, rowIndex（数値・1-indexed）
// 戻り値：なし
// =============================================
function deleteRow(sheetName, rowIndex) {
  try {
    getSheet(sheetName).deleteRow(rowIndex);
  } catch (e) {
    Logger.log('deleteRow エラー: ' + e.toString());
    throw e;
  }
}

// =============================================
// 【列特定】ヘッダー名から列番号（1-indexed）を返す
// シート上で列が前後しても壊れないよう、列番号は都度この関数で取得する
// 引数：sheetName（文字列）, headerName（文字列）
// 戻り値：列番号（数値）／見つからない場合は -1
// =============================================
function getColIndex(sheetName, headerName) {
  try {
    var sheet = getSheet(sheetName);
    var lastCol = sheet.getLastColumn();
    if (lastCol < 1) return -1;
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    for (var i = 0; i < headers.length; i++) {
      if (String(headers[i]) === String(headerName)) {
        return i + 1;  // 1-indexed で返す
      }
    }
    return -1;
  } catch (e) {
    Logger.log('getColIndex エラー: ' + e.toString());
    throw e;
  }
}

// =============================================
// 【値取得】行配列とヘッダー名から該当する値を返す
// getAllRows()で取得した行データに対し、ヘッダー名で値を引く
// 引数：rowArray（配列・1行分）, sheetName（文字列）, headerName（文字列）
// 戻り値：値／ヘッダーが見つからない場合は null
// =============================================
function getValueByHeader(rowArray, sheetName, headerName) {
  try {
    var col = getColIndex(sheetName, headerName);
    if (col === -1) return null;
    return rowArray[col - 1];  // 1-indexed → 0-indexed
  } catch (e) {
    Logger.log('getValueByHeader エラー: ' + e.toString());
    throw e;
  }
}

// =============================================
// 【補助】HEADER_*オブジェクトから定義順のヘッダー名配列を返す
// V8の挿入順保持を利用してConstants定義の並び順を取得する
// 引数：headerDef（CONSTANTS.HEADER_CHILDREN 等のオブジェクト）
// 戻り値：ヘッダー名文字列の配列
// =============================================
function getHeaderNames(headerDef) {
  try {
    var names = [];
    for (var key in headerDef) {
      if (headerDef.hasOwnProperty(key)) names.push(headerDef[key]);
    }
    return names;
  } catch (e) {
    Logger.log('getHeaderNames エラー: ' + e.toString());
    throw e;
  }
}
