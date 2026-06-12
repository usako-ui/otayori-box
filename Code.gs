// =============================================
// 【Code.gs】WebAppエントリーポイント・ページルーティング
// doGet(e) で URL パラメータ ?page=xxx を見て初期表示ページを決定
// SETUP_DONE が true でない場合はセットアップ案内画面を返す
// =============================================

// ---- URL パラメータ → コンポーネントファイル名のマッピング ----
// CLAUDE.md §5 の既存ファイル名を尊重し、URLとファイル名のズレはここで吸収する
var PAGE_TO_FILE = {
  'home':     'home',
  'list':     'notices',   // ?page=list は notices.html
  'upload':   'upload',
  'children': 'children',
  'settings': 'settings'
};
var DEFAULT_PAGE = 'home';

// =============================================
// 【エントリ】WebAppへのアクセス時にHTMLを返す
// URLパラメータ ?page=xxx を読み、初期表示ページを決める
// SETUP_DONEがtrueでなければセットアップ案内画面を返す
// =============================================
function doGet(e) {
  try {
    // 1) セットアップ未完了 → 案内画面を返す
    if (!isSetupDone()) {
      var setupTpl = HtmlService.createTemplateFromFile('setup_required');
      setupTpl.appName = CONSTANTS.APP.NAME;
      return setupTpl.evaluate()
        .setTitle(CONSTANTS.APP.NAME + ' セットアップが必要です')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag('viewport', 'width=device-width, initial-scale=1');
    }

    // 2) ページパラメータを取得・検証（未定義キーや不正値はDEFAULT_PAGEへ）
    var page = (e && e.parameter && e.parameter.page) ? String(e.parameter.page) : DEFAULT_PAGE;
    if (!PAGE_TO_FILE.hasOwnProperty(page)) page = DEFAULT_PAGE;

    // 3) index.html を評価して返す
    var tpl = HtmlService.createTemplateFromFile('index');
    tpl.initialPage = page;                  // 初期表示ページ（URLパラメータ名）
    tpl.appName     = CONSTANTS.APP.NAME;
    tpl.appVersion  = CONSTANTS.APP.VERSION;
    return tpl.evaluate()
      .setTitle(CONSTANTS.APP.NAME)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
  } catch (e2) {
    Logger.log('doGet エラー: ' + e2.toString());
    // テンプレート読込自体が失敗した場合の最終フォールバック
    return HtmlService.createHtmlOutput(
      '<h1>エラーが発生しました</h1>' +
      '<p>' + String(e2.message).replace(/</g, '&lt;') + '</p>'
    ).setTitle('エラー');
  }
}

// =============================================
// 【HTMLインクルード】<?!= include('xxx'); ?> 用ヘルパー
// 第2引数 silent=true の時、未存在ファイルは HTMLコメントだけ返す（CSS/JS 用）
// silent=false の時、未存在ファイルは「未実装」プレースホルダを返す（ページコンポーネント用）
// =============================================
function include(filename, silent) {
  try {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  } catch (e) {
    Logger.log('include skip: ' + filename + ' (' + e.message + ')');
    if (silent) {
      return '<!-- include skip: ' + String(filename).replace(/-->/g, '--&gt;') + ' -->';
    }
    return '<div class="page-stub" style="color:#999;text-align:center;padding:3em 1em;">' +
           '<i data-lucide="construction" style="width:32px;height:32px;"></i>' +
           '<p>' + String(filename).replace(/</g, '&lt;') + ' は未実装です</p>' +
           '</div>';
  }
}

// =============================================
// 【判定】セットアップ完了判定
// Script Properties の SETUP_DONE が文字列 'true' なら完了
// =============================================
function isSetupDone() {
  try {
    var v = PropertiesService.getScriptProperties().getProperty(CONSTANTS.PROP_KEY.SETUP_DONE);
    return v === 'true';
  } catch (e) {
    Logger.log('isSetupDone エラー: ' + e.toString());
    return false;
  }
}
