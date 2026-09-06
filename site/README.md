# site/

The public marketing/landing page for live-favicon, deployed to GitHub Pages.

This is a standalone static page — it doesn't depend on the rest of the
monorepo at deploy time. `assets/js/live-favicon.global.js` and
`assets/presets/*.png` are copies (not symlinks) so the deployed site works
on its own.

## Updating

If you change the core library's presets or rebuild it, refresh this
folder's copies:

```bash
npm run build --workspace=live-favicon
cp packages/core/dist/index.global.js site/assets/js/live-favicon.global.js
cp docs/assets/presets/*.png site/assets/presets/
```

## Deploy

Pushing to `main` with changes under `site/` triggers
[`.github/workflows/pages.yml`](../.github/workflows/pages.yml), which
publishes this folder to GitHub Pages automatically. To preview locally:

```bash
cd site
python -m http.server 8080
# open http://localhost:8080
```
