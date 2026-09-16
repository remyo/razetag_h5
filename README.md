# RazeTag

The public promotional page for RazeTag, a local-first resale companion.

## Public files

- `index.html` — a short, benefit-led introduction: less admin, clearer stock and reports, local data ownership, and links to the user guide.
- `guide.html` — the end-user walkthrough, including presentation mode and enlargeable demo screenshots.
- `images/guide/` — the guide's 28 demo screenshots and logo, loaded separately from the landing page.
- `images/razetag-logo.png` — the purple peeking smiling-page and R-tag app logo.
- `images/razetag-home-demo.png` — the landing page's real Home capture, using isolated demo data (copied unchanged from the presentation's `home.png`).
- `images/razetag-overview-promo.png` — existing purple promotional artwork reused for social previews; illustrative screens, not a live screenshot.
- `images/razetag-promo.png` — earlier sharing illustration, retained but no longer displayed by the landing page.
- `.nojekyll` — serve these static files without Jekyll processing.

The landing page explains who RazeTag helps and why it is useful, rather than
listing individual tools. Detailed features (including local sharing and card
lookups) stay in the guide. The User guide button opens that walkthrough in the
same tab. The guide's Home button returns to the landing page.
Only the newly prepared end-user guide and its demonstration screenshots are
included. Do not add inventory databases, backup files, private/older guide copies,
pairing codes, test harnesses, or personal product photos to this repository.
Neither page connects to anyone's inventory. Once deployed, both pages are public.

The page uses the approved purple branding (`#7654C5`, with `#6040AA` for darker
accents). Logo URLs use `?v=peeking-20260914`; social artwork uses a new filename
with `?v=20260916`. Previously shared social previews may need to be recrawled
before they display the update.

## Preview

Open `index.html` in a browser, or serve this directory with a local HTTP server.
No installation, API key, analytics, or backend is needed. Image paths are relative
so the page also works beneath the `/razetag_h5/` path.

## Refreshing the guide

The standalone original remains in the app repository at `docs/RazeTag-Features.html`.
To refresh the web copy from that reviewed file, run from this repository:

```sh
node scripts/sync-guide.mjs ../razetag/docs/RazeTag-Features.html
```

This does not edit the original. It adds website navigation and extracts embedded
pictures to content-versioned, cacheable PNGs so the guide can load them as needed.
The landing page does not preload the guide or its screenshots. If the guide's
chapter or screenshot count changes, review the landing-page copy and sync guard
together before updating. Superseded image files are not deleted automatically.

## GitHub Pages

The publishing source is **main → / (root)**. Once reviewed and pushed, changes
to this branch are deployed to <https://remyo.github.io/razetag_h5/>.

Removing files from the current page does not erase previously published versions,
Git history, downloads, or third-party caches. Treat all published assets as public.
