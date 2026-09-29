// 翻訳キーのチェック： node tools/check-i18n.mjs
// index.html の data-i18n / data-i18n-html / data-i18n-attr のキーが
// assets/js/i18n.js の全言語にそろっているかを確認します。
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const src = readFileSync(join(root, 'assets/js/i18n.js'), 'utf8');

const sandbox = { window: {} };
vm.runInNewContext(src, sandbox);
const { languages, strings } = sandbox.window.GH_I18N;

// JavaScript からだけ使うキー（index.html に日本語の原文が無いので i18n.js の ja にも必要）
const jsOnly = ['ui.screenshot', 'movie.comic.title', 'media.less', 'lp.less'];
const keys = new Set(['meta.title', 'meta.description', ...jsOnly]);
for (const m of html.matchAll(/data-title-key="([^"]+)"/g)) keys.add(m[1]);
for (const m of html.matchAll(/data-i18n(?:-html)?="([^"]+)"/g)) keys.add(m[1]);
for (const m of html.matchAll(/data-i18n-attr="([^"]+)"/g)) {
  for (const pair of m[1].split(';')) {
    const key = pair.split(':').slice(1).join(':').trim();
    if (key) keys.add(key);
  }
}

// どの言語でも同じ表記でよいキー（English からのフォールバックで十分）
const shared = new Set(['ui.buyShort']);

let problems = 0;
const missingJa = jsOnly.filter((k) => !(k in (strings.ja || {})));
if (missingJa.length) { problems += missingJa.length; console.log(`[ja] missing JS-only keys: ${missingJa.join(', ')}`); }
for (const { code } of languages) {
  if (code === 'ja') continue;
  const dict = strings[code] || {};
  const missing = [...keys].filter((k) => !(k in dict) && !(shared.has(k) && k in strings.en));
  const unused = Object.keys(dict).filter((k) => !keys.has(k));
  if (missing.length) { problems += missing.length; console.log(`[${code}] missing: ${missing.join(', ')}`); }
  if (unused.length) console.log(`[${code}] unused (not in index.html): ${unused.join(', ')}`);
}

// HTML 断片の簡易チェック（開き・閉じタグの数）
for (const [code, dict] of Object.entries(strings)) {
  for (const [key, value] of Object.entries(dict)) {
    for (const tag of ['p', 'strong']) {
      const open = (value.match(new RegExp(`<${tag}>`, 'g')) || []).length;
      const close = (value.match(new RegExp(`</${tag}>`, 'g')) || []).length;
      if (open !== close) { problems++; console.log(`[${code}] ${key}: <${tag}> mismatch`); }
    }
  }
}

console.log(`${keys.size} keys × ${languages.length} languages checked.`);
if (problems) { console.log(`✗ ${problems} problem(s) found.`); process.exit(1); }
console.log('✓ All translations are complete.');
