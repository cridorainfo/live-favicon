# Core API reference (`live-favicon`)

```js
import favicon, { FAVICON_SIZE } from "live-favicon";
```

`favicon` is a singleton — there's one browser tab, so there's one instance.
Every method returns `this`, so calls chain.

## `favicon.state(name)`

```ts
favicon.state(name: FaviconState): this
```

Switches to the named state. `"idle"` is a shortcut for `reset()`'s visual
effect (it stops any animation and removes the favicon override, but — unlike
`reset()` — does **not** restore the title). See [presets.md](./presets.md)
for the full `FaviconState` list and what each one looks like.

Convenience shortcuts exist for every state except `idle`:

```ts
favicon.thinking()
favicon.loading()
favicon.processing()
favicon.syncing()
favicon.reconnecting()
favicon.uploading()
favicon.downloading()
favicon.notification()
favicon.mention()
favicon.message()
favicon.success()
favicon.error()
favicon.warning()
favicon.offline()
```

`favicon.thinking()` is exactly `favicon.state("thinking")`.

## `favicon.progress(percent)`

```ts
favicon.progress(percent: number): this
```

Renders a progress ring. `percent` is clamped to `[0, 100]`. This stops any
running state animation and replaces it — it's for operations that report
real, granular progress (uploads, downloads, multi-step imports). For
anything without a real percentage, use a looping state instead.

## `favicon.badge(count)`

```ts
favicon.badge(count: number): this
```

Overlays a small numeric badge (capped visually at `"99+"`) on whatever is
currently showing — a state animation or a progress ring. Pass `0` to remove
it. The badge takes effect on the next rendered frame: immediately for a
static state or a progress ring, and within one scheduler tick (~1/12s while
the tab is visible, up to ~1s while it's hidden — see
[background-tabs.md](./background-tabs.md)) for an animated one.

## `favicon.title(text)`

```ts
favicon.title(text: string): this
```

Sets `document.title`. The very first call remembers the page's original
title; `reset()` restores it. Calling `title()` again before `reset()` does
**not** re-capture — the original is only ever the value from before your
first call.

## `favicon.task(promise, options?)`

```ts
favicon.task<T>(promise: Promise<T>, options?: TaskOptions): Promise<T>

interface TaskOptions {
  start?: FaviconState;   // default "thinking"
  success?: FaviconState; // default "success"
  error?: FaviconState;   // default "error"
}
```

The flagship API. Sets `start` immediately, awaits `promise`, then sets
`success` on resolve or `error` on reject. Returns (or rethrows) exactly what
`promise` did — `task()` is transparent to your own `try`/`catch` or
`.catch()` handling downstream.

```js
try {
  const data = await favicon.task(fetchReport(), { start: "processing" });
  render(data);
} catch (err) {
  // still runs — task() doesn't swallow the error
  showErrorToast(err);
}
```

## `favicon.reset()`

```ts
favicon.reset(): this
```

Restores the page's original favicon `<link>` (or removes the one
`live-favicon` created, if there wasn't one to begin with) and the original
`document.title`, and stops all animation. Call this when you're done with
the favicon-as-status-indicator for good — e.g. when a persistent indicator
component unmounts, or a long-running session ends.

## Types

```ts
type FaviconState =
  | "idle"
  | "thinking" | "loading" | "processing" | "syncing" | "reconnecting"
  | "uploading" | "downloading"
  | "notification" | "mention" | "message"
  | "success" | "error" | "warning" | "offline";
```

`FAVICON_SIZE` (currently `64`) is the pixel size `live-favicon` renders at
internally — exported mainly for anyone building custom tooling around it
(e.g. a preset gallery), not needed for normal use.

## What it doesn't do

- It doesn't touch anything if there's no `document` (SSR-safe no-op).
- It doesn't create a second favicon `<link>` — it adopts your existing one on
  first use and restores it exactly on `reset()`.
- It doesn't run a full-speed animation loop in a background tab — see
  [background-tabs.md](./background-tabs.md) for why, and what you get
  instead.
- It doesn't animate at all when the user has requested reduced motion — see
  [accessibility.md](./accessibility.md).
