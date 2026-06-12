# tasks.md

> 実装タスク一覧です。
> `CLAUDE.md` の指示に従い、必ずPlan Mode → 確認 → 実装の順で進めてください。
> 完了したタスクは状態を「✅ 完了」に更新してください。

---

## MVP タスク（最優先）

| # | タスク | 対応機能ID | 優先度 | 状態 |
|---|---|---|---|---|
| T-01 | Constants.gsを作成する（シート名・列定義・設定値を一元管理） | — | High | ✅ 完了 |
| T-01b | Utils.gsを作成する（日付フォーマット3関数の共通ユーティリティ） | — | High | ✅ 完了 |
| T-02 | SpreadsheetService.gsを作成する（シート取得・読み書き共通処理） | — | High | ✅ 完了 |
| T-03 | Setup.gsを作成する（初回セットアップ・メニュー追加・マイグレーション） | F-01 | High | ✅ 完了 |
| T-04 | Code.gsを作成する（doGet・ページルーティング） | — | High | ✅ 完了 |
| T-05 | index.htmlを作成する（画面骨格・BottomNavigation・CSS/JSインクルード） | F-10 | High | ✅ 完了（T-06でCSS統合完了） |
| T-06 | css.htmlを作成する（カラーパレット・フォント・レスポンシブ・共通スタイル） | F-10 | High | ✅ 完了 |
| T-07 | ChildService.gsを作成する（子ども追加・編集・削除・一覧取得） | F-03 F-04 F-05 | High | ✅ 完了 |
| T-08 | children.htmlを作成する（子ども管理画面・追加／編集モーダル） | F-03 F-04 F-05 | High | 未着手 |
| T-09 | DriveService.gsを作成する（フォルダ作成・画像保存） | F-07 | High | ✅ 完了 |
| T-10 | NoticeService.gsを作成する（おたより登録・一覧取得） | F-07 F-08 F-17 | High | ✅ 完了 |
| T-11 | upload.htmlを作成する（おたより登録画面・3ステップUI） | F-07 | High | ✅ 完了 |
| T-12 | notices.htmlを作成する（おたより一覧・子ども別タブ・月別グループ・サムネイル） | F-08 | High | ✅ 完了 |
| T-13 | おたより拡大表示モーダルを実装する（notices.html内） | F-09 | High | ✅ 完了 |
| T-14 | home.htmlを作成する（ホーム画面・子ども一覧カード） | F-06 | High | ✅ 完了 |
| T-15 | UIService.gsを作成する（フロントへのデータ整形・返却） | — | High | ✅ 完了（getNoticeImage のみ・他は将来追加） |
| T-16 | 接続状態確認画面を実装する（設定画面内） | F-02 | High | ✅ 完了 |
| T-17 | エラー対処ヘルプ画面を実装する（設定画面内） | F-11 | High | ✅ 完了 |
| T-18 | js.htmlを作成する（フロント共通JS・日付変換関数・google.script.run共通処理） | — | High | ✅ 完了 |
| T-19 | スマホ・タブレット・PCのレスポンシブ動作を確認・調整する | F-10 | High | ✅ 完了 |
| T-20 | MVP全機能の動作確認・受け入れ条件（AC）チェック | F-01〜F-11 | High | ✅ 完了 |

---

## v1.0 タスク（MVP完了後に着手）

| # | タスク | 対応機能ID | 優先度 | 状態 |
|---|---|---|---|---|
| T-21 | PDF登録対応をDriveService.gsに追加する | F-13 | Mid | ✅ 完了 |
| T-22 | 複数枚登録・進捗バーをupload.htmlに追加する | F-13 | Mid | ✅ 完了 |
| T-23 | 最近のおたより表示をhome.htmlに追加する（直近5件・全子ども横断） | F-12 | Mid | ✅ 完了 |
| T-24 | フルスクリーン表示・スワイプ移動をnotices.htmlに追加する | F-15 | Mid | ✅ 完了 |
| T-25 | お気に入り（ピン止め）機能をNoticeService.gsとnotices.htmlに追加する | F-16 | Low | ✅ 完了 |
| T-26 | 月フィルター強化をnotices.htmlに追加する | F-14 | Low | ✅ 完了 |
| T-27 | 完了済みおたより削除のフロントUIをnotices.htmlに追加する（GAS側はT-10で実装済） | F-17 | Mid | ✅ 完了 |
| T-28 | v1.0全機能の動作確認・受け入れ条件（AC）チェック | F-12〜F-17 | Mid | 未着手 |

---

## 追加機能タスク（v1.0完了後の改善・拡張）

| # | タスク | 対応機能ID | 優先度 | 状態 |
|---|---|---|---|---|
| T-32 | 子どもごとのバッジカラー選択機能を追加する | — | Low | ✅ 完了 |
| T-33 | おたよりに任意タイトル機能を追加する | — | Low | ✅ 完了 |
| T-33b | 登録済みおたよりのタイトル後追い編集機能を追加する | — | Low | ✅ 完了 |
| T-33c | 月フィルター改善（降順ソート＋プルダウン化） | — | Low | ✅ 完了 |
| T-34 | ホーム画面アイコン対応（スマホショートカット） | — | Low | ❌ 除外（GAS WebApp制約のため未実装） |
| T-35 | 講座提出準備（tasks.md整理・README.md作成・コード最終確認） | — | High | ✅ 完了 |

---

## v2.0 タスク（今回対象外・将来拡張）

| # | タスク | 対応機能ID | 優先度 | 状態 |
|---|---|---|---|---|
| T-29 | Gemini AI要約・自動抽出機能を実装する | F-18 | Low | 対象外 |
| T-30 | Gmailリマインド・カレンダー連携を実装する | F-19 F-20 | Low | 対象外 |
| T-31 | 期日優先表示・全文検索を実装する | F-21 | Low | 対象外 |

---

## タスク依存関係（この順番を守ること）

```
T-01（Constants）が完了してから → T-02以降すべてに着手可能

T-02（SpreadsheetService）が完了してから → T-03 T-07 T-10

T-03（Setup）が完了してから → T-16（接続状態確認）

T-04（Code.gs）が完了してから → T-05（index.html）

T-05（index.html）+ T-06（css.html）が完了してから → T-08 T-11 T-12 T-14

T-07（ChildService）が完了してから → T-08（children.html）

T-09（DriveService）が完了してから → T-10（NoticeService）

T-10（NoticeService）が完了してから → T-11 T-12

T-15（UIService）は T-07 T-10 完了後に作成する

T-18（js.html）は T-05 完了後・他のhtml完成前に作成する

T-20（MVP全確認）は T-01〜T-19 すべて完了後に実施する

T-21〜T-28（v1.0）は T-20 完了後に着手する

T-01b（Utils）は T-03・T-07・T-10 すべての前に完了させる
（T-07 で generateChildId、T-10 で generateNoticeId を各 Service 内に実装する）
```

---

## 完了ログ

| 完了日 | タスク# | 内容 | 備考 |
|---|---|---|---|
| 2026-06-09 | T-01 | Constants.gs作成（シート名・列番号・Drive/App設定・許容ファイル形式・Script Propertiesキーを一元管理。v2.0予約列も先行定義） | デプロイ履歴シートはMVP対象外。T-03で再判断 |
| 2026-06-09 | T-01b | Utils.gs作成（日付フォーマット3関数：getFormattedDateTime / getFormattedDate / getFormattedYearMonth）。CLAUDE.md §5にUtils.gsを追記 | ID生成は各Serviceへ移譲する方針。純粋関数のみ |
| 2026-06-09 | T-02 | SpreadsheetService.gs作成（getSpreadsheet / getSheet / getAllRows / findRowIndexById / appendRow / updateRow / updateCell / deleteRow） | 全関数にtry-catch・ヘッダー行1行目固定の前提 |
| 2026-06-09 | T-03 | Setup.gs作成（onOpen・runInitialSetup・runMigration・openWebApp・内部関数5つ）／設計大改訂：Constants.gsのCOL_*をHEADER_*（日本語名）に変更・SpreadsheetService.gsにgetColIndex/getValueByHeader/getHeaderNamesを追加・CLAUDE.md §6/§7改訂 | デプロイ履歴シートはMVP対象外で確定。マイグレーションは未知列を末尾保持・データ無削除 |
| 2026-06-09 | T-04 | Code.gs作成（doGet・PAGE_TO_FILE・include(silent対応)・isSetupDone）／index.html骨格（SPA・全コンポーネントinclude・BottomNavigation 5項目・最小JS）／setup_required.html新規／CLAUDE.md §5にsettings.html・setup_required.html追記 | SPA確定方針：display直接切替・history.pushStateなし。?page=list→notices.htmlマッピング |
| 2026-06-09 | T-03(改善) | Setup.gs openWebApp() 改善：URL未設定時にプロンプトで直接入力受付・空入力／不正形式バリデーション・https://script.google.com で始まるかチェック・保存後トースト案内 | _saveSetting/_loadWebAppUrl は変更なし。IT苦手ユーザーがシート編集せずにURL登録できるよう改善 |
| 2026-06-09 | T-06 | css.html作成（CSS変数でカラーパレット集約・Poppins/Noto Sans JP統合・カード/ボタン/バッジ/トースト/page-stub定義・BottomNav→SideNavの骨格レスポンシブ）／index.html最小インラインCSS削除・SideNavigation骨格追加／T-05状態をCSS統合完了に更新 | PC幅のSideNavigation中身（プロフィール表示等）はT-19で本実装 |
| 2026-06-09 | T-07 | ChildService.gs作成（getChildren / addChild / updateChild / deleteChild / generateChildId）。MAX_CHILDREN（10人）上限GAS側チェック・列特定はgetColIndexで動的・order昇順ソート・getColIndex結果を関数内キャッシュ・全関数try-catch | カスケード削除なし（おたよりとDriveサブフォルダは孤立状態で残る）。T-08で削除確認ダイアログに「おたよりデータは削除されません」併記 |
| 2026-06-10 | T-09 | DriveService.gs作成（getRootFolder / getOrCreateChildFolder / getOrCreateMonthFolder / saveFile）。data URLプレフィックス自動除去・サイズ上限（10MB）バックエンド検証・同名フォルダ存在時は1件目を採用・全関数try-catch | ルート無効時は再作成せずthrow（T-03 Setup._getOrCreateRootFolderと役割分担）。フロント側サイズ検証はT-11で実装 |
| 2026-06-10 | T-10 | NoticeService.gs作成（addNotice / getNotices / deleteNotice / generateNoticeId）。Drive保存はDriveServiceに委譲・FILE_TYPEはmimeTypeから自動判定（image/*→image, application/pdf→pdf）・PINNED初期値は'false'文字列・CREATED_AT文字列降順ソート・列特定はgetColIndexで動的・全関数try-catch | F-17（v1.0スコープ）のdeleteNoticeを本タスクで同時実装。T-27はフロントUI追加のみに縮小（tasks.md記述を更新済）。deleteNoticeはsetTrashedでゴミ箱送り（30日復元可能）・Drive削除失敗は許容 |
| 2026-06-10 | T-10(改善) | NoticeService.getNotices にYEAR_MONTH Date型防御を追加（CREATED_ATと同様、セル書式によるDate型化に備えて'YYYY-MM'文字列化） | 軽微な堅牢性改善。フロント側で formatYearMonth() が文字列を前提とするための予防的変換 |
| 2026-06-10 | T-11 | upload.html作成（3ステップUI：子ども選択→画像選択→確認・保存）。IIFE名前空間・状態オブジェクト・goToStep制御・10MBサイズ検証・HEICプレビューフォールバック・input type="month"・BottomNav「登録」クリックで状態リセット＋再ロード・全callGAS経由（withFailureHandler自動付与）・全関数try-catch | PDFはMVP対象外でT-21対応。子ども0人時はメッセージ＋管理画面遷移ボタン。レスポンシブ：スマホフルwidth／タブレット560px／PC600px |
| 2026-06-10 | T-12+T-13 | notices.html作成（一覧＋拡大モーダルを1ファイル統合）。「すべて」＋子ども別タブ（折り返しチップ）・月別グループ（YYYY年M月・降順）・サムネイルグリッド（スマホ2列／タブレット3列／PC4列）・拡大モーダル（画像・子ども名・年月・登録日時・Driveで開くリンク・Escape/オーバーレイで閉じる）・全callGAS経由・BottomNav「一覧」クリックでリセット＋再ロード | Drive画像URLは fileId から https://drive.google.com/thumbnail?id=...&sz=wN を生成（DriveApp.getUrl の閲覧URLは <img src> に使えない）。サムネsz=w400／拡大sz=w1600。画像読み込み失敗時は onerror で「画像を読み込めませんでした」フォールバック。削除UIはT-27に持ち越し |
| 2026-06-10 | T-15 | UIService.gs新規作成（getNoticeImage：fileId→DriveApp.getFileById→Blob→base64→data URL）。notices.htmlの画像取得をDriveサムネURL方式からGAS経由base64取得方式へ全面変更 | 変更理由：DriveサムネURL（https://drive.google.com/thumbnail?id=...）はGAS WebAppのiframe内で表示できないケースがあり、GAS経由で画像Blobを取得してbase64データURLで表示することで確実にレンダリング。順次取得キュー（同時1件シリアル・GAS負荷抑制）・グローバルキャッシュ imageCache[fileId]・キャッシュ件数20件超で警告バナー表示（×で閉じられる・--color-warning背景）・モーダルもキャッシュ流用＋未取得時は「読み込み中...」スピナー→取得後表示。thumbUrl関数は撤去 |
| 2026-06-10 | T-14 | home.html新規作成（ヒーローヘッダー・子ども一覧カード・空状態・クイックアクション）。notices.htmlに window.openNoticesForChild(childId) を公開してクロスページ連携 | カードタップで showPage('list') → openNoticesForChild で該当タブを選択状態にして再描画。子ども0人時は「子どもを登録する」ボタンで children 画面へ。レスポンシブ：スマホ1カラム／タブレット2カラム／PC3カラム。登録日表示は formatYearMonth 系（'YYYY年M月 登録'）。子ども取得失敗時のみトースト通知・成功時は静か |
| 2026-06-10 | T-16+T-17 | settings.html新規作成（接続状態確認＋エラー対処ヘルプ＋アプリ情報の3セクション統合）／UIService.gsに getConnectionStatus・runSetupFromWeb を追加 | getConnectionStatus は Drive/Spreadsheet を個別 try-catch で握って構造化結果を返す（NG項目があってもUIが必ず描画される設計）。runSetupFromWeb は Setup.gs の内部ヘルパ（_ensureSheetWithHeaders・_getOrCreateRootFolder・_saveSetting）を直叩きしてSpreadsheetApp.getUi()依存を回避（WebAppから呼べる版）。フロント側は confirm() 必須・既存データ保持マイグレーションのため非破壊。アコーディオンは複数同時オープン可・aria-expanded＋hidden属性で制御・chevron-down を CSS rotate で180度回転表現 |
| 2026-06-10 | T-27 | notices.html 拡大モーダルに「削除する」ボタン追加（F-17 フロントUI完成）。confirm()→callGAS('deleteNotice',...)→imageCacheからfileId削除→closeNoticeModal→showToast('削除しました','success')→loadNotices で再ロード | ボタンは案A配置（Driveで開く / 閉じる / 削除する の順・削除を末尾に置き誤タップ抑止）。.nt-btn-delete は白背景＋#E53935 outline＋trash-2 アイコンで視覚差別化。.nt-modal-actions は flex-wrap で3ボタンを自動折り返し。NoticesPageState.deleting フラグ＋showLoading で連打防止。Drive側はGAS側で setTrashed（30日復元可能） |
| 2026-06-10 | T-27(改善) | 削除確認をブラウザ confirm() からカスタムモーダルに変更。.nt-delete-overlay/.nt-delete-modal を z-index 400 で拡大モーダル(300)の上に重ねる構成。タイトル「おたよりを削除しますか？」＋復元方法案内（Driveゴミ箱から30日復元可能）＋キャンセル/削除する の2ボタン | 拡大モーダルは閉じずに重ね表示・「キャンセル」で削除確認だけ閉じる・「削除する」で削除確認を閉じてから deleteNotice 実行。confirm() は完全撤去。onDeleteClick → onDeleteConfirmClick / onDeleteCancelClick に分割 |
| 2026-06-10 | T-23 | home.html に「最近のおたより」セクション追加（F-12 達成）。getNotices(null) の先頭5件を子ども横断で横スクロール表示・サムネタップで一覧画面の該当子どもタブへ遷移（onChildCardClick 再利用） | 画像キャッシュは Option B 採用：window.NoticeImageCache を home と notices で共有し二重取得を防ぐ（notices.html の imageCache 初期化を 1 行変更）。画像取得は home 独自のシリアルキュー（recentsFetchQueue/recentsFetching）・notices と独立して動作するが結果は共有キャッシュに反映。0件時はセクション全体を hidden 化（タイトルごと非表示）・getNotices 失敗時はトースト＋セクション非表示。サムネ：スマホ96px／タブレット・PC 110px・横スクロール overflow-x: auto |
| 2026-06-10 | T-18 | js.html作成(日付変換3関数・showPage・showToast・showLoading・hideLoading・callGAS・openModal・closeModal・init)index.htmlのインラインshowPageを削除しjs.htmlに一本化 | children.htmlのトースト呼び出しも同タスクで修正済み |
| 2026-06-10 | T-19 | スマホ・タブレット・PCのレスポンシブ動作確認。縦スクロールは正常動作・水平スクロールなし確認済み | DevToolsで375px/768px/1024px確認済み |
| 2026-06-10 | T-20 | MVP全機能(F-01〜F-11)の動作確認・ACチェック完了。全項目実機確認済み | — |
| 2026-06-10 | T-21+T-22 | upload.htmlを複数枚（最大5枚）登録＋PDF対応に刷新。状態を配列ベース(files[])に置換・appendモード（残数まで追加）・各ファイル個別10MB検証・PDFはfile-textアイコン表示。STEP3に進捗バー追加（N/M枚保存中・%幅）。順次addNotice実行・1枚失敗しても継続・完了時に成功/失敗集計してトースト（全成功『N枚保存しました』／部分『N枚保存しました（M枚失敗）』／全失敗『保存に失敗しました』→STEP3で再試行可）／notices.html も同タスクで PDF サムネ対応：fileType==='pdf' は画像取得スキップ・file-textアイコン＋PDFラベルで表示、拡大モーダルも専用PDF表示+『Driveで開く』ボタン案内 | GAS側は addNotice/saveFile が mime→fileType 判定で 'pdf' を既存対応済（変更なし）。保存中は ナビ「登録」クリックでの中断を抑止する saving フラグガードを onEnterPage に追加。インラインスタイル禁止のため `.up-actions.is-hidden` クラス切替で進捗中ボタン群を隠す |
| 2026-06-12 | T-33c | 月フィルター改善：①月グループを yearMonth で明示的に降順ソート（CREATED_AT順 ≠ YEAR_MONTH順 のケースで「すべて」「子ども個別」両タブとも常に新しい月→古い月で並ぶように修正）、②横並びチップ（.nt-month-tabs）を select プルダウン（.nt-month-select）に置換。先頭「すべての月」、以降は登録のある月のみ降順で列挙。子どもタブ切替時にプルダウンが「すべての月」にリセット（onTabClick の selectedYearMonth=null → loadNotices → renderMonthSelect の流れで自動反映） | renderMonthTabs → renderMonthSelect、onMonthTabClick → onMonthSelectChange に改名。groupByYearMonth に '不明' グループを末尾に置く分岐追加。CSS の .nt-month-tab 系を削除し .nt-month-filter/.nt-month-select に置換 |
| 2026-06-12 | T-33b | 登録済みおたよりのタイトルを後追い編集できるよう拡大モーダル内にインライン編集UIを追加（NoticeService.gs：updateNoticeTitle(noticeId, title) 新規追加・空文字保存でタイトル削除も可・TITLE列未存在時は再セットアップ案内エラー / notices.html：モーダル タイトル行を常時表示化＋表示モード（鉛筆アイコン）／編集モード（input＋check/×アイコン）切替・タイトルなしは「（タイトルなし）」muted 表示・Enter で保存・Escape でキャンセル・editingTitle 連打防止フラグ・保存時は notices 配列＋modalNotice 同時更新→renderList で一覧サムネにも即時反映・closeNoticeModal で編集モード強制終了） | onPinClick と同じ「callGAS→ローカル state 書換→renderList→toast」パターン踏襲。常時表示にすることでタイトル無しのおたよりにも後付け追加可能 |
| 2026-06-12 | T-33 | おたよりに任意タイトル機能を追加（Constants.gs：HEADER_NOTICES.TITLE 追加 / NoticeService.gs：addNotice の引数末尾に title 追加・列存在時のみ書込・空可、getNotices 戻り値に title フィールド追加 / upload.html：STEP3 確認カードに「タイトル（任意）」入力欄＋80文字制限・onSave/saveNext から addNotice へ伝達・resetState でクリア / notices.html：サムネ下に .nt-meta-title（あれば2行省略表示）、拡大モーダルメタに「タイトル」行（あれば表示・なければ hidden）） | TITLE列未存在時もエラーにせず空文字フォールバック（AVATAR・COLOR と同パターン）。Setup.gs は既存 _safeMigrateSheet が自動対応のためコード変更なし。複数枚登録時は全枚同一タイトル。プレースホルダ「例：運動会のお知らせ（任意）」で任意性を明示 |
| 2026-06-12 | T-32 | 子どもごとのバッジカラー選択機能を追加（Constants.gs に HEADER_CHILDREN.COLOR と CHILD_COLORS（10色）を定義 / ChildService.gs：getChildren に color フィールド追加・index 偶奇で青/桜デフォルト適用・updateChildColor を新規追加 / children.html：詳細カードに10色スウォッチ＋タップ即時保存 / home.html・notices.html：data-child-color="boy/girl" 方式を撤去し --child-color CSS変数 + style.setProperty 方式に置換 / css.html：.color-swatch / .color-swatch.selected を追加） | COLOR列未存在時もエラーにせずデフォルト色で表示（AVATAR と同パターン）。Setup.gs は既存 _safeMigrateSheet が自動対応のためコード変更なし。home/notices の childColorMap で childId→color を一元管理。スウォッチは丸形32px+タップ領域44px疑似要素で確保 |
| 2026-06-12 | T-35 | 講座提出準備：tasks.md に追加機能テーブル（T-32〜T-35）を新設・完了ログに T-34/T-35 を追記／README.md を新規作成（概要・ターゲット・技術スタック・実装済み機能・デプロイ手順・使い方）／全コード最終確認（let・const ゼロ・インラインstyle ゼロ・絵文字違反なし・列番号ハードコーディングなし） | コード変更は発生せず。MVP（F-01〜F-11）・v1.0（F-12〜F-17）・追加機能すべての実装が確認済み |
| 2026-06-12 | T-34 | ホーム画面アイコン対応を試行・除外決定。GAS WebApp の iframe ホスティング環境では iOS/Android の apple-touch-icon タグが機能しないため、index.html の icon/PWA関連タグ群を T-34実装前の状態に完全リバート | GitHub Pages に icon.png を配置して raw URL を参照する方式まで試したが、GAS の iframe 経由ではタグが正しく解釈されない制約を確認。本機能は GAS WebApp の構造的制約により実装不可と判断 |
| 2026-06-11 | T-25+T-26+T-24 | notices.html＋NoticeService.gs に3機能を同時実装。【T-25 ピン留め】NoticeService.gsにupdateNoticePinを追加（PINNEDを'true'/'false'文字列で書込）・モーダルにピン留めボタン追加（pin/pin-offアイコン切替・is-pinnedクラスでwarning色塗潰）・サムネ右上にピンバッジ・renderListで pinned==='true' を「ピン留め」独立セクションとして月別グループより上に表示。ローカルstate更新のみ（再ロードなし）。【T-26 月フィルター】子どもタブ直下に月チップ列を追加（secondary色＝青で子どもタブと差別化）・getFilteredNotices()で子どもタブ＋月フィルターのAND絞り込み・notices取得後にrenderMonthTabs()で再構築・月種別1以下では非表示・子どもタブ切替時は月フィルターをリセット。【T-24 フルスクリーン＋スワイプ】.nt-modal-card を width:100%/height:100vh/border-radius:0でフルスクリーン化・nt-modal-img/nt-modal-pdf-canvas の max-height を 75vh に拡大・モーダル左上にインジケーター（3/10形式・ピル）追加・openNoticeModal時に getFilteredNotices→ピン留め先頭の可視リストをスナップショット＋現在index特定・setModalNoticeContent抽出で前後切替時のコンテンツ反映を共通化・goToPrev/NextNoticeで端到達は無反応・attachSwipeNavで touchstart/end（dx≥50&dy<80）・キーボード ←/→ で前後（既存Escape結線に統合・削除確認モーダル中はナビ無効） | 懸念点A=メタ/ボタンを残したまま全画面化を採用。スワイプ対象はピン留め→月別の連結配列。月フィルターはタブ適用後のyearMonthユニーク値のみ表示。ピン留め変更時はスナップショット維持＋renderListのみ呼ぶ（途中で順序が変わるのを防ぐ）。PDF→image切替時の残像対策で setModalNoticeContent冒頭に canvas.clearRect + img.removeAttribute('src') を追加 |

---

## 実装時の確認チェックリスト（タスク完了前に必ず確認）

```
□ var / function スタイルになっているか（let / const を使っていないか）
□ 全関数にtry-catchがあるか
□ 日本語コメントが論理ブロックごとにあるか
□ 日付・日時をDate型でSpreadsheetに書いていないか
□ ハードコーディングせずConstants.gsを使っているか
□ google.script.runにwithFailureHandlerがあるか
□ 処理完了時に日本語トーストまたはアラートがあるか
□ 受け入れ条件（AC）をすべて満たしているか
```