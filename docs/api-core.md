# Core API reference (`live-favicon`)

```js
import favicon, { FAVICON_SIZE } from "@live-favicon/core";
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
favicon.alarm()
favicon.celebration()
favicon.payment()
favicon.queue()
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

## `favicon.define(name, renderer, options?)`

```ts
favicon.define(name: string, renderer: PresetRenderer, options?: DefineOptions): this

interface DefineOptions {
  animated?: boolean;      // default true
  settleAfterMs?: number;  // see below
}
```

Registers a custom state so `favicon.state(name)` — and `task()`'s `start`
/`success`/`error` options — can use it alongside the built-ins. `renderer`
is a `PresetRenderer`: `({ ctx, size, t }) => { ...draw... }`, the same
signature every built-in preset uses internally.

You don't have to write canvas code to use this. Three composable builders
are exported for the common shapes:

```ts
function spinner(color: string): PresetRenderer;                                   // rotating arc — the loading/processing/syncing shape
function pulse(color: string): PresetRenderer;                                     // expanding, fading ring — the notification shape
function iconBadge(color: string, glyph: string, options?: { textColor?: string }): PresetRenderer;  // solid circle + centered glyph — the warning shape
```

```js
import favicon, { spinner, iconBadge } from "@live-favicon/core";

favicon.define("researching", spinner("#10A37F"));       // your brand color
favicon.define("blocked", iconBadge("#DC2626", "!"));
favicon.define("brand-mark", iconBadge("#111827", "A"), { animated: false });

favicon.state("researching");
```

For anything the kit doesn't cover, write a `PresetRenderer` directly — it's
plain Canvas 2D, and `t` is seconds elapsed since the state became active
(loops for continuous animations, per [background-tabs.md](./background-tabs.md)):

```ts
favicon.define("custom", ({ ctx, size, t }) => {
  ctx.fillStyle = "#111827";
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.3 + Math.sin(t * 4) * 4, 0, Math.PI * 2);
  ctx.fill();
});
```

`settleAfterMs` is for a pop-in-then-hold animation like `success`/`error`:
when set, the scheduler force-paints a frame at `t = 1` (past any reasonable
pop-in duration) and stops, exactly `settleAfterMs` after activation — see
the comment in `index.ts`'s `state()` for why a naive "just stop the
scheduler" doesn't work reliably in a background tab.

`define()` throws if `name` collides with a built-in state name (including
`"idle"`) — built-ins can't be redefined. Calling `state()` with a name
that was never `define()`'d logs a console warning and does nothing,
rather than failing silently.

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
type BuiltInFaviconState =
  | "idle"
  | "thinking" | "loading" | "processing" | "syncing" | "reconnecting"
  | "uploading" | "downloading"
  | "notification" | "mention" | "message"
  | "success" | "error" | "warning" | "offline"
  | "alarm" | "celebration" | "payment" | "queue";

// FaviconState accepts any BuiltInFaviconState, or any string — so a name
// registered with define() type-checks too, while the built-ins still show
// up in editor autocomplete.
type FaviconState = BuiltInFaviconState | (string & {});
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
