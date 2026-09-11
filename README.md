# RazeTag guide

The public, static user guide for RazeTag: inventory, photos, bundles, sales,
refunds, tools, budgets, settings, backups, and phone permissions.

This repository contains only the guide and its demo screenshots. It does not
contain the Flutter app, inventory databases, backups, or personal product photos.
Publishing the guide does not connect to anyone's app data.

## Files

- `index.html` — guide, styles, and screenshot viewer.
- `images/` — 19 screenshots of demo data and the RazeTag logo.
- `.nojekyll` — serve the existing static files without Jekyll processing.

## GitHub Pages

In Settings → Pages, choose **Deploy from a branch**, **main**, and **/ (root)**.
Once deployment succeeds, the guide is available at:

https://remyo.github.io/razetag_h5/

Future changes pushed to the selected publishing branch update the guide.

## Local preview

Open `index.html` in a browser, or serve this directory with a local HTTP server.
Keep image paths relative so screenshots also work at the `/razetag_h5/` URL.

Only publish assets intended for public sharing. Screenshot prices and items are
examples, not live market information.
