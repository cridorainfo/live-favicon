# live-favicon

**Turn your browser tab into a live status indicator.**

```js
import favicon from "@live-favicon/core";

favicon.thinking();
await generateAI();
favicon.success();
```

This is the monorepo for `live-favicon`. See the packages below for install
instructions and full API docs.

## Packages

| Package                                          | Description                                  |
| ------------------------------------------------- | --------------------------------------------- |
| [`@live-favicon/core`](./packages/core)            | Core library — zero dependencies, ~3KB gzipped |
| [`@live-favicon/react`](./packages/react)          | React hooks (`useFaviconState`, `useFaviconTask`) |

## Docs

- [Getting started](./docs/getting-started.md)
- [Core API reference](./docs/api-core.md)
- [React API reference](./docs/api-react.md)
- [Presets](./docs/presets.md) — every built-in state, with a real render of each
- [Custom images](./docs/custom-images.md) — bring your own PNG or SVG instead of (or alongside) the built-in shapes
- [Background tabs](./docs/background-tabs.md) — how the scheduler behaves when the tab isn't visible
- [Accessibility](./docs/accessibility.md)

## Examples

- [`examples/vanilla`](./examples/vanilla) — zero-build, plain `<script>` tag usage; a reference page exercising every method
- [`examples/react`](./examples/react) — Vite + React + TypeScript, using `@live-favicon/react`

## Demo

```bash
npm install
npm run build
```

Then open [`demo/index.html`](./demo/index.html) in a browser, click
**Start task**, and switch to another tab — the favicon and title update
while you're away.

## Development

This is an npm workspaces monorepo.

```bash
npm install          # installs and links all packages
npm run build         # builds every package
npm run test           # runs every package's tests
npm run typecheck       # typechecks every package
```

## License

MIT — see [LICENSE](./LICENSE).

---

If `live-favicon` saves you time, consider sponsoring on [GitHub Sponsors](https://github.com/sponsors/cridorainfo). ☕
