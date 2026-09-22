// Adapt the shareable end-user guide for this static website.
// Embedded pictures become separate cacheable files; the original stays intact.
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
if (!process.argv[2]) throw new Error('Pass the RazeTag-Features.html source path.');
const source = resolve(process.argv[2]);
const output = resolve(root, 'guide.html');
if (source === output) throw new Error('Use the original end-user guide, not the generated web copy.');
let html = readFileSync(source, 'utf8');
const originalHash = createHash('sha256').update(html).digest('hex');
const chapterCount = (html.match(/class="chapter(?:\s|\")/g) || []).length;
const screenCount = (html.match(/\bdata-screen=/g) || []).length;
if (chapterCount !== 15 || screenCount < 28 || screenCount > 40) throw new Error(`Review the guide structure before syncing: ${chapterCount} chapters, ${screenCount} screenshots.`);
if (!html.includes('Your everyday guide')) throw new Error('Unexpected guide source.');
const plainSource = html.replace(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/g, '');
if (/\/Users\/|file:\/\/|localhost|127\.0\.0\.1|<iframe\b/i.test(plainSource)) throw new Error('Local-only reference found in the shareable guide.');
function replaceOnce(from, to) {
  if (!html.includes(from) || html.indexOf(from) !== html.lastIndexOf(from)) throw new Error(`Expected one source marker: ${from.slice(0,80)}`);
  html = html.replace(from, () => to);
}
replaceOnce('<title>RazeTag — Your everyday guide</title>', '<title>RazeTag — User guide</title>');
replaceOnce('<a class="brand" href="#welcome">', '<a class="brand" href="index.html" aria-label="Back to RazeTag home">');
replaceOnce('<div class="top-actions">', '<div class="top-actions"><a class="button quiet guide-home" href="index.html">← Home</a>');
replaceOnce('<a href="#welcome">Back to top ↑</a></footer>', '<a href="index.html">← Back to RazeTag</a><a href="privacy.html">Privacy Policy</a><a href="mailto:razedevworkspace@gmail.com">Support</a><a href="#welcome">Back to top ↑</a></footer>');
replaceOnce('</head>', `  <style id="website-navigation">
    .topbar{height:auto;min-height:82px;padding-block:12px;flex-wrap:wrap}
    .top-actions{flex-wrap:wrap;max-width:100%}
    .guide-home{white-space:nowrap}
    @media(max-width:600px){.topbar{min-height:72px}.chapter{scroll-margin-top:150px}}
  </style>
</head>`);

const assets = new Map();
html = html.replace(/\b(src|href)="data:(image\/(?:png|jpeg|svg\+xml));base64,([A-Za-z0-9+/=]+)"/g, (_, attr, mime, base64) => {
  const bytes = Buffer.from(base64, 'base64');
  const digest = createHash('sha256').update(bytes).digest('hex').slice(0,20);
  const extension = {'image/png':'png','image/jpeg':'jpg','image/svg+xml':'svg'}[mime];
  const relative = `images/guide/${digest}.${extension}`;
  assets.set(relative, bytes);
  return `${attr}="${relative}"`;
});
if (assets.size < 29 || assets.size > screenCount + 1 || /data:image\//.test(html)) throw new Error('Unexpected or unextracted guide assets.');
for (const [, script] of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new Script(script);
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
if (new Set(ids).size !== ids.length) throw new Error('Duplicate guide IDs.');
for (const [, anchor] of html.matchAll(/\bhref="#([^"]+)"/g)) if (!ids.includes(anchor)) throw new Error(`Broken guide anchor: ${anchor}`);
mkdirSync(resolve(root, 'images/guide'), {recursive:true});
for (const [relative, bytes] of assets) writeFileSync(resolve(root, relative), bytes);
writeFileSync(output, html);
console.log(JSON.stringify({output,chapters:chapterCount,screenshots:screenCount,assets:assets.size,htmlBytes:Buffer.byteLength(html),sourceSha256:originalHash},null,2));
