# RazeTag H5

The public RazeTag introduction and end-user guide. A static, local-first
resale story—not a portal into anyone’s real inventory.

## October 8, 2026 refresh

The homepage now uses a responsive purple visual system, real demo app screens,
and the existing peeking and waving mascots. It leads with six practical features:
inventory, money tracking, purchase bundles, quantity sales, Listing tools, and
Showcase. A three-step first-item walkthrough, worked examples, and six expandable
FAQs help readers get started without opening the full guide immediately.

Local network workflows are explained separately:

- **Selected sharing:** a one-time handoff of chosen items.
- **Ordinary sync:** full private inventory between two trusted devices.
- **Shop team:** owner-approved, permission-based selling access. The current
  member catalog has no photos; one owner–member foreground connection at a time.

There are still exactly two full-guide links on the homepage: navigation and the
closing call to action. No download/store availability, cloud storefront,
background sync, automatic marketplace publishing, or payment processing is promised.

The guide has **17 chapters and 30 existing demonstration screenshots**, with a
task chooser and new Showcase and Shop team walkthroughs. Written instructions
were checked against app revision **797f06b**. The existing September captures are
labeled as examples; they are not presented as new October interfaces.
Buying assistant and Stock audit are not promoted because their Tools entries
are hidden in the current app.

The Privacy Policy has been updated to describe Showcase and Shop team alongside
existing permissions, optional online services, copies, backups, and retention.
Privacy/support contact: **razedevworkspace@gmail.com**.

## Files

- `index.html` — modern homepage, key features, quick start, Mac preview, local
  network options, data ownership, FAQs, and guide access.
- `styles/site.css` — local, responsive homepage styles; no remote fonts.
- `guide.html` — walkthroughs with screenshot enlargement, chapter navigation,
  presentation mode, and printing.
- `privacy.html` — current app/website Privacy Policy.
- `scripts/sync-guide.mjs` — reproducible website guide generator.
- `scripts/check.mjs` — local browser regression suite.
- `.nojekyll` — serve as ordinary static GitHub Pages files.

## Images and provenance

- `images/razetag-logo.png` — approved purple peeking-page/R-tag logo.
- `images/razetag-home-20260922.webp` and
  `images/razetag-desktop-20260922.webp` — real phone and Mac production-widget
  layouts rendered with isolated demonstration data, not personal inventory.
- `images/razetag-item-editor-20261008.webp` — optimized copy of the existing
  demonstration item-editor capture, retaining its aspect ratio.
- `images/razetag-mascot-peek-20261008.webp` and
  `images/razetag-mascot-wave-20261008.webp` — resized, optimized copies of the
  existing app’s transparent branded mascot assets. The original logo is unchanged.
- `images/razetag-sync-devices-20260923.webp` — conceptual device illustration,
  explicitly labeled “not actual app screens” and “one sync pair at a time.”
- `images/razetag-overview-20260922.png` — existing 1200 × 630 social preview.
- `images/guide/` — 31 content-versioned files: 30 demo captures and the logo.

Screenshot provenance is recorded in the app repository under
`docs/presentation/testing/SCREENSHOT-PROVENANCE.md` and
`REFRESH-20260922.md`. Mascot provenance is in
`docs/branding-concepts/showcase-mascot.md` and
`showcase-peeking-mascot.md`. Earlier public assets are retained so previously
shared image links keep working.

Do not publish databases, backups, old private guide copies, pairing codes,
personal product photos, or test harnesses. None of these pages reads app data.
Treat everything committed to this repository as public.

## Preview and checks

Open `index.html`, or serve this folder with a local HTTP server. Relative paths
work both from a file and beneath the GitHub Pages project path.

Run:

```sh
node scripts/check.mjs
```

The suite checks desktop, tablet, phone, 320px width, 200% text, image proportions,
all guide chapters, keyboard FAQs, focus restoration, printing, local links,
HTTP/project-path/file-offline loading, no external requests, and public-content
safety. Reports and screenshots stay in ignored `.preview/redesign-20261008/`.
Tests never access personal app data or publish changes.

## Regenerating the guide

The app’s standalone September source remains unchanged at
`../razetag/docs/RazeTag-Features.html`. Regenerate the website copy with:

```sh
node scripts/sync-guide.mjs ../razetag/docs/RazeTag-Features.html
```

The generator extracts existing embedded images and adds reviewed website-only
instructions for the current Listing tools, Showcase, Shop team, QR styles, and
Excel reports. It also adds the task chooser and website navigation. These
enrichments live in the generator, so regeneration does not overwrite them.

The guard expects 15 upstream chapters / 30 screenshots and produces 17 website
chapters. If the upstream guide changes, review the exact source markers and
current app flows before updating the transform. Screenshots stay byte-for-byte
unchanged; superseded public assets are not automatically deleted.

## Publication

GitHub Pages uses **main → / (root)** at
<https://remyo.github.io/razetag_h5/>. Editing or previewing locally does not publish.
Commit/push only when the user requests it.

Before a store submission, review policy disclosures against the final app and
bundled SDKs, then complete the platform privacy forms. The website policy is not
a guarantee of store approval or legal compliance. Git history, cached pages,
and files previously downloaded cannot be recalled by editing this website.
