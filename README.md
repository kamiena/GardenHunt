# GardenHunt

『ガーデンハント（Garden Hunt）』公式サイト。
ビルド不要の静的サイト（HTML / CSS / JavaScript のみ）です。

- Steam: https://store.steampowered.com/app/3820430/
- 開発／パブリッシュ：クレアクラン（代表：カミエナ）

## 構成

```
index.html              … ページ本体（日本語の原文もここに直接書いています）
assets/css/style.css    … デザイン（キービジュアルの配色・モチーフがベース）
assets/js/i18n.js       … 日本語以外 8 言語の翻訳データ
assets/js/main.js       … 言語切り替え／メニュー／ムービー切り替え／画像拡大／改行の調整
assets/img/             … キービジュアル、スクリーンショット（WebP）、OGP 画像、ファビコン
tools/check-i18n.mjs    … 翻訳の抜け漏れチェック
```

## 対応言語（Steam の対応言語と同じ 9 言語）

日本語 / English / 简体中文 / 繁體中文 / 한국어 / Français / Deutsch / Español / Italiano

- 右上の 🌐 ボタン、またはフッターの「Language」から切り替えられます。
- `?lang=en` のように URL で言語を指定できます（`ja` `en` `zh-Hans` `zh-Hant` `ko` `fr` `de` `es` `it`）。
- 初回はブラウザの言語設定に合わせて自動で選ばれ、切り替えた言語は次回以降も保持されます。
- 「Steamで購入する」ボタンは、選択中の言語の Steam ストアページへリンクします。

## 文章の編集方法

- **日本語**：`index.html` を直接編集してください（`data-i18n="…"` が付いた要素がそのまま日本語の原文になります）。
  - 見出しや短い一文は `<span class="ib">…</span>` で区切ると、その区切りの位置でだけ改行されます（スマホで変な位置で切れないように）。
  - 本文中のゲーム用語（ヌメリ道、ヌメヌメダッシュ など）は途中で改行されないよう自動で調整しています（`assets/js/main.js` の `JA_TERMS`）。
- **その他の言語**：`assets/js/i18n.js` の同じキーを編集してください。
- 文言を追加したら、次のコマンドで全言語に訳がそろっているか確認できます。

  ```sh
  node tools/check-i18n.mjs
  ```

ストーリー・特徴の文章は Steam ストアページの公式テキスト（各言語版）をベースにしています。
「あそびかた」「FEVER TIME」などは、ゲーム画面内のチュートリアル表示と各メディア記事の内容をもとに書き起こしています。

## ページ構成

ヒーロー（キービジュアル＋告知テキスト）→ ムービー → ゲーム概要／あそびかた → ストーリー → ゲームの特徴 → キャラクター → キャスト＆スタッフ → スクリーンショット → 掲載メディア → 製品情報 → フッター

- 左上のロゴはキービジュアルが見えている間は隠れ、スクロールすると表示されます（押すとページトップへ）。
- 右上の MENU（スマホは ≡）で、全画面のメニューが開きます。

## ムービーを追加する

`index.html` の `#movie` にある `.player__tabs` に `<li>` を1つ追加します（ストーリームービーなど）。

```html
<li role="presentation">
  <button type="button" role="tab" aria-selected="false" data-tab="story"
          data-yt="YouTubeの動画ID" data-title-key="movie.story.title"
          data-poster="assets/img/movie/story-s.webp" data-poster-full="assets/img/movie/story.webp">
    <img src="assets/img/movie/story-s.webp" width="720" height="405" loading="lazy" decoding="async" alt="">
    <span class="player__tab-label" data-i18n="movie.tab.story">ストーリームービー</span>
  </button>
</li>
```

`movie.story.title`（日本語は `i18n.js` の `ja` にも）と `movie.tab.story` の訳を `assets/js/i18n.js` に追加し、`node tools/check-i18n.mjs` で確認してください。
英語版の動画がある場合は `data-yt-intl="英語版の動画ID"` を付けると、日本語以外で表示したときにそちらが再生されます。

## ロゴ画像

ヘッダーとフッターのロゴは、いまは文字（GardenHunt）で表示しています。
透過PNGのロゴをもらったら `assets/img/logo.png` として置き、`index.html` の `<span class="wordmark">…</span>` を `<img src="assets/img/logo.png" alt="Garden Hunt">` に差し替えてください。

## 掲載メディア

「掲載メディア」セクション（`index.html` の `#media`）に、以下を掲載しています。最初の6件を表示し、残りは「すべての記事を見る」で開きます。記事が増えたら `.media-list` の先頭に `<li>` を追加してください。

| 日付 | メディア | 記事 |
| --- | --- | --- |
| 2026.02.13 | ゲームメーカーズ | https://gamemakers.jp/article/2026_02_13_131159/ |
| 2026.02.06 | 4Gamer.net | https://www.4gamer.net/games/991/G999110/20260206031/ |
| 2026.01.20 | ムダウチゲームズ | https://mudauchi.info/428906 |
| 2026.01.17 | 電撃オンライン | https://dengekionline.com/article/202601/63360 |
| 2026.01.17 | note（るるいえ／Steamキュレーター） | https://note.com/gomabeaver/n/nda5c556d44ff |
| 2026.01.16 | GameWith | https://gamewith.jp/gamedb/13858/articles/52181 |
| 2025.12.06 | AUTOMATON WEST（英語） | https://automaton-media.com/en/news/garden-slug-girl-action-masochistic-platforming-and-summer-vacation-nostalgia-5-outdoorsy-japanese-indie-games/ |
| 2025.07.03 | ファミ通.com（東京ゲームダンジョン9 出展リスト） | https://www.famitsu.com/article/202507/46393 |
| 2025.07.02 | Gamer | https://www.gamer.ne.jp/news/202507020067/ |
| 2025.07.02 | 4Gamer.net | https://www.4gamer.net/games/925/G092584/20250702004/ |
| 2025.05.16 | Indie Freaks（PRJ rain） | https://www.indie-freaks.com/2025/05/tgd8-prj-rain |
| 2025.05.09 | リアルサウンド テック（PRJ rain） | https://realsound.jp/tech/2025/05/post-2013950.html |
| 2025.01.02 | Game*Spark（PRJ rain） | https://www.gamespark.jp/article/2025/01/02/148188.html |

ゲームデータベース：4Gamer.net まとめページ／GameWith ゲーム紹介／Metacritic

## 画像

スクリーンショットは Google ドライブの共有フォルダの画像を WebP に変換して使っています。

- `assets/img/ss/*.webp` … 1920px（拡大表示用）
- `assets/img/ss/*-s.webp` … 720px（一覧・サムネイル用）
- `assets/img/keyvisual-*.webp` … キービジュアル（768 / 1280 / 1920px）
- `assets/img/og.jpg` … SNS シェア用（1200×630）
- `assets/img/chara/*.webp` … キャラクター紹介・キャストのアイコン用の切り抜き
- `assets/img/movie/*.webp` … ムービーのサムネイル

## 公開（デプロイ）

静的ファイルなので、GitHub Pages・Netlify・Cloudflare Pages など、どこにでもそのまま置けます。

GitHub Pages の場合：リポジトリの **Settings → Pages** で、公開するブランチとフォルダ `/ (root)` を選ぶだけです。

> **公開 URL が決まったら**：`index.html` の `og:image`（と必要なら `og:url`）を `https://〜/assets/img/og.jpg` のような絶対 URL に書き換えてください。X（Twitter）などでシェアしたときにキービジュアルが表示されるようになります。

ローカルで確認する場合：

```sh
python3 -m http.server 8000
# → http://localhost:8000/
```
