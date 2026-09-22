# RazeTag

The public promotional page for RazeTag, a local-first resale companion.

## Public files

- `index.html` — a short, benefit-led introduction: less admin, clearer stock and reports, local data ownership, and links to the user guide.
- `guide.html` — the end-user walkthrough, including presentation mode and enlargeable demo screenshots.
- `privacy.html` — the app and website Privacy Policy, with the owner-confirmed privacy and support contact `razedevworkspace@gmail.com`. Review the disclosures before publication and store submission.
- `images/guide/` — the guide's demo screenshots and logo, loaded separately from the landing page.
- `images/razetag-logo.png` — the purple peeking smiling-page and R-tag app logo.
- `images/razetag-home-20260922.webp` — refreshed Android-layout Home screenshot, using isolated demonstration data.
- `images/razetag-desktop-20260922.webp` — real macOS-target split workspace rendered with isolated demonstration inventory.
- `images/razetag-overview-20260922.png` — 1200 × 630 social preview composed from those real app captures and existing branding.
- `images/razetag-sync-devices-20260923.webp` — optimized 1536 × 1024 generated phone/laptop/desktop illustration (about 85 KB). It is labeled as conceptual, not an app screenshot; syncing remains one pair at a time.
- Earlier Home and promotional assets remain available for compatibility with previously shared links, but are no longer displayed by the landing page.
- `images/razetag-promo.png` — earlier sharing illustration, retained but no longer displayed by the landing page.
- `.nojekyll` — serve these static files without Jekyll processing.

The landing page explains who RazeTag helps and why it is useful, rather than
listing every tool. A short recent-additions section explains stock history,
partial payments and saved purchase conversions without sending readers to
another page. A Mac preview introduces the wider workspace. Local sync has its
own homepage section with the basic connection flow, approval requirements and
privacy limits. The detailed walkthrough remains in the guide. Only the top
navigation and final guide call-to-action link to it. The guide opens in the
same tab. The guide's Home button returns to the landing page.
Only the newly prepared end-user guide and its demonstration screenshots are
included. Do not add inventory databases, backup files, private/older guide copies,
pairing codes, test harnesses, or personal product photos to this repository.
None of the pages connect to anyone's inventory. Once deployed, they are public.

The page uses the approved purple branding (`#7654C5`, with `#6040AA` for darker
accents). Logo URLs use `?v=peeking-20260914`; refreshed screenshots and social
artwork use date-versioned filenames. Previously shared social previews may need to be recrawled
before they display the update.

## Preview

Open `index.html` in a browser, or serve this directory with a local HTTP server.
No installation, API key, analytics, or backend is needed. Image paths are relative
so the page also works beneath the `/razetag_h5/` path.

## Refreshing the guide

The standalone original remains in the app repository at `docs/RazeTag-Features.html`.
Its authored source is `docs/presentation/`. Rebuild it with
`node docs/presentation/package.mjs` in the app repository, then refresh the web
copy from that reviewed file by running this command in the website repository:

```sh
node scripts/sync-guide.mjs ../razetag/docs/RazeTag-Features.html
```

This does not edit the original. It adds website navigation and extracts embedded
pictures to content-versioned, cacheable PNGs so the guide can load them as needed.
The landing page does not preload the guide or its screenshots. If the guide's
chapter or screenshot count changes, review the landing-page copy and sync guard
together before updating. Superseded image files are not deleted automatically.

## September 22 refresh

The guide now has 15 chapters, including separate local-sync and desktop chapters.
Stock adjustment/restocking, deposits and remaining payments, and fixed saved
currency conversion were checked against current app code. Display estimates,
saved conversions and mixed-currency report exclusions are explained separately.
The Mac guide does not promise desktop camera/OCR tools or Windows/Linux support.
Sync is described as an approved two-device foreground session, not cloud sync
or a replacement for backups. In-progress divider/session and sync-queue refinements
are not advertised as released features.

Four fresh app screenshots were captured from production widgets in an isolated
Flutter test harness, not a personal device inventory. They use synthetic records
and licensed product photography. The app repository's
`docs/presentation/testing/REFRESH-20260922.md` records capture provenance.

Run `node scripts/check.mjs` to check phone/tablet/desktop layouts, enlarged text,
image loading, navigation, screenshot dialogs and guide presentation mode.
Reports and browser captures stay under the ignored `.preview/` directory.
Editing these files does not publish them; no commit or push is part of the refresh.

### September 23 homepage simplification

The homepage has exactly two guide links. Its hero actions scroll to benefits
and local sync; recent-addition cards and the Mac screenshot are informational,
not disguised navigation. The dedicated sync section explains same-Wi-Fi,
two-device, foreground sessions and that full private records are included.
The QA script guards this link count and tests in-page sync navigation.

### Sync illustration and Privacy Policy

The sync section now uses a purpose-made purple device illustration, with native
aspect ratio, lazy loading, and a two-device-session caption. The full generation
prompt and provenance are retained locally in the ignored
`.preview/sync-image-20260923.md` file.

The homepage and guide footers link to `privacy.html` and the support email. The guide sync script
preserves those footer links when the guide is refreshed. The policy explains
local data, optional network requests, ML Kit SDK diagnostics, device permissions,
local transfer, exported copies, system backups, and learned-barcode retention.
It does not claim that on-device recognition means zero SDK network activity or
that deleting a listing recalls previously shared data.

Before publishing the policy:

- The owner confirmed `razedevworkspace@gmail.com` for privacy and support on
  September 23. Keep it monitored and review the developer identity used in the
  store listing. The missing-contact notice and `noindex` tag have been removed.
- Reconcile the policy with the final release and all bundled SDK disclosures.
  The merged Android manifest includes permissions added by camera/storage plugins;
  inspect these separately even though the app's cameras disable audio capture.
- Publish an accessible HTTPS page, link it from the app, and complete the store
  privacy/Data safety forms. This website change does not modify app settings or
  those forms and is not a guarantee of store approval or legal compliance.
- Review the policy again if accounts, cloud sync, ads, payments, analytics, or the
  website's hosting provider change. The current page documents current behavior.

Reference requirements: [Apple privacy guidelines](https://developer.apple.com/app-store/review/guidelines/#privacy)
and [Google Play User Data](https://support.google.com/googleplay/android-developer/answer/10144311?hl=en).

## GitHub Pages

The publishing source is **main → / (root)**. Once reviewed and pushed, changes
to this branch are deployed to <https://remyo.github.io/razetag_h5/>.

Removing files from the current page does not erase previously published versions,
Git history, downloads, or third-party caches. Treat all published assets as public.
