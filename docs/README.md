# Documentation

- [Getting started](./getting-started.md) — install, quick start, your first `task()`
- [Core API reference](./api-core.md) — every method on the `live-favicon` singleton
- [React API reference](./api-react.md) — `useFaviconState`, `useFaviconTask`
- [Presets](./presets.md) — every built-in state, with a real render of each
- [Custom images](./custom-images.md) — bring your own PNG or SVG instead of (or alongside) the built-in shapes
- [Background tabs](./background-tabs.md) — how the scheduler behaves when the tab isn't visible, and why
- [Accessibility](./accessibility.md) — reduced motion, color-independence, and the limits of a favicon as a status channel

## Examples

Runnable, framework-specific example projects live in [`../examples`](../examples):

- [`examples/vanilla`](../examples/vanilla) — zero-build, plain `<script>` tag usage
- [`examples/react`](../examples/react) — Vite + React + TypeScript, using `@live-favicon/react`
