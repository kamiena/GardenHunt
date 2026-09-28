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
assets/js/main.js       … 言語切り替え／スマホメニュー／画像拡大／YouTube 読み込み
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
- **その他の言語**：`assets/js/i18n.js` の同じキーを編集してください。
- 文言を追加したら、次のコマンドで全言語に訳がそろっているか確認できます。

  ```sh
  node tools/check-i18n.mjs
  ```

ストーリー・特徴の文章は Steam ストアページの公式テキスト（各言語版）をベースにしています。
「あそびかた」「FEVER TIME」などは、ゲーム画面内のチュートリアル表示と各メディア記事の内容をもとに書き起こしています。

## 掲載メディア

「掲載メディア」セクション（`index.html` の `#media`）に、以下を掲載しています。記事が増えたら `<li>` を追加してください。

| 日付 | メディア | 記事 |
| --- | --- | --- |
| 2026.01.17 | 電撃オンライン | https://dengekionline.com/article/202601/63360 |
| 2026.01.17 | note（るるいえ／Steamキュレーター） | https://note.com/gomabeaver/n/nda5c556d44ff |
| 2026.01.16 | GameWith | https://gamewith.jp/gamedb/13858/articles/52181 |
| 2025.12.06 | AUTOMATON WEST（英語） | https://automaton-media.com/en/news/garden-slug-girl-action-masochistic-platforming-and-summer-vacation-nostalgia-5-outdoorsy-japanese-indie-games/ |
| 2025.07.03 | ファミ通.com（東京ゲームダンジョン9 出展リスト） | https://www.famitsu.com/article/202507/46393 |
| 2025.07.02 | Gamer | https://www.gamer.ne.jp/news/202507020067/ |
| 2025.07.02 | 4Gamer.net | https://www.4gamer.net/games/925/G092584/20250702004/ |

ゲームデータベース：4Gamer.net まとめページ／GameWith ゲーム紹介／Metacritic

## 画像

スクリーンショットは Google ドライブの共有フォルダの画像を WebP に変換して使っています。

- `assets/img/ss/*.webp` … 1920px（拡大表示用）
- `assets/img/ss/*-s.webp` … 720px（一覧・サムネイル用）
- `assets/img/keyvisual-*.webp` … キービジュアル（768 / 1280 / 1920px）
- `assets/img/og.jpg` … SNS シェア用（1200×630）
- `assets/img/chara/*.webp` … キャラクター紹介用の切り抜き

## 公開（デプロイ）

静的ファイルなので、GitHub Pages・Netlify・Cloudflare Pages など、どこにでもそのまま置けます。

GitHub Pages の場合：リポジトリの **Settings → Pages** で、公開するブランチとフォルダ `/ (root)` を選ぶだけです。

> **公開 URL が決まったら**：`index.html` の `og:image`（と必要なら `og:url`）を `https://〜/assets/img/og.jpg` のような絶対 URL に書き換えてください。X（Twitter）などでシェアしたときにキービジュアルが表示されるようになります。

ローカルで確認する場合：

```sh
python3 -m http.server 8000
# → http://localhost:8000/
```
