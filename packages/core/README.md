# live-favicon

**Turn your browser tab into a live status indicator.**

A tiny, dependency-free library that turns the favicon and tab title into a
real-time status channel — so users don't have to keep checking back on a tab
to see if a task finished.

```js
import favicon from "live-favicon";

favicon.thinking();
await generateAI();
favicon.success();
```

```
◌ Thinking...  →  ◌ Processing...  →  ✓ Complete
```

The user can switch away from the tab and still see what's happening.

## Why

Modern web apps do a lot of work that doesn't finish instantly — AI generation,
file uploads, exports, syncs, payments. Once the user switches tabs, all of
that becomes invisible until they come back and check. `live-favicon` uses the
two channels every browser tab already gives you — the favicon and the title —
as a lightweight status display.

## Install

```bash
npm install live-favicon
```

Or drop in the standalone build:

```html
<script src="https://unpkg.com/live-favicon"></script>
<script>
  const favicon = LiveFavicon.default;
  favicon.thinking();
</script>
```

## Quick start

```js
import favicon from "live-favicon";

favicon.thinking();     // start a state
favicon.progress(42);   // show a progress ring (0-100)
favicon.badge(3);       // overlay a small count, e.g. unread messages
favicon.title("Generating...");
favicon.success();      // or .error() / .warning() / ...
favicon.reset();        // restore the page's original favicon & title
```

### `task()` — the flagship API

Wrap any promise and let the tab manage its own lifecycle:

```js
await favicon.task(generateAI());
// thinking -> success, or thinking -> error if it throws
```

Customize which states are used:

```js
await favicon.task(uploadFile(), {
  start: "loading",
  success: "success",
  error: "error",
});
```

`task()` rethrows the original error after updating the favicon, so your own
error handling still runs.

## States

| State          | Looks like                          |
| -------------- | ------------------------------------ |
| `thinking`     | orbiting particles                   |
| `loading`      | spinner (blue)                       |
| `processing`   | spinner (purple)                     |
| `syncing`      | spinner (teal)                       |
| `reconnecting` | flickering, broken ring (amber)      |
| `uploading`    | particles rising                     |
| `downloading`  | particles falling                    |
| `notification` | pulsing dot                          |
| `mention`      | "@" badge with an expanding ring     |
| `message`      | chat bubble, gently breathing        |
| `success`      | green circle → checkmark             |
| `error`        | red circle → X                       |
| `warning`      | amber circle with `!` (static)       |
| `offline`      | gray ring with a slash (static)      |

Call any of them directly (`favicon.success()`) or via `favicon.state("success")`.

## API

```ts
favicon.state(name: FaviconState): this
favicon.thinking() / .loading() / .processing() / .syncing() / .reconnecting() /
  .uploading() / .downloading() / .success() / .error() / .warning() /
  .offline() / .notification() / .mention() / .message(): this

favicon.progress(percent: number): this   // 0-100, clamped
favicon.badge(count: number): this        // overlays a numeric badge
favicon.title(text: string): this         // sets the tab title

favicon.task<T>(promise: Promise<T>, opts?: {
  start?: FaviconState;   // default "thinking"
  success?: FaviconState; // default "success"
  error?: FaviconState;   // default "error"
}): Promise<T>

favicon.reset(): this // restores the original favicon and title
```

Every method returns `this`, so calls chain: `favicon.thinking().title("Working...")`.

## How it behaves in background tabs

Browsers throttle timers in background tabs, and `requestAnimationFrame`
effectively stops firing. `live-favicon` doesn't fight this — it renders via
`requestAnimationFrame` while the tab is visible (~12fps, plenty for a 64×64
icon) and switches to a ~1s interval while hidden, which is what browsers
allow anyway. The goal is status communication, not full-motion animation.

`prefers-reduced-motion: reduce` is respected: animated states render a single
static frame instead of looping.

## Design notes

- **Zero runtime dependencies.** ~2.6KB gzipped.
- **Framework agnostic.** Works with plain JS/TS, React, Vue, Svelte, Next.js,
  or anywhere the DOM exists. It's a no-op in non-browser environments (SSR).
- **Non-destructive.** It adopts your existing `<link rel="icon">` if present
  and restores its original `href` on `reset()`, rather than creating
  duplicate favicon tags.
- **Not color-only.** Warning/error states use icons (`!`, `X`), not just hue,
  so status is legible without relying on color perception alone.

## Demo

From the repo root, run `npm run build`, then open
[`demo/index.html`](../../demo/index.html) — click "Start task," then switch
to another tab and watch this one instead.

## Full docs

- [Getting started](../../docs/getting-started.md)
- [Core API reference](../../docs/api-core.md)
- [Presets](../../docs/presets.md) — a real render of every state
- [Background tabs](../../docs/background-tabs.md)
- [Accessibility](../../docs/accessibility.md)
- [`examples/vanilla`](../../examples/vanilla) — a reference page exercising every method
- [`examples/react`](../../examples/react) — Vite + React + TypeScript example

## License

MIT

---

If `live-favicon` saves you time, consider sponsoring on [GitHub Sponsors](https://github.com/sponsors/cridorainfo) or setting up a Buy Me a Coffee link. ☕
