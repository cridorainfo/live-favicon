# live-favicon

**Turn your browser tab into a live status indicator.**

```js
import favicon from "live-favicon";

favicon.thinking();
await generateAI();
favicon.success();
```

This is the monorepo for `live-favicon`. See the packages below for install
instructions and full API docs.

## Packages

| Package                                          | Description                                  |
| ------------------------------------------------- | --------------------------------------------- |
| [`live-favicon`](./packages/core)                  | Core library — zero dependencies, ~3KB gzipped |
| [`@live-favicon/react`](./packages/react)          | React hooks (`useFaviconState`, `useFaviconTask`) |

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
