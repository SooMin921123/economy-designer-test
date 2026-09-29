# Economy Designer 4.3.1 browser QA

This repository verifies the Drive source build `4.3.1-recovery.1` with storage key `econverse431-guarded`.

## Source of truth

- `source/economy-designer-4.3.1.html`: latest 4.3.1 learning HTML copied from the provided Google Drive file.
- `reference/browser-check-4.3.1.html`: the provided staged browser QA tool.

## Automated coverage

The Playwright suite runs in Desktop Chromium and a 390×844 mobile Chromium viewport. It checks:

- clean boot and responsive overflow
- localStorage persistence across reload
- C03-04 related-lecture round trip answer preservation
- C13-04 empty slider restoration across navigation and reload
- restore preview/cancel non-destructive behavior
- manifest structure
- active service worker
- online first load followed by offline reload

`scripts/prepare-pwa.mjs` derives the hosted test build from the committed 4.3.1 source, extracts the source's own `SW_CODE`, writes the same manifest fields used by the app's PWA exporter, and generates the icon files required by that service worker cache.

Run locally with:

```bash
npm install
npx playwright install chromium
npm run test:e2e
```
