# RazeTag

The public promotional page for RazeTag, a local-first resale companion.

## Public files

- `index.html` — feature overview, local-sharing highlight, and inline styles.
- `images/razetag-logo.png` — the purple peeking smiling-page and R-tag app logo.
- `images/razetag-promo.png` — matching promotional illustration, not a live app screenshot.
- `.nojekyll` — serve these static files without Jekyll processing.

The detailed guide and its demonstration screenshots are intentionally excluded
from the current public page. Do not add inventory databases, backup files,
private guide copies, pairing codes, or personal product photos to this repository.
This page does not connect to anyone's inventory.

The page uses the approved purple branding (`#7654C5`, with `#6040AA` for darker
accents). All logo and promotional-image URLs use `?v=peeking-20260914` so browsers
and social crawlers can fetch the new artwork. Previously shared social previews
may need to be recrawled before they display the update.

## Preview

Open `index.html` in a browser, or serve this directory with a local HTTP server.
No installation, API key, analytics, or backend is needed. Image paths are relative
so the page also works beneath the `/razetag_h5/` path.

## GitHub Pages

The publishing source is **main → / (root)**. Once reviewed and pushed, changes
to this branch are deployed to <https://remyo.github.io/razetag_h5/>.

Removing files from the current page does not erase previously published versions,
Git history, downloads, or third-party caches. Treat all published assets as public.
