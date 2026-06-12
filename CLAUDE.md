# CLAUDE.md — おたよりBOX プロジェクト指示書

> このファイルはClaude Codeが最初に読む指示書です。
> 実装を始める前に必ずこのファイルを全て読んでください。

---

## 0. このプロジェクトについて

**おたよりBOX** は、子育て中の保護者が園・学校・習い事のおたよりを
子ども別・月別に管理できるGAS完結のWebアプリです。

- **誰のため**：30〜40代ママ・子ども3人・共働き・IT苦手なユーザー
- **何を解決**：おたよりが複数経路（紙・学校アプリPDF・LINE）に散らばり探せない問題
- **どう解決**：スクショまたはPDFを3クリック以内で保存し、子ども別・月別に自動整理

詳細は `requirements.md` を参照してください。

---

## 1. 実装の進め方（必ず守ること）

### Plan Mode ファースト
```
❌ いきなりコードを書かない
✅ 必ずPlan Modeで設計を提示 → 確認を得てから実装する
```

### 1タスクずつ完了させる
```
❌ 複数機能を一度に実装しない
✅ tasks.md のタスクを1つ完了 → 確認 → 次のタスクへ
```

### 不明点は必ず聞く
```
❌ 要件に書いていないことを勝手に補完しない
✅ 実装を止めて質問する
```

---

## 2. 技術スタック（厳守）

### 使用する技術
| 種別 | 技術 |
|---|---|
| バックエンド | Google Apps Script（GAS） |
| 画面表示 | GAS HTML Service |
| フロントエンド | Vanilla JavaScript（HTMLに直接記述） |
| データベース | Google Spreadsheet |
| ファイル保存 | Google Drive |
| アイコン | Lucide Icons（CDN経由） |
| フォント | Poppins / Noto Sans JP（Google Fonts CDN） |

### 使用禁止技術（絶対に使わない）
- React / Next.js / Vue.js などのフレームワーク
- Firebase / Supabase などの外部DB
- Node.js / npm / yarn パッケージ
- ビルドツール（Webpack・Vite等）
- 外部有料API

### デプロイ方法
- Vercel **ではなく** GAS WebApp としてデプロイする
- `スクリプトエディタ → デプロイ → 新しいデプロイ → ウェブアプリ` で公開URLを取得
- アクセス権限：`自分のみ`（友人への提供時は友人のGoogleアカウントを追加）

---

## 3. コーディング規約（全ファイル共通）

### GAS（.gs ファイル）
```javascript
// ✅ 正しいスタイル
var SHEET_NAME = 'おたより一覧';  // varを使う

function saveNotice(data) {       // functionを使う
  try {
    // 処理内容のコメントを日本語で記載
    var sheet = getSheet(SHEET_NAME);
    sheet.appendRow([data.id, data.childId]);
    // 完了トースト
    SpreadsheetApp.getActiveSpreadsheet().toast('保存しました', 'おたよりBOX', 3);
  } catch (e) {
    Logger.log('saveNotice エラー: ' + e.toString());
    throw e;
  }
}

// ❌ 禁止スタイル
const save = (data) => { ... };  // const・アロー関数禁止
let result = '';                  // let禁止
```

### コメントルール
```javascript
// =============================================
// 【子ども管理】子どもを新規登録する
// 引数：childName（文字列）
// 戻り値：登録したchildId（文字列）
// =============================================
function addChild(childName) {
  // IDを生成する
  var childId = 'child_' + generateId();

  // スプレッドシートに書き込む
  var sheet = getSheet(CONSTANTS.SHEET.CHILDREN);
  sheet.appendRow([childId, childName, getNextOrder(), getFormattedDate()]);

  return childId;
}
```

### エラーハンドリング
```javascript
// 全関数にtry-catchを実装する（省略禁止）
function deleteChild(childId) {
  try {
    // 削除処理
  } catch (e) {
    Logger.log('deleteChild エラー: ' + e.toString());
    throw new Error('子どもの削除に失敗しました: ' + e.message);
  }
}
```

### 通知（トースト・アラート）
```javascript
// 成功時 → トースト（3秒）
SpreadsheetApp.getActiveSpreadsheet().toast('保存しました', 'おたよりBOX', 3);

// エラー時 → アラート（日本語）
SpreadsheetApp.getUi().alert('エラーが発生しました。もう一度お試しください。');
```

---

## 4. 日付・日時の扱い（重要）

### ❌ 絶対にやってはいけないこと
```javascript
// SpreadsheetへのDate型書き込み禁止
// → ロケール変換・タイムゾーンずれで値が壊れる
sheet.getRange(row, col).setValue(new Date());  // NG
```

### ✅ GAS書き込み時（文字列で保存）
```javascript
// 登録日時：「2026-06-01 12:00:00」形式で保存
function getFormattedDateTime() {
  var now = new Date();
  var y = now.getFullYear();
  var m = String(now.getMonth() + 1).padStart(2, '0');
  var d = String(now.getDate()).padStart(2, '0');
  var h = String(now.getHours()).padStart(2, '0');
  var mi = String(now.getMinutes()).padStart(2, '0');
  var s = String(now.getSeconds()).padStart(2, '0');
  return y + '-' + m + '-' + d + ' ' + h + ':' + mi + ':' + s;
}

// 登録日（日付のみ）：「2026-06-01」形式で保存
function getFormattedDate() {
  var now = new Date();
  var y = now.getFullYear();
  var m = String(now.getMonth() + 1).padStart(2, '0');
  var d = String(now.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + d;
}

// 対象年月：「2026-06」形式で保存
function getFormattedYearMonth(date) {
  var y = date.getFullYear();
  var m = String(date.getMonth() + 1).padStart(2, '0');
  return y + '-' + m;
}
```

### ✅ フロントJS表示時（文字列から変換）
```javascript
// 曜日配列（フロント側で計算する・GASから渡さない）
var WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

// 「2026-06」→「2026年6月」
function formatYearMonth(ym) {
  var parts = ym.split('-');
  return parts[0] + '年' + parseInt(parts[1]) + '月';
}

// 「2026-06-01 12:00:00」→「6月1日(日) 12:00」
function formatDateTime(dt) {
  var parts = dt.split(' ');
  var dateParts = parts[0].split('-');
  var timeParts = parts[1].split(':');
  var dateObj = new Date(
    parseInt(dateParts[0]),
    parseInt(dateParts[1]) - 1,
    parseInt(dateParts[2])
  );
  var weekday = WEEKDAYS[dateObj.getDay()];
  return parseInt(dateParts[1]) + '月' + parseInt(dateParts[2]) + '日(' + weekday + ') '
       + timeParts[0] + ':' + timeParts[1];
}

// 「2026-06-15」→「6月15日(月)」（v2.0の行事日用）
function formatDate(d) {
  var dateParts = d.split('-');
  var dateObj = new Date(
    parseInt(dateParts[0]),
    parseInt(dateParts[1]) - 1,
    parseInt(dateParts[2])
  );
  var weekday = WEEKDAYS[dateObj.getDay()];
  return parseInt(dateParts[1]) + '月' + parseInt(dateParts[2]) + '日(' + weekday + ')';
}
```

---

## 5. GASファイル構成

```
プロジェクト/
├── Code.gs              # エントリーポイント・doGet・ルーティング
├── Constants.gs         # 定数管理（シート名・列定義・設定値）← ハードコーディング禁止
├── Utils.gs             # 共通ユーティリティ（日付フォーマット3関数）
├── Setup.gs             # 初回セットアップ・メニュー追加
├── SpreadsheetService.gs # スプレッドシート操作全般
├── DriveService.gs      # Driveフォルダ作成・ファイル保存
├── ChildService.gs      # 子ども管理（追加・編集・削除・一覧取得）
├── NoticeService.gs     # おたより管理（登録・一覧取得）
├── UIService.gs         # フロントエンドへのデータ整形・返却
├── index.html           # メインHTML・画面骨格
├── css.html             # スタイル（インクルード用）
├── js.html              # フロントエンドJS（インクルード用）
├── home.html            # ホーム画面コンポーネント
├── upload.html          # おたより登録画面コンポーネント
├── children.html        # 子ども管理画面コンポーネント
├── notices.html         # おたより一覧画面コンポーネント（?page=list で表示）
├── settings.html        # 設定画面コンポーネント（接続状態確認・ヘルプを含む）
└── setup_required.html  # セットアップ未完了時の案内画面
```

> ID生成は対象シートを所有するService側に置く（`generateChildId`はChildService.gs、`generateNoticeId`はNoticeService.gs）。
> Utils.gsはSpreadsheet操作に依存しない純粋関数のみで構成する。

### Constants.gsの使い方
```javascript
// ✅ 定数はすべてConstants.gsで定義する
var CONSTANTS = {
  SHEET: {
    CHILDREN: '子ども一覧',
    NOTICES: 'おたより一覧',
    SETTINGS: 'システム設定',
    DEPLOY: 'デプロイ履歴'
  },
  DRIVE: {
    ROOT_FOLDER_NAME: 'おたよりBOX'
  },
  APP: {
    VERSION: '1.0.0',
    MAX_CHILDREN: 10,
    MAX_FILE_SIZE_MB: 10,
    RECENT_COUNT: 5
  }
};

// ❌ ハードコーディング禁止
var sheet = ss.getSheetByName('おたより一覧');  // NG → CONSTANTS.SHEET.NOTICESを使う
```

---

## 6. Spreadsheetデータ設計

### スプレッドシート名
`おたよりBOX_DB`

> **列はヘッダー名で管理する**：シート上で列が前後・追加されても壊れないよう、列番号ではなく `CONSTANTS.HEADER_*`（ヘッダー名文字列）で参照する。列番号が必要な時は `getColIndex(sheetName, headerName)` で都度取得する。

### 子ども一覧シート
| ヘッダー名 | 内部キー（HEADER_CHILDREN） | 型 | 例 |
|---|---|---|---|
| ID | ID | 文字列 | child_001 |
| 子ども名 | NAME | 文字列 | 長男 |
| 表示順 | ORDER | 数値 | 1 |
| 登録日 | CREATED_DATE | 文字列（YYYY-MM-DD） | 2026-06-01 |

### おたより一覧シート
| ヘッダー名 | 内部キー（HEADER_NOTICES） | 型 | 例 |
|---|---|---|---|
| ID | ID | 文字列 | notice_001 |
| 子どもID | CHILD_ID | 文字列 | child_001 |
| 子ども名 | CHILD_NAME | 文字列 | 長男 |
| 対象年月 | YEAR_MONTH | 文字列（YYYY-MM） | 2026-06 |
| DriveファイルID | FILE_ID | 文字列 | 1aBcD... |
| Drive URL | FILE_URL | 文字列 | https://... |
| 登録日時 | CREATED_AT | 文字列（YYYY-MM-DD HH:mm:ss） | 2026-06-01 12:00:00 |
| ファイル種別 | FILE_TYPE | 文字列 | image |
| ピン留め | PINNED | 文字列 | false |
| 要約 | SUMMARY | 文字列 | （空・v2.0予約） |
| カテゴリ | CATEGORY | 文字列 | （空・v2.0予約） |
| 行事日 | EVENT_DATE | 文字列 | （空・v2.0予約） |
| 持ち物 | ITEMS | 文字列 | （空・v2.0予約） |

### システム設定シート
| ヘッダー名 | 内部キー（HEADER_SETTINGS） | 型 | 例 |
|---|---|---|---|
| キー | KEY | 文字列 | ROOT_FOLDER_ID |
| 値 | VALUE | 文字列 | 1aBcD... |

---

## 7. UIデザイン仕様

### カラーパレット（CSS変数で管理）
```css
:root {
  --color-primary:    #FF6B35;  /* メインボタン */
  --color-secondary:  #1982C4;  /* リンク・サブ */
  --color-accent:     #8AC926;  /* バッジ・タグ */
  --color-warning:    #FFCA3A;  /* ハイライト */
  --color-background: #FFFDF8;  /* 背景 */
  --color-text:       #333333;  /* 本文 */
}
```

### フォント（Google Fonts CDN）
```html
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet">
```

### アイコン（Lucide Icons CDN）
```html
<script src="https://unpkg.com/lucide@latest"></script>
<!-- 使用例 -->
<i data-lucide="home"></i>
<script>lucide.createIcons();</script>
```
絵文字は使用禁止。アイコンはすべてLucide Iconsで統一する。

> **例外**：スプレッドシートのメニューバー（`onOpen`で作るカスタムUIメニュー）のラベルに限り、視認性のため絵文字を使用してよい（例：🚀 初回セットアップ実行 / 🔄 シート・列を最新仕様に更新 / 🔗 Webアプリを開く）。Web画面（HTML/CSS）では引き続きLucide Iconsで統一する。

### レスポンシブ対応
```css
/* スマホ（375px〜）：1カラム・BottomNavigation */
/* タブレット（768px〜）：2カラム・BottomNavigation */
/* PC（1024px〜）：3カラム・SideNavigation */
```

---

## 8. 完了の定義（Done の定義）

各機能の受け入れ条件（AC）をすべて満たした状態を「完了」とする。
詳細なACは `requirements.md` の機能要件テーブルを参照。

### MVP完了条件（最重要）
```
✅ 子どもを登録・編集・削除できる
✅ スクショまたはPDFを3クリック以内で保存できる
✅ 子ども別タブ・月別グループで一覧表示できる
✅ おたよりをタップで拡大表示できる
✅ 初回セットアップが1クリックで完了する
✅ スマホで片手操作できるUI
```

---

## 9. GAS固有の注意事項

### GAS実行制限（無料枠）
- 1回の実行：最大6分
- 1日の合計実行時間：最大90分
- 重い処理は分割して実行する

### google.script.run の使い方
```javascript
// フロントからGASを呼び出す正しいパターン
google.script.run
  .withSuccessHandler(function(result) {
    // 成功時の処理
    console.log(result);
  })
  .withFailureHandler(function(error) {
    // 失敗時の処理（必ず実装する）
    alert('エラーが発生しました: ' + error.message);
  })
  .saveNotice(data);  // GAS側の関数名
```

### HTMLインクルードの書き方
```html
<!-- index.html 内でのインクルード -->
<?!= HtmlService.createHtmlOutputFromFile('css').getContent(); ?>
<?!= HtmlService.createHtmlOutputFromFile('js').getContent(); ?>
```

### Script Propertiesの使い方
```javascript
// シークレット情報はScript Propertiesに保存する（コード内に直書きしない）
var props = PropertiesService.getScriptProperties();
var rootFolderId = props.getProperty('ROOT_FOLDER_ID');
props.setProperty('ROOT_FOLDER_ID', folderId);
```

---

## 10. 講座必須要件との対応

| 講座要件 | このプロジェクトでの対応 |
|---|---|
| 要件定義書をベースに開発 | requirements.md（要件定義書v1.3）を参照 |
| CLAUDE.mdをプロジェクトに配置 | このファイル（CLAUDE.md） |
| Plan Mode → 確認 → 実装の流れ | 各タスク開始前にPlan Modeで設計を提示する |
| 公開URLを取得 | GAS WebAppとしてデプロイしURLを取得（Vercelは不使用） |
| GitHubリポジトリを公開 | GASファイル一式をGitHubにアップ・READMEにスクショ記載 |
| 記事として公開 | 誰のため・技術スタック・つまずきポイント・URL記載 |

> **注意**：講座の「Vercelにデプロイ」要件について
> 本プロジェクトはGAS完結のためVercelは使用しない。
> 代替として「GAS WebAppデプロイ → 公開URL取得」で同等の要件を満たす。
> 講師への事前確認を推奨。

---

## 11. 実装順序（tasks.mdに従う）

```
MVP（必須）
├── T-01 Constants.gs・プロジェクト基盤の作成
├── T-02 Setup.gs・初回セットアップ機能
├── T-03 ChildService.gs・子ども管理機能
├── T-04 index.html・画面骨格・ルーティング
├── T-05 children.html・子ども管理画面
├── T-06 NoticeService.gs・おたより登録機能（画像）
├── T-07 upload.html・おたより登録画面（3ステップ）
├── T-08 notices.html・おたより一覧画面
├── T-09 home.html・ホーム画面
└── T-10 レスポンシブUI・BottomNavigation

v1.0（MVP完了後）
├── T-11 PDF登録対応
├── T-12 複数枚登録・進捗バー
├── T-13 フルスクリーン・スワイプ移動
├── T-14 お気に入り（ピン止め）
└── T-15 月フィルター強化・おたより削除
```