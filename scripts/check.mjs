// Public-site regression checks. Run: node scripts/check.mjs
// Use the bundled Node runtime or a runtime with access to bundled Playwright.
// Use --homepage-only for homepage checks without repeating the guide matrix.
// No app database, account, published site, or external service is accessed.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createServer} from 'node:http';
import {mkdir, readFile, realpath, writeFile} from 'node:fs/promises';
import {dirname, extname, resolve, sep} from 'node:path';
import {homedir} from 'node:os';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, '.preview/redesign-20261008');
const homepageOnly = process.argv.includes('--homepage-only');
const reportName = homepageOnly ? 'homepage-report.json' : 'report.json';
const supportEmail = 'razedevworkspace@gmail.com';
const runtime = resolve(homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node');
const require = createRequire(import.meta.url);
const {chromium} = require(resolve(process.env.RAZETAG_NODE_MODULES || `${runtime}/node_modules`, 'playwright'));
const chrome = process.env.RAZETAG_QA_CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const profiles = [
  {name: 'desktop', width: 1440, height: 1000},
  {name: 'tablet', width: 768, height: 1024},
  {name: 'mobile', width: 390, height: 844},
  {name: 'small-mobile', width: 320, height: 740},
  {name: 'text-200', width: 390, height: 844, textScale: 2},
];
const landingSections = ['features', 'start', 'workspace', 'sync', 'privacy', 'questions', 'guide'];
const chapterIds = ['welcome', 'first-item', 'photos', 'inventory', 'bundles', 'selling', 'returns', 'deliveries', 'money', 'tools', 'showcase', 'sharing', 'sync', 'shop-team', 'desktop', 'settings', 'safe'];
const newChapterIds = ['showcase', 'shop-team'];
const mascotSources = ['images/razetag-mascot-peek-20261008.webp', 'images/razetag-mascot-wave-20261008.webp'];
const result = {
  passed: false,
  mode: homepageOnly ? 'homepage-only' : 'full',
  startedAt: new Date().toISOString(),
  scope: 'Only index.html, guide.html, privacy.html, styles/site.css, and their public image assets; no application data.',
  expected: {landingSections: 8, featureCards: 6, startSteps: 3, faqs: 6, guideLinks: 2, chapters: chapterIds.length, chapterIds, screenshots: 30, privacySections: 10, supportEmail, syncImage: {width: 1536, height: 1024}, mascotSources},
  checks: [],
  artifacts: [],
  notes: [
    '200% text increases the root font size before initial layout and anchor scrolling; it is not browser page zoom.',
    'Safety checks inspect HTML, asset references, and readable image metadata. They are not OCR or QR decoding.',
    'Review screenshots visually for private data, pairing QR/codes, and legibility before publishing.',
    'The confirmed support/privacy contact is checked without opening an email app or sending email. Passing checks do not publish the site.',
  ],
};
await mkdir(output, {recursive: true});

async function check(name, work) {
  const start = Date.now();
  try {
    const details = await work();
    result.checks.push({name, passed: true, durationMs: Date.now() - start, ...(details === undefined ? {} : {details})});
    console.log(`PASS ${name}`);
    return true;
  } catch (error) {
    result.checks.push({name, passed: false, durationMs: Date.now() - start, error: error.message});
    console.error(`FAIL ${name}: ${error.message}`);
    return false;
  }
}

const publicPath = /^\/(?:index\.html|guide\.html|privacy\.html|styles\/site\.css|images\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]+\.(?:png|jpe?g|webp|gif|svg|ico))$/i;
async function publicFile(pathname) {
  const normalized = pathname === '/' ? '/index.html' : pathname;
  assert(publicPath.test(normalized), 'Not a public page, stylesheet, or image');
  const file = await realpath(resolve(root, `.${normalized}`));
  assert(file.startsWith(`${root}${sep}`), 'Outside public root');
  return file;
}

// The single public stylesheet is allowed explicitly. README, scripts, .preview,
// private exports, databases, and unlisted stylesheets are never served.
const server = createServer(async (request, response) => {
  try {
    let pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
    if (pathname.startsWith('/razetag_h5/')) pathname = pathname.slice('/razetag_h5'.length);
    const file = await publicFile(pathname);
    const mime = {
      '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif',
      '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
    }[extname(file).toLowerCase()];
    response.setHeader('Content-Type', mime);
    response.end(await readFile(file));
  } catch {
    response.statusCode = 404;
    response.end('Not found');
  }
});

const safetyRules = [
  ['local user or workspace path', /(?:\/Users\/|\/home\/|[A-Z]:\\Users\\|file:\/\/|\$HOME\b|\$CODEX_HOME\b)/i],
  ['local network address', /\b(?:localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})\b/i],
  ['private key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['credential token', /\b(?:sk-(?:proj-)?[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[A-Z0-9]{16})\b/],
  ['embedded credential', /(?:api[_-]?key|access[_-]?token|client[_-]?secret|session[_-]?key|password)\s*[=:]\s*["'][^"'\s]{8,}["']/i],
  ['pairing payload', /(?:razetag|raze[-_]?(?:tag|share|sync))[-\w]*:\/\/(?:pair|join|sync|share)[^\s"'<>]*/i],
  ['literal pairing code', /(?:pairing|nearby[- ]device|connection|verification)\s+(?:code|pin)\s*[:=]\s*["']?(?:\d[ -]?){4,16}\b/i],
  ['release access internals', /\b(?:release\.json|expiryDate|release_expiry|build[_ -]timestamp|release[_ -]expiry|trial[_ -]expiry)\b/i],
];
// Provider names are necessary disclosures in a privacy policy, not marketing
// implementation copy. All other public safety rules still apply to that page.
const marketingSafetyRules = [
  ['implementation stack in public copy', /\b(?:Flutter|SQLite|Firebase|Riverpod|AES-GCM|ML\s?Kit|TCGdex|TCGindex)\b/i],
];

async function safetyScan() {
  const assets = new Set();
  const findings = [];
  for (const name of ['index.html', 'guide.html', 'privacy.html']) {
    const html = await readFile(resolve(root, name), 'utf8');
    const rules = name === 'privacy.html' ? safetyRules : [...safetyRules, ...marketingSafetyRules];
    for (const [rule, pattern] of rules) {
      if (pattern.test(html)) findings.push({file: name, rule});
    }
    assert(!/<(?:iframe|object|embed)\b/i.test(html), `${name}: embedded external document`);
    for (const [, attribute, raw] of html.matchAll(/\b(src|href|action)=["']([^"']+)["']/gi)) {
      const value = raw.replaceAll('&amp;', '&');
      if (/^(?:javascript:|data:)/i.test(value)) findings.push({file: name, rule: `unsafe/embedded ${attribute}`});
      if (/\.(?:db|sqlite3?|razetag|zip)(?:[?#]|$)/i.test(value) || /(?:^|\/)(?:private|backups|\.preview|\.git|scripts)\//i.test(value)) {
        findings.push({file: name, rule: 'private data or tooling reference'});
      }
      if (value.startsWith('images/')) assets.add(value.split(/[?#]/)[0]);
    }
  }
  const css = await readFile(await publicFile('/styles/site.css'), 'utf8');
  for (const [rule, pattern] of [...safetyRules, ...marketingSafetyRules]) {
    if (pattern.test(css)) findings.push({file: 'styles/site.css', rule});
  }
  assert(!/@import\b/i.test(css), 'The public stylesheet must not import other stylesheets');
  assert(!/url\(\s*["']?(?:https?:|\/\/|data:|file:)/i.test(css), 'The public stylesheet must not embed or load remote resources');
  for (const relative of assets) {
    const bytes = await readFile(await publicFile(`/${relative}`));
    if (bytes.subarray(0, 16).toString() === 'SQLite format 3\0') findings.push({file: relative, rule: 'database disguised as image'});
    // Strong signatures also catch textual PNG/SVG/JPEG metadata without decoding pixels.
    const metadata = bytes.toString('latin1');
    for (const [rule, pattern] of safetyRules.slice(0, 5)) {
      if (pattern.test(metadata)) findings.push({file: relative, rule: `asset metadata: ${rule}`});
    }
  }
  assert.deepEqual(findings, [], 'Public content safety findings (matched values are deliberately not printed)');
  return {pages: 3, stylesheets: 1, referencedAssets: assets.size, findings};
}

let browser;
try {
  await check('public-content-safety', safetyScan);
  await new Promise(resolveReady => server.listen(0, '127.0.0.1', resolveReady));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const projectBase = `${origin}/razetag_h5/`;
  const localBase = pathToFileURL(`${root}/`).href;
  await check('public-http-whitelist-and-stylesheet-mime', async () => {
    for (const base of [`${origin}/`, projectBase]) {
      const stylesheet = await fetch(`${base}styles/site.css`);
      assert.equal(stylesheet.status, 200, 'The public stylesheet must load at root and project-relative hosting paths');
      assert.equal(stylesheet.headers.get('content-type'), 'text/css; charset=utf-8');
      assert((await stylesheet.text()).trim().length > 0, 'The public stylesheet must not be empty');
      for (const path of ['README.md', 'scripts/check.mjs', '.preview/redesign-20261008/report.json', '.git/config', 'styles/private.css', 'inventory.sqlite', 'images/../scripts/check.mjs']) {
        const response = await fetch(`${base}${path}`);
        assert.equal(response.status, 404, `Private or unlisted path was served: ${path}`);
      }
    }
    for (const path of ['/images/../index.html', '/images/guide/../../index.html', '/styles/../index.html']) {
      await assert.rejects(publicFile(path), /Not a public page, stylesheet, or image/, 'Public-file lookup must reject traversal before accessing a file');
    }
    return {stylesheets: ['styles/site.css'], mime: 'text/css; charset=utf-8', hostingPaths: 2, privatePathsRejected: 17};
  });
  browser = await chromium.launch({headless: true, executablePath: chrome, args: ['--disable-background-networking']});

  async function newPage(profile, offline = false) {
    const context = await browser.newContext({
      viewport: {width: profile.width, height: profile.height},
      reducedMotion: 'reduce', serviceWorkers: 'block', offline,
    });
    if (profile.textScale) {
      // Establish the larger text before initial fragment scrolling. Applying it
      // only after load would test an artificial reflow race, not a deep link
      // opened by someone already using larger text.
      await context.addInitScript(scale => {
        const apply = () => {
          if (!document.documentElement) return false;
          document.documentElement.style.fontSize = `${16 * scale}px`;
          return true;
        };
        if (!apply()) {
          const observer = new MutationObserver(() => { if (apply()) observer.disconnect(); });
          observer.observe(document, {childList: true});
        }
      }, profile.textScale);
    }
    const errors = [];
    const externalRequests = [];
    const requests = [];
    await context.route('**/*', route => {
      const url = route.request().url();
      const parsed = new URL(url);
      const localHttp = parsed.origin === origin;
      const localFile = parsed.protocol === 'file:' && parsed.href.startsWith(localBase);
      if (localHttp || localFile) return route.continue();
      externalRequests.push(url);
      return route.abort('blockedbyclient');
    });
    const page = await context.newPage();
    page.setDefaultTimeout(6000);
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    page.on('request', request => requests.push(request.url()));
    return {page, context, errors, externalRequests, requests};
  }

  async function goto(page, url, profile) {
    await page.goto(url, {waitUntil: 'load'});
    if (profile.textScale) await page.evaluate(scale => { document.documentElement.style.fontSize = `${16 * scale}px`; }, profile.textScale);
    await page.evaluate(() => document.fonts.ready);
  }

  async function loadImages(page) {
    const failed = await page.evaluate(async () => {
      const images = [...document.querySelectorAll('img[src]')];
      return (await Promise.all(images.map(async image => {
        image.loading = 'eager';
        try { await image.decode(); return image.naturalWidth ? null : image.getAttribute('src'); }
        catch { return image.getAttribute('src'); }
      }))).filter(Boolean);
    });
    assert.deepEqual(failed, [], 'Missing or undecodable images');
  }

  async function fit(page, label) {
    const sizes = await page.evaluate(() => {
      const width = document.documentElement.clientWidth;
      return {
        viewport: width, document: document.documentElement.scrollWidth,
        overflowing: [...document.querySelectorAll('main *, .topbar *, .presentation-controls *, footer *')].filter(element => {
          if (!element.getClientRects().length || element.closest('svg, dialog:not([open])')) return false;
          const rect = element.getBoundingClientRect();
          return rect.right > width + 1 || rect.left < -1;
        }).slice(0, 12).map(element => ({tag: element.tagName, id: element.id, class: typeof element.className === 'string' ? element.className : ''})),
      };
    });
    assert(sizes.document <= sizes.viewport + 1, `${label}: horizontal overflow ${JSON.stringify(sizes)}`);
    assert.equal(sizes.overflowing.length, 0, `${label}: elements outside viewport ${JSON.stringify(sizes)}`);
    return sizes;
  }

  async function imageRatios(page) {
    const images = await page.locator('img[src]').evaluateAll(elements => elements.map(image => {
      const style = getComputedStyle(image);
      const rect = image.getBoundingClientRect();
      const number = name => parseFloat(style[name]) || 0;
      const width = rect.width - number('borderLeftWidth') - number('borderRightWidth') - number('paddingLeft') - number('paddingRight');
      const height = rect.height - number('borderTopWidth') - number('borderBottomWidth') - number('paddingTop') - number('paddingBottom');
      return {
        src: image.getAttribute('src'), visible: width > 0 && height > 0,
        natural: image.naturalWidth / image.naturalHeight, rendered: width / height,
        declaredWidth: Number(image.getAttribute('width')), declaredHeight: Number(image.getAttribute('height')),
        naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight,
      };
    }));
    for (const item of images) {
      assert(item.naturalWidth > 0, `No decoded source: ${item.src}`);
      if (item.visible) assert(Math.abs(item.rendered / item.natural - 1) < 0.015, `Stretched image: ${JSON.stringify(item)}`);
      if (item.declaredWidth && item.declaredHeight) assert(Math.abs((item.declaredWidth / item.declaredHeight) / item.natural - 1) < 0.015, `Wrong declared aspect ratio: ${JSON.stringify(item)}`);
    }
    return {images: images.length, visibleImages: images.filter(item => item.visible).length};
  }

  async function anchors(page) {
    const issues = await page.evaluate(() => {
      const ids = [...document.querySelectorAll('[id]')].map(element => element.id);
      const missing = [...document.querySelectorAll('a[href^="#"], use[href^="#"]')]
        .map(element => element.getAttribute('href')).filter(href => href !== '#' && !document.getElementById(decodeURIComponent(href.slice(1))));
      return {missing, duplicates: ids.filter((id, index) => ids.indexOf(id) !== index)};
    });
    assert.deepEqual(issues, {missing: [], duplicates: []}, 'Broken anchors/icons or duplicate IDs');
    return issues;
  }

  async function screenshot(page, name, fullPage = false, selector = null) {
    const filename = `${name}.png`;
    if (selector) await page.locator(selector).screenshot({path: resolve(output, filename)});
    else await page.screenshot({path: resolve(output, filename), fullPage});
    result.artifacts.push(filename);
  }

  async function chapterDestination(page, id) {
    await page.waitForLoadState('load');
    await loadImages(page);
    await page.evaluate(() => new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done))));
    const state = await page.evaluate(chapterId => {
      const chapter = document.getElementById(chapterId);
      return {
        selected: document.getElementById('chapter-select').value,
        targetTop: chapter.getBoundingClientRect().top,
        scrollMargin: parseFloat(getComputedStyle(chapter).scrollMarginTop) || 0,
      };
    }, id);
    assert.equal(state.selected, id, `Wrong deep-link selection: ${JSON.stringify(state)}`);
    assert(state.targetTop >= -1 && state.targetTop <= state.scrollMargin + 5, `Deep-link target drifted after images loaded: ${JSON.stringify(state)}`);
    return state;
  }

  async function homepageNavigation(page, id) {
    const original = new URL(page.url());
    const links = page.locator(`a[href="#${id}"]`);
    const count = await links.count();
    assert(count > 0, `Homepage should link to its own #${id} explanation`);
    assert.equal(await page.locator(`main > section#${id}`).count(), 1, `Missing standalone homepage #${id} section`);
    const positions = [];
    for (let index = 0; index < count; index++) {
      await links.nth(index).click();
      const destination = new URL(page.url());
      assert.equal(destination.pathname, original.pathname, `Homepage #${id} action left the homepage`);
      assert.equal(destination.hash, `#${id}`);
      assert.equal(await page.locator('main > section').count(), 8);
      await page.evaluate(() => new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done))));
      const position = await page.evaluate(target => {
        const header = document.querySelector('.topbar');
        const section = document.getElementById(target);
        const heading = section.querySelector('.eyebrow, h2');
        return {
          headerPosition: getComputedStyle(header).position,
          headerBottom: header.getBoundingClientRect().bottom,
          headingTop: heading.getBoundingClientRect().top,
          viewportHeight: innerHeight,
        };
      }, id);
      const minimum = position.headerPosition === 'sticky' ? position.headerBottom - 1 : -1;
      assert(position.headingTop >= minimum && position.headingTop < position.viewportHeight, `Homepage #${id} heading was not reached or is covered: ${JSON.stringify(position)}`);
      positions.push(position);
    }
    return {linksChecked: count, destination: `#${id}`, stayedOnHomepage: true, positions};
  }

  async function homepagePassiveContent(page) {
    assert.equal(await page.locator('script, form, iframe, object, embed').count(), 0, 'Homepage must have no scripts, forms, or embedded documents');
    assert.equal(await page.locator('meta[http-equiv="refresh" i]').count(), 0, 'Homepage must not auto-redirect');
    assert.equal(await page.locator('link[rel="stylesheet"]').count(), 1, 'Homepage should have one local stylesheet');
    assert.equal((await page.locator('link[rel="stylesheet"]').getAttribute('href')).split(/[?#]/)[0], 'styles/site.css');
    const activeContent = await page.evaluate(() => {
      const handlers = [...document.querySelectorAll('*')].filter(element => [...element.attributes].some(attribute => /^on/i.test(attribute.name)));
      const isRemote = raw => {
        const url = new URL(raw, location.href);
        return url.protocol !== location.protocol || url.origin !== location.origin || (url.protocol === 'file:' && !url.pathname.startsWith(location.pathname.slice(0, location.pathname.lastIndexOf('/') + 1)));
      };
      const remoteResources = [...document.querySelectorAll('[src], [srcset], link[href]')].filter(element => {
        if (element.hasAttribute('srcset') && element.getAttribute('srcset').split(',').some(source => isRemote(source.trim().split(/\s+/)[0]))) return true;
        const source = element.getAttribute('src') || element.getAttribute('href');
        return source ? isRemote(source) : false;
      });
      const stylesheets = [...document.styleSheets].map(sheet => {
        try { return {href: sheet.href, rules: sheet.cssRules.length}; }
        catch (error) { return {href: sheet.href, rules: null, cssomError: error.name}; }
      });
      const stylesheetApplied = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim().length > 0;
      const externalCSS = [...document.querySelectorAll('style, [style]')].some(element => /@import\b|url\(\s*["']?(?:https?:|\/\/|data:)/i.test(element.textContent + (element.getAttribute('style') || '')));
      return {inlineHandlers: handlers.length, remoteResources: remoteResources.length, stylesheets, stylesheetApplied, externalCSS};
    });
    assert.equal(activeContent.inlineHandlers, 0, 'Homepage must not use inline event handlers');
    assert.equal(activeContent.remoteResources, 0, 'Homepage must not load remote fonts or tracking resources');
    assert.equal(activeContent.externalCSS, false, 'Homepage must not embed remote CSS resources');
    const localStylesheet = activeContent.stylesheets.find(sheet => sheet.href && /\/styles\/site\.css$/.test(new URL(sheet.href).pathname));
    assert(localStylesheet && activeContent.stylesheetApplied, 'The local stylesheet was not applied');
    if (new URL(page.url()).protocol === 'file:' && localStylesheet.cssomError === 'SecurityError') {
      // Chromium may deny CSSOM reads between local files even when the sheet
      // loads normally. Its own properties still confirm it has been applied.
      assert.equal(localStylesheet.rules, null);
    } else assert(localStylesheet.rules > 0, 'The local stylesheet has no readable CSS rules');
    return {scripts: 0, forms: 0, ...activeContent};
  }

  async function homepageFeatures(page) {
    const cards = page.locator('#features .feature-card');
    assert.equal(await cards.count(), 6, 'Homepage needs all six feature topics');
    assert.equal(await page.locator('#features article.feature-card').count(), 6, 'Feature cards should be non-link articles');
    assert.equal(await page.locator('.feature-card[href], .feature-card a, .feature-card button, .feature-card[role="link"], .feature-card[onclick], .feature-card[tabindex]').count(), 0, 'Feature cards must not navigate or act as interactive controls');
    const topics = [
      {id: 'stock-title', topic: 'inventory', patterns: [/\bInventory\b/i, /\bphotos\b/i, /\bhistory\b/i]},
      {id: 'money-title', topic: 'profit, cash flow, and budget', patterns: [/\bprofit\b/i, /\bCash flow\b/i, /\bMonthly budget\b/i]},
      {id: 'bundle-title', topic: 'purchase bundles', patterns: [/\bpurchase bundle\b/i, /\bcost\b/i, /\bseparately\b/i]},
      {id: 'quantity-title', topic: 'partial sales and returns', patterns: [/\bquantity sold\b/i, /\bremaining stock\b/i, /\brefund or return\b/i]},
      {id: 'listing-title', topic: 'public listing tools', patterns: [/\bListing tools\b/i, /\bpublic description\b/i, /\bprivate notes\b/i]},
      {id: 'showcase-title', topic: 'customer Showcase', patterns: [/\bShowcase\b/i, /not a public online store/i, /\bprivate purchase details\b/i]},
    ];
    for (const {id, topic, patterns} of topics) {
      const card = page.locator(`#features article.feature-card[aria-labelledby="${id}"]`);
      assert.equal(await card.count(), 1, `Missing feature topic: ${topic}`);
      const text = await card.innerText();
      for (const pattern of patterns) assert(pattern.test(text), `Feature topic ${topic} lost a required explanation`);
      assert((await card.locator(`#${id}`).innerText()).trim().length > 10, `Feature topic ${topic} needs an accessible heading`);
    }
    return {nonNavigatingArticles: 6, topics: topics.map(item => item.topic)};
  }

  async function homepageMascots(page) {
    const dimensions = [];
    for (const source of mascotSources) {
      const image = page.locator(`img[src="${source}"]`);
      assert.equal(await image.count(), 1, `Missing mascot artwork: ${source}`);
      await image.evaluate(element => element.decode());
      const state = await image.evaluate(element => ({src: element.getAttribute('src'), width: element.naturalWidth, height: element.naturalHeight, alt: element.alt, hidden: element.getAttribute('aria-hidden'), visible: element.getBoundingClientRect().width > 0 && element.getBoundingClientRect().height > 0}));
      assert(state.width > 0 && state.height > 0 && state.visible, `Mascot did not load visibly: ${source}`);
      assert.equal(state.alt, '', 'Decorative mascots should not repeat content for screen readers');
      assert.equal(state.hidden, 'true', 'Decorative mascots should be hidden from assistive technology');
      dimensions.push(state);
    }
    await imageRatios(page);
    return {images: dimensions};
  }

  async function homepageHeader(page, profile) {
    const position = await page.locator('.topbar').evaluate(element => getComputedStyle(element).position);
    assert.equal(position, profile.width <= 680 ? 'static' : 'sticky', 'Header should be sticky only above the mobile breakpoint');
    if (profile.name === 'desktop') {
      try {
        for (const [width, expected] of [[680, 'static'], [681, 'sticky']]) {
          await page.setViewportSize({width, height: profile.height});
          assert.equal(await page.locator('.topbar').evaluate(element => getComputedStyle(element).position), expected, `Wrong header behavior at ${width}px`);
          await fit(page, `header breakpoint ${width}px`);
        }
      } finally {
        await page.setViewportSize({width: profile.width, height: profile.height});
      }
    }
    return {width: profile.width, position, mobileBreakpoint: 680};
  }

  async function homepageFaq(page, profile = null) {
    const details = page.locator('#questions details');
    assert.equal(await details.count(), 6, 'Homepage needs six native FAQ details');
    assert.equal(await page.locator('#questions details > summary').count(), 6, 'Each FAQ needs a direct native summary');
    assert.equal(await details.locator('button, a, input, select, textarea').count(), 0, 'FAQ disclosure content must remain passive');
    const initial = await details.evaluateAll(elements => elements.map(element => element.open));
    assert.deepEqual(initial, Array(6).fill(false), 'FAQs should start collapsed');
    const questions = [];
    try {
      for (let index = 0; index < 6; index++) {
        const disclosure = details.nth(index);
        const summary = disclosure.locator(':scope > summary');
        const question = (await summary.innerText()).trim();
        assert(question.length > 8, 'FAQ questions need useful text');
        questions.push(question);
        await summary.focus();
        assert(await summary.evaluate(element => document.activeElement === element), 'FAQ summary must receive keyboard focus');
        for (const [key, open] of [['Enter', true], ['Space', false], ['Space', true], ['Enter', false]]) {
          await page.keyboard.press(key);
          assert.equal(await disclosure.evaluate(element => element.open), open, `FAQ ${index + 1}: ${key} did not ${open ? 'open' : 'close'} the disclosure`);
          assert(await summary.evaluate(element => document.activeElement === element), 'FAQ toggling should retain summary focus');
          if (open) {
            const answer = (await disclosure.innerText()).replace(question, '').trim();
            assert(answer.length > 20, `FAQ ${index + 1} needs a readable answer`);
            await fit(page, `FAQ ${index + 1} open`);
          }
        }
      }
      assert.equal(new Set(questions).size, 6, 'FAQ questions must be distinct');
      await details.evaluateAll(elements => elements.forEach(element => { element.open = true; }));
      await fit(page, 'all FAQs expanded');
      if (profile) await screenshot(page, `${profile.name}-homepage-faq-expanded`, false, '#questions');
      return {nativeDetails: 6, keyboardKeys: ['Enter', 'Space'], openCloseChecks: 24, questions};
    } finally {
      await details.evaluateAll((elements, state) => elements.forEach((element, index) => { element.open = state[index]; }), initial);
    }
  }

  async function syncIllustration(page) {
    const figure = page.locator('#sync figure.sync-diagram');
    assert.equal(await figure.count(), 1, 'Expected the generated sync illustration');
    assert.equal(await figure.locator('img').count(), 1);
    const image = figure.locator('img');
    assert.equal(await image.getAttribute('src'), 'images/razetag-sync-devices-20260923.webp');
    await image.evaluate(image => image.decode());
    const dimensions = await image.evaluate(image => ({
      width: image.naturalWidth, height: image.naturalHeight,
      declaredWidth: Number(image.getAttribute('width')), declaredHeight: Number(image.getAttribute('height')),
      alt: image.alt,
    }));
    assert.deepEqual({...dimensions, alt: undefined}, {width: 1536, height: 1024, declaredWidth: 1536, declaredHeight: 1024, alt: undefined});
    assert(dimensions.alt.trim().length > 20, 'Sync illustration needs meaningful alternative text');
    const caption = await figure.locator('figcaption').innerText();
    assert(caption.includes('One sync pair at a time'), 'Sync caption must explain the single-pair limit');
    assert(caption.includes('not actual app screens'), 'Illustration must not be presented as an app screenshot');
    await imageRatios(page);
    return {source: await image.getAttribute('src'), ...dimensions, caption};
  }

  async function supportContacts(page, privacy = false) {
    const expectedHref = `mailto:${supportEmail}`;
    const footerLink = page.locator('footer a[href^="mailto:"]');
    assert.equal(await footerLink.count(), 1, 'Expected one support email link in the footer');
    assert.equal(await footerLink.getAttribute('href'), expectedHref, 'Footer support email differs from the confirmed address');
    assert.equal(await footerLink.innerText(), privacy ? 'Contact support' : 'Support');
    const mailtoLinks = await page.locator('a[href^="mailto:"]').evaluateAll(elements => elements.map(element => element.getAttribute('href')));
    assert.deepEqual(mailtoLinks, Array(privacy ? 2 : 1).fill(expectedHref), 'Unexpected email address or mailto target');
    if (privacy) {
      const contactLink = page.locator('#contact a[href^="mailto:"]');
      assert.equal(await contactLink.count(), 1, 'Privacy contact section needs a direct email link');
      assert.equal(await contactLink.getAttribute('href'), expectedHref);
      assert.equal(await contactLink.innerText(), supportEmail, 'Privacy contact should display the confirmed address');
    }
    return {email: supportEmail, footerLinks: 1, mailtoLinks: mailtoLinks.length, emailAppOpened: false};
  }

  async function privacyStructure(page) {
    assert.equal(await page.locator('h1').innerText(), 'Privacy Policy');
    assert.equal(await page.locator('main .policy-section').count(), 10);
    assert.equal(await page.locator('.contents a[href^="#"]').count(), 10);
    assert.equal(await page.locator('script, form, iframe, object, embed').count(), 0, 'Privacy page must have no scripts, forms, or embedded documents');
    assert.equal(await page.locator('meta[http-equiv="refresh" i]').count(), 0, 'Privacy page must not auto-redirect');
    assert.equal(await page.locator('.draft-notice').count(), 0, 'Confirmed-contact privacy page must not retain its draft notice');
    assert(!/draft for review|pending confirmation|not ready for publication/i.test(await page.locator('body').innerText()), 'Privacy page still contains missing-contact draft copy');
    const robots = await page.locator('meta[name="robots" i]').evaluateAll(elements => elements.map(element => element.getAttribute('content')));
    assert(robots.every(value => !/\b(?:noindex|none)\b/i.test(value || '')), 'Confirmed-contact privacy page must not retain draft noindex');
    await supportContacts(page, true);
    const activeContent = await page.evaluate(() => {
      const elements = [...document.querySelectorAll('*')];
      const handlers = elements.filter(element => [...element.attributes].some(attribute => /^on/i.test(attribute.name)));
      const remoteResources = [...document.querySelectorAll('[src], [srcset], link[href]')].filter(element => {
        if (element.hasAttribute('srcset')) return true;
        const url = new URL(element.getAttribute('src') || element.getAttribute('href'), location.href);
        return url.protocol !== location.protocol || url.origin !== location.origin || (url.protocol === 'file:' && !url.pathname.startsWith(location.pathname.slice(0, location.pathname.lastIndexOf('/') + 1)));
      });
      const externalCSS = [...document.querySelectorAll('style, [style]')].some(element => /@import\b|url\(\s*["']?(?:https?:|\/\/|data:)/i.test(element.textContent + (element.getAttribute('style') || '')));
      return {inlineHandlers: handlers.length, remoteResources: remoteResources.length, externalCSS};
    });
    assert.deepEqual(activeContent, {inlineHandlers: 0, remoteResources: 0, externalCSS: false}, 'Privacy page must not load active content, remote fonts, or tracking resources');
    await loadImages(page);
    await imageRatios(page);
    return {
      sections: 10, scripts: 0, forms: 0, ...activeContent,
      robots, draft: false, supportEmail,
    };
  }

  async function privacyAnchors(page) {
    await anchors(page);
    const ids = await page.locator('.contents a[href^="#"]').evaluateAll(elements => elements.map(element => element.getAttribute('href').slice(1)));
    for (const id of ids) {
      await page.locator(`.contents a[href="#${id}"]`).click();
      assert.equal(new URL(page.url()).hash, `#${id}`);
      const position = await page.locator(`#${id}`).evaluate(element => ({top: element.getBoundingClientRect().top, viewportHeight: innerHeight}));
      assert(position.top >= -1 && position.top < position.viewportHeight, `Privacy section not reached: ${id} ${JSON.stringify(position)}`);
    }
    await page.locator('footer a[href="#top"]').click();
    assert.equal(new URL(page.url()).hash, '#top');
    assert(await page.evaluate(() => scrollY <= 1), 'Privacy back-to-top link did not return to top');
    return {sectionsVisited: ids};
  }

  async function privacyFooterNavigation(page, base, profile) {
    const visits = [];
    for (const name of ['index.html', 'guide.html']) {
      await goto(page, `${base}${name}`, profile);
      await supportContacts(page);
      const link = page.locator('footer a[href="privacy.html"]');
      assert.equal(await link.count(), 1, `${name} should have one relative privacy footer link`);
      await link.click();
      assert.equal(page.url(), `${base}privacy.html`, `${name} privacy footer destination`);
      if (profile.textScale) await page.evaluate(scale => { document.documentElement.style.fontSize = `${16 * scale}px`; }, profile.textScale);
      await privacyStructure(page);
      await fit(page, `${name} privacy destination`);
      await page.locator('.home-link').click();
      assert.equal(page.url(), `${base}index.html`, 'Privacy home link must preserve the hosting path');
      visits.push(name);
    }
    return {fromPages: visits, relativePrivacyTarget: 'privacy.html', relativeHomeTarget: 'index.html'};
  }

  async function lightbox(page, selector = '#welcome [data-screen]') {
    const opener = page.locator(selector).first();
    try {
      await opener.click();
      assert(await page.locator('#screen-dialog').evaluate(dialog => dialog.open), 'Lightbox did not open');
      await page.locator('#large-screen').evaluate(image => image.decode());
      assert(await page.locator('#close-screen').evaluate(button => document.activeElement === button), 'Close button should receive focus');
      // Native dialogs may pass focus to browser chrome for one tab stop, which
      // Chromium represents as BODY. No underlying page control may gain focus.
      for (const key of ['Tab', 'Tab', 'Shift+Tab', 'Shift+Tab']) {
        await page.keyboard.press(key);
        assert(await page.locator('#screen-dialog').evaluate(dialog => dialog.contains(document.activeElement) || document.activeElement === document.body), `${key} focused the underlying page`);
      }
      await page.locator('#close-screen').focus();
      await loadImages(page);
      await imageRatios(page);
      await page.keyboard.press('Escape');
      assert(!(await page.locator('#screen-dialog').evaluate(dialog => dialog.open)), 'Escape did not close lightbox');
      await page.waitForFunction(() => !document.body.classList.contains('modal-open'));
      assert(await opener.evaluate(button => document.activeElement === button), 'Focus did not return to screenshot');
      assert.equal(await page.locator('#large-screen').getAttribute('src'), null, 'Lightbox retained stale image');
      await opener.click();
      await page.locator('#close-screen').click();
      await page.waitForFunction(() => !document.body.classList.contains('modal-open'));
      assert(await opener.evaluate(button => document.activeElement === button), 'Close button did not restore focus');
    } finally {
      // Keep independent checks usable if an accessibility assertion fails.
      if (await page.locator('#screen-dialog').evaluate(dialog => dialog.open)) {
        await page.keyboard.press('Escape');
        await page.waitForFunction(() => !document.body.classList.contains('modal-open'));
      }
    }
  }

  async function presentation(page, profile) {
    await page.locator('#contents a[href="#welcome"]').evaluate(anchor => anchor.click());
    await page.locator('#present-button').click();
    const ids = await page.locator('.chapter').evaluateAll(elements => elements.map(element => element.id));
    assert.deepEqual(ids, chapterIds, 'Expected all 17 presentation chapters in the agreed order');
    for (const [index, id] of ids.entries()) {
      assert.equal(await page.locator('.chapter:visible').count(), 1, `Presentation chapter ${id}: hidden chapters visible`);
      assert.equal(await page.locator('.chapter:visible').getAttribute('id'), id);
      assert.equal(await page.locator('#chapter-counter').innerText(), `${index + 1} / ${chapterIds.length}`);
      assert.equal(await page.locator('#chapter-select').inputValue(), id);
      await fit(page, `presentation/${id}`);
      if (['sync', 'desktop', ...newChapterIds].includes(id)) await screenshot(page, `${profile.name}-presentation-${id}`);
      if (index < ids.length - 1) await page.locator('#next-chapter').click();
    }
    assert(await page.locator('#next-chapter').isDisabled(), 'Next must be disabled at the last chapter');
    await page.keyboard.press('ArrowLeft');
    assert.equal(await page.locator('.chapter:visible').getAttribute('id'), ids.at(-2));
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('.chapter:visible').getAttribute('id'), ids.at(-1));
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.chapter:visible').count(), chapterIds.length);
    assert(await page.locator('#present-button').evaluate(button => document.activeElement === button), 'Exit should restore presentation-button focus');
    return {chapterIds: ids};
  }

  async function printGuide(page) {
    const before = await page.locator('details').evaluateAll(elements => elements.map(element => element.open));
    await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
    await page.emulateMedia({media: 'print'});
    assert.equal(await page.locator('.chapter:visible').count(), chapterIds.length, 'Print must include all chapters');
    assert.equal(await page.locator('details:not([open])').count(), 0, 'Print must expand detailed examples');
    for (const selector of ['.topbar', '.sidebar', '.mobile-navigation', '#presentation-controls', '#screen-dialog']) {
      assert.equal(await page.locator(`${selector}:visible`).count(), 0, `${selector} should not print`);
    }
    await loadImages(page);
    await page.emulateMedia({media: 'screen'});
    await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
    assert.deepEqual(await page.locator('details').evaluateAll(elements => elements.map(element => element.open)), before, 'Print changed reading-view details state');
    // Chromium dispatches its own beforeprint/afterprint events for PDF output.
    // Do not nest those inside the manual lifecycle check above.
    await page.pdf({path: resolve(output, 'guide-print.pdf'), format: 'A4', printBackground: true, margin: {top: '12mm', right: '12mm', bottom: '12mm', left: '12mm'}});
    result.artifacts.push('guide-print.pdf');
    assert.deepEqual(await page.locator('details').evaluateAll(elements => elements.map(element => element.open)), before, 'PDF generation changed reading-view details state');
    // Check the UI action without opening an interactive native print dialog.
    await page.evaluate(() => { window.__qaPrintCalled = false; window.print = () => { window.__qaPrintCalled = true; }; });
    await page.locator('#print-button').click();
    assert(await page.evaluate(() => window.__qaPrintCalled), 'Print button did not invoke print');
    return {allChapters: chapterIds.length, restoresDetails: true};
  }

  for (const profile of profiles) {
    const {page, context, errors, externalRequests, requests} = await newPage(profile);
    try {
      const landingLoaded = await check(`${profile.name}/landing-load`, () => goto(page, projectBase, profile));
      if (!landingLoaded) continue;
      await check(`${profile.name}/landing-structure`, async () => {
        const sections = await page.locator('main > section').evaluateAll(elements => elements.map(element => ({id: element.id, hero: element.classList.contains('hero')})));
        assert.equal(sections.length, 8);
        assert.equal(sections[0].hero, true, 'Hero must remain the first homepage section');
        assert.deepEqual(sections.slice(1).map(section => section.id), landingSections, 'Homepage sections should keep the agreed order');
        assert.equal(await page.locator('h1').count(), 1, 'Homepage needs one primary heading');
        assert.equal(await page.locator('#start ol.start-steps').count(), 1, 'Getting-started steps should be an ordered list');
        assert.equal(await page.locator('#start ol.start-steps > li').count(), 3);
        assert.equal(await page.locator('#start ol.start-steps > li h3').count(), 3, 'Each starting step needs a heading');
        assert.equal(await page.locator('#questions details').count(), 6);
        assert.equal(await page.locator('.desktop-preview img').count(), 1);
        assert.equal(await page.locator('.desktop-preview a').count(), 0, 'Workspace image should not redirect to the guide');
        const links = await page.locator('a[href]').evaluateAll(elements => elements.filter(element => /\/guide\.html$/.test(new URL(element.href).pathname)).map(element => element.getAttribute('href')));
        assert.deepEqual(links, ['guide.html', 'guide.html'], 'Keep exactly two explicit guide links, without chapter redirects');
        assert.equal(await page.locator('.nav a[href="guide.html"]').count(), 1, 'Keep the navigation guide link');
        assert.equal(await page.locator('.guide-intro a[href="guide.html"]').count(), 1, 'Keep the final guide CTA');
        assert.equal(await page.locator('#workspace a[href^="guide.html"]').count(), 0, 'Workspace should explain itself on the homepage');
        return {sections, startSteps: 3, faqs: 6, guideLinks: links.length};
      });
      await check(`${profile.name}/landing-no-active-content-and-local-stylesheet`, () => homepagePassiveContent(page));
      await check(`${profile.name}/six-feature-topics-and-non-navigation`, () => homepageFeatures(page));
      await check(`${profile.name}/landing-images`, async () => { await loadImages(page); return imageRatios(page); });
      await check(`${profile.name}/mascot-images`, () => homepageMascots(page));
      await check(`${profile.name}/landing-support-contact`, () => supportContacts(page));
      await check(`${profile.name}/sync-generated-image`, () => syncIllustration(page));
      await check(`${profile.name}/responsive-header`, () => homepageHeader(page, profile));
      await check(`${profile.name}/landing-layout`, () => fit(page, 'landing'));
      await check(`${profile.name}/landing-anchors`, () => anchors(page));
      await check(`${profile.name}/faq-keyboard-open-close-and-layout`, () => homepageFaq(page, profile));
      await check(`${profile.name}/no-guide-preload`, async () => {
        assert(!requests.some(url => /\/guide\.html(?:[?#]|$)/.test(url)), 'Landing prematurely fetched the full guide');
        // Shared screenshot assets are intentional; only the guide document must stay unloaded.
      });
      await screenshot(page, `${profile.name}-landing`, true);
      if (['small-mobile', 'text-200'].includes(profile.name)) await screenshot(page, `${profile.name}-landing-footer`, false, 'footer');
      await check(`${profile.name}/homepage-how-to-anchor-stays-local`, () => homepageNavigation(page, 'start'));
      await screenshot(page, `${profile.name}-homepage-start`, false, 'main > section#start');
      await check(`${profile.name}/homepage-sync-stays-local`, () => homepageNavigation(page, 'sync'));
      await screenshot(page, `${profile.name}-homepage-sync`, false, 'main > section#sync');
      if (homepageOnly) continue;
      const guideLoaded = await check(`${profile.name}/open-guide`, async () => {
        await page.locator('.nav a[href="guide.html"]').click();
        assert.equal(page.url(), `${projectBase}guide.html`);
        if (profile.textScale) await page.evaluate(() => { document.documentElement.style.fontSize = '32px'; });
      });
      if (!guideLoaded) continue;
      await check(`${profile.name}/guide-structure`, async () => {
        const actualChapterIds = await page.locator('.chapter').evaluateAll(elements => elements.map(element => element.id));
        const screens = await page.locator('[data-screen]').count();
        assert.deepEqual(actualChapterIds, chapterIds, 'Keep all 17 guide chapters in the agreed order');
        assert.equal(screens, 30, 'Keep all 30 guide screenshots');
        const contentsIds = await page.locator('#contents a').evaluateAll(elements => elements.map(element => element.getAttribute('href').slice(1)));
        const selectIds = await page.locator('#chapter-select option').evaluateAll(elements => elements.map(element => element.value));
        assert.deepEqual(contentsIds, chapterIds, 'Guide contents should link to every chapter in order');
        assert.deepEqual(selectIds, chapterIds, 'Mobile chapter selector should include every chapter in order');
        assert.equal(await page.locator('img[src^="data:"]').count(), 0);
        for (const id of newChapterIds) {
          assert((await page.locator(`#${id} h2`).innerText()).trim().length > 10, `${id} needs a useful chapter heading`);
          assert((await page.locator(`#${id}`).innerText()).trim().length > 300, `${id} needs substantive guide instructions`);
        }
        return {chapters: actualChapterIds, screenshots: screens};
      });
      await check(`${profile.name}/guide-images`, () => loadImages(page));
      await check(`${profile.name}/guide-support-contact`, () => supportContacts(page));
      await check(`${profile.name}/guide-anchors`, () => anchors(page));
      await check(`${profile.name}/guide-layout`, () => fit(page, 'guide'));
      await screenshot(page, `${profile.name}-guide`);
      if (['small-mobile', 'text-200'].includes(profile.name)) await screenshot(page, `${profile.name}-guide-footer`, false, 'footer');
      await check(`${profile.name}/expanded-details-layout-and-ratios`, async () => {
        await page.locator('details').evaluateAll(elements => elements.forEach(element => { element.open = true; }));
        await loadImages(page);
        await fit(page, 'expanded guide');
        const ratios = await imageRatios(page);
        await page.locator('details').evaluateAll(elements => elements.forEach(element => { element.open = false; }));
        return ratios;
      });
      await check(`${profile.name}/lightbox-focus`, () => lightbox(page));
      await check(`${profile.name}/all-presentation-chapters`, () => presentation(page, profile));
      // Recover clean reading mode even when a presentation assertion failed.
      await goto(page, `${projectBase}guide.html`, profile);
      await check(`${profile.name}/home-and-new-deep-links`, async () => {
        await page.locator('.guide-home').click();
        assert.equal(page.url(), `${projectBase}index.html`);
        await page.locator('.guide-intro a[href="guide.html"]').click();
        assert.equal(page.url(), `${projectBase}guide.html`, 'Final guide CTA should open the guide');
        await page.locator('.guide-home').click();
        for (const id of ['first-item', ...newChapterIds, 'sync', 'desktop']) {
          await goto(page, `${projectBase}guide.html#${id}`, profile);
          assert.equal(page.url(), `${projectBase}guide.html#${id}`);
          await chapterDestination(page, id);
          await page.locator('#present-button').click();
          assert.equal(await page.locator('.chapter:visible').getAttribute('id'), id);
          await page.keyboard.press('Escape');
          await page.locator('.guide-home').click();
        }
      });
      if (profile.name === 'desktop') {
        await goto(page, `${projectBase}guide.html#desktop`, profile);
        await check('desktop/desktop-screenshot-lightbox', () => lightbox(page, '#desktop [data-screen]'));
        await check('desktop/print', () => printGuide(page));
      }
    } finally {
      await check(`${profile.name}/no-console-errors-or-external-requests`, async () => {
        assert.deepEqual(errors, [], 'Browser page/HTTP errors');
        assert.deepEqual(externalRequests, [], 'External requests were blocked');
        return {requests: requests.length, externalRequests: 0};
      });
      await context.close();
    }
  }

  for (const profile of homepageOnly ? [] : profiles) {
    const {page, context, errors, externalRequests, requests} = await newPage(profile);
    try {
      const loaded = await check(`${profile.name}/privacy-load`, () => goto(page, `${projectBase}privacy.html`, profile));
      if (!loaded) continue;
      await check(`${profile.name}/privacy-structure-and-no-active-content`, () => privacyStructure(page));
      await check(`${profile.name}/privacy-layout`, () => fit(page, 'privacy'));
      await screenshot(page, `${profile.name}-privacy`);
      await screenshot(page, `${profile.name}-privacy-full`, true);
      if (['desktop', 'small-mobile', 'text-200'].includes(profile.name)) {
        await screenshot(page, `${profile.name}-privacy-contact`, false, '#contact');
        await screenshot(page, `${profile.name}-privacy-footer`, false, 'footer');
      }
      await check(`${profile.name}/privacy-anchors`, () => privacyAnchors(page));
      await check(`${profile.name}/privacy-from-home-and-guide-footers`, () => privacyFooterNavigation(page, projectBase, profile));
    } finally {
      await check(`${profile.name}/privacy-no-errors-or-external-requests`, async () => {
        assert.deepEqual(errors, [], 'Browser page/HTTP errors');
        assert.deepEqual(externalRequests, [], 'Privacy attempted external requests');
        return {requests: requests.length, externalRequests: 0};
      });
      await context.close();
    }
  }

  for (const [name, base, offline] of homepageOnly ? [] : [['http-root', `${origin}/`, false], ['file-offline', localBase, true]]) {
    const profile = profiles[0];
    const {page, context, errors, externalRequests, requests} = await newPage(profile, offline);
    try {
      await check(`${name}/navigation-images-and-deep-links`, async () => {
        await goto(page, `${base}index.html`, profile);
        await loadImages(page);
        await anchors(page);
        await homepagePassiveContent(page);
        await homepageFeatures(page);
        await homepageMascots(page);
        await homepageFaq(page);
        await syncIllustration(page);
        await homepageNavigation(page, 'start');
        await homepageNavigation(page, 'sync');
        await page.locator('.nav a[href="guide.html"]').click();
        assert.equal(page.url(), `${base}guide.html`);
        await loadImages(page);
        await anchors(page);
        await lightbox(page);
        for (const id of [...newChapterIds, 'sync', 'desktop']) {
          await page.locator('.guide-home').click();
          assert.equal(page.url(), `${base}index.html`);
          await goto(page, `${base}guide.html#${id}`, profile);
          assert.equal(page.url(), `${base}guide.html#${id}`);
          await chapterDestination(page, id);
          await page.locator('#present-button').click();
          assert.equal(await page.locator('.chapter:visible').getAttribute('id'), id);
          await page.keyboard.press('Escape');
        }
        await screenshot(page, `${name}-desktop-chapter`);
        await page.locator('.guide-home').click();
        assert.equal(page.url(), `${base}index.html`);
        if (offline) assert(requests.every(url => url.startsWith(localBase)), 'Offline file page attempted network access');
        return {offline, lightbox: true, homepageAnchors: ['start', 'sync'], deepLinks: [...newChapterIds, 'sync', 'desktop']};
      });
      await check(`${name}/privacy-relative-navigation`, async () => {
        const navigation = await privacyFooterNavigation(page, base, profile);
        await goto(page, `${base}privacy.html`, profile);
        await privacyAnchors(page);
        await screenshot(page, `${name}-privacy`);
        if (offline) assert(requests.every(url => url.startsWith(localBase)), 'Offline privacy page attempted network access');
        return {...navigation, offline};
      });
    } finally {
      await check(`${name}/no-errors-or-external-requests`, async () => {
        assert.deepEqual(errors, []);
        assert.deepEqual(externalRequests, []);
      });
      await context.close();
    }
  }

  // Each trial gets a fresh browser context. This catches image-loading races
  // that a warm guide navigation can hide, including direct offline files.
  for (const [name, base, offline] of homepageOnly ? [] : [['mobile-cold-sync', projectBase, false], ['offline-cold-sync', localBase, true]]) {
    await check(`${name}/three-fresh-visits`, async () => {
      const visits = [];
      for (let trial = 0; trial < 3; trial++) {
        const profile = profiles.find(item => item.name === 'mobile');
        const {page, context, errors, externalRequests} = await newPage(profile, offline);
        try {
          await goto(page, `${base}guide.html#sync`, profile);
          visits.push(await chapterDestination(page, 'sync'));
          await page.locator('#present-button').click();
          assert.equal(await page.locator('.chapter:visible').getAttribute('id'), 'sync');
          assert.deepEqual(errors, []);
          assert.deepEqual(externalRequests, []);
        } finally {
          await context.close();
        }
      }
      return visits;
    });
  }
} catch (error) {
  result.checks.push({name: 'runner', passed: false, error: error.message});
  console.error(error);
} finally {
  if (browser) await browser.close();
  if (server.listening) await new Promise(resolveClosed => server.close(resolveClosed));
  result.completedAt = new Date().toISOString();
  result.passed = result.checks.length > 0 && result.checks.every(item => item.passed);
  result.summary = {passed: result.checks.filter(item => item.passed).length, failed: result.checks.filter(item => !item.passed).length};
  await writeFile(resolve(output, reportName), `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify({success: result.passed, ...result.summary, report: resolve(output, reportName)}, null, 2));
  process.exitCode = result.passed ? 0 : 1;
}
