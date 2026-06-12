// =============================================
// 【Constants.gs】定数一元管理
// 本ファイル以外でのハードコーディングは禁止
// 値の追加・変更はすべてこのファイルで行うこと
//
// ★列番号ではなく「ヘッダー名」で管理する
// シート上で列が前後・追加されても壊れないよう、HEADER_* は名前定義
// 列番号が必要な時は SpreadsheetService.getColIndex() で取得する
// =============================================

var CONSTANTS = {

  // ---- シート名 ----
  SHEET: {
    CHILDREN: '子ども一覧',
    NOTICES:  'おたより一覧',
    SETTINGS: 'システム設定'
    // デプロイ履歴シートはMVP対象外
  },

  // ---- 子ども一覧シートのヘッダー名（V8の挿入順を維持＝この順で並び替え） ----
  HEADER_CHILDREN: {
    ID:           'ID',
    NAME:         '子ども名',
    ORDER:        '表示順',
    CREATED_DATE: '登録日',
    AVATAR:       'アバター',  // アバター画像のDriveファイルID（未設定は空文字）
    COLOR:        'バッジカラー' // バッジ・アバター枠の表示色（'#RRGGBB' 形式・未設定は空文字でデフォルト適用）
  },

  // ---- おたより一覧シートのヘッダー名 ----
  // requirements.md の保守性要件に従い、v2.0予約列も先行定義する
  HEADER_NOTICES: {
    ID:         'ID',
    CHILD_ID:   '子どもID',
    CHILD_NAME: '子ども名',
    YEAR_MONTH: '対象年月',
    FILE_ID:    'DriveファイルID',
    FILE_URL:   'Drive URL',
    CREATED_AT: '登録日時',
    FILE_TYPE:  'ファイル種別',
    PINNED:     'ピン留め',
    SUMMARY:    '要約',      // v2.0予約
    CATEGORY:   'カテゴリ',  // v2.0予約
    EVENT_DATE: '行事日',    // v2.0予約
    ITEMS:      '持ち物',    // v2.0予約
    TITLE:      'タイトル'   // 任意入力テキスト（T-33・未設定は空文字）
  },

  // ---- システム設定シートのヘッダー名 ----
  HEADER_SETTINGS: {
    KEY:   'キー',
    VALUE: '値'
  },

  // ---- システム設定シートのキー名 ----
  // システム設定シートのキー列に保存する文字列
  SETTINGS_KEY: {
    ROOT_FOLDER_ID: 'ROOT_FOLDER_ID',
    WEB_APP_URL:    'WEB_APP_URL',
    SETUP_DONE:     'SETUP_DONE'
  },

  // ---- Drive設定 ----
  DRIVE: {
    ROOT_FOLDER_NAME:    'おたよりBOX',
    AVATARS_FOLDER_NAME: 'avatars'   // 子どもアバター画像の保存先（ルート直下）
  },

  // ---- アプリ全般 ----
  APP: {
    NAME:             'おたよりBOX',
    VERSION:          '1.0.0',
    MAX_CHILDREN:     10,  // 子ども登録上限
    MAX_FILE_SIZE_MB: 10,  // 1ファイルあたりの上限
    RECENT_COUNT:     5,   // ホーム最近表示件数（v1.0で使用）
    MAX_UPLOAD_COUNT: 5    // 複数枚登録の上限（v1.0で使用）
  },

  // ---- 許容ファイル形式 ----
  // MVPは画像のみ。v1.0でPDFを追加する
  FILE: {
    IMAGE_MIME_TYPES: ['image/jpeg', 'image/png', 'image/heic', 'image/heif'],
    PDF_MIME_TYPE:    'application/pdf',
    TYPE_IMAGE:       'image',
    TYPE_PDF:         'pdf'
  },

  // ---- 子どもバッジカラー（T-32：10色パレット） ----
  // 子ども管理画面のスウォッチ表示順 = この定義順（CORAL → PINK）
  // children.html 側のスウォッチ描画用に同一値を再掲しているため、追加・順序変更時は両方を更新すること
  CHILD_COLORS: {
    CORAL:  '#FF6B6B',
    LEMON:  '#FFE45C',
    YELLOW: '#FFF3A3',
    GREEN:  '#6BCB77',
    MINT:   '#B8F2E6',
    BLUE:   '#4D96FF',
    NAVY:   '#1E3A5F',
    PURPLE: '#A855F7',
    SAKURA: '#FFB7C5',
    PINK:   '#E84393'
  },

  // ---- Script Propertiesキー ----
  // PropertiesServiceに保存するキー名
  // システム設定シートと役割を分離する：
  //   - Script Properties：高頻度アクセスのキャッシュ用途
  //   - システム設定シート：人間が見る診断・確認用
  PROP_KEY: {
    ROOT_FOLDER_ID: 'ROOT_FOLDER_ID',
    SETUP_DONE:     'SETUP_DONE'
  }

};
