# Custom images: bring your own PNG or SVG

Every built-in preset — and every example in [api-core.md](./api-core.md) —
draws shapes procedurally (arcs, rects, text) because that's what keeps the
core library dependency-free and tiny. But `favicon.define()` doesn't actually
care how your renderer draws. It hands you a real `CanvasRenderingContext2D`:

```ts
type PresetRenderer = ({ ctx, size, t }: RenderContext) => void;
```

`ctx` is unrestricted Canvas 2D. That means `ctx.drawImage()` works exactly
like it would anywhere else — so your own artwork, not just procedural
shapes, can drive the tab. This doc is about that path: loading a PNG or SVG
you already have and animating *that*, instead of (or alongside) the kit's
`spinner()` / `pulse()` / `iconBadge()`.

## The basic pattern

Load the image once, outside the renderer — `Image` loading is asynchronous,
so the renderer just draws whatever's ready on each call and skips frames
until it is:

```js
import favicon from "@live-favicon/core";

const logo = new Image();
logo.src = "/brand-mark.png";

favicon.define("syncing-brand", ({ ctx, size, t }) => {
  if (!logo.complete) return; // nothing to draw yet — skip this frame

  const scale = 1 + Math.sin(t * 3) * 0.08; // gentle breathing pulse
  const s = size * 0.8 * scale;
  ctx.drawImage(logo, (size - s) / 2, (size - s) / 2, s, s);
});

favicon.state("syncing-brand");
```

`t` is seconds elapsed since the state activated (see
[api-core.md](./api-core.md#faviconstatename)), so every trick you'd use in a
CSS or `requestAnimationFrame` animation — easing, cycles, offsets — applies
the same way here. It's just driving `drawImage` arguments instead of shape
coordinates.

## SVG works the same way

An `Image` element can load an SVG exactly like a PNG — as a file path, or as
an inline data URL if you'd rather bundle it with your JS and skip a network
request entirely:

```js
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="10" fill="#10A37F"/>
</svg>`;

const icon = new Image();
icon.src = `data:image/svg+xml,${encodeURIComponent(iconSvg)}`;
```

Because it's vector source, it rasterizes cleanly at whatever size you pass to
`drawImage` — you don't need a source SVG sized for 64×64 specifically, the
canvas scales it on draw.

## Preload once, reuse across every state

Don't create a new `Image` inside the renderer — it'd start reloading (and
flashing blank) on every single frame. Load everything up front, once, and
close over the loaded images from your renderer(s):

```js
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

const [logo, checkmark] = await Promise.all([
  loadImage("/brand-mark.png"),
  loadImage("/checkmark.svg"),
]);

favicon.define("branded-thinking", ({ ctx, size, t }) => {
  const s = size * 0.7;
  ctx.save();
  ctx.translate(size / 2, size / 2);
  ctx.rotate(t * 1.5);
  ctx.drawImage(logo, -s / 2, -s / 2, s, s);
  ctx.restore();
});

favicon.define("branded-success", ({ ctx, size }) => {
  const s = size * 0.6;
  ctx.drawImage(checkmark, (size - s) / 2, (size - s) / 2, s, s);
});
```

Do this at module load / app startup, before the first `favicon.state()` call
that needs the image — not lazily inside a click handler that fires the same
moment you switch state.

## What you get for free

- **The canvas is already cleared and isolated per frame.** `renderFrame()`
  calls `ctx.save()` before your renderer and `ctx.restore()` after — so
  `globalAlpha`, transforms (`translate`/`rotate`/`scale`), and other state
  you set don't leak into the next frame. You don't need to reset anything
  yourself.
- **`favicon.badge(count)` still overlays automatically** on top of whatever
  your renderer draws, image-based or not — no extra work needed to support
  unread counts alongside custom art.
- **The render target is always 64×64** (`FAVICON_SIZE`), regardless of your
  source image's native resolution — see [Practical limits](#practical-limits)
  below for what that means for source-asset sizing.
- **Background-tab throttling applies the same way** as every built-in preset
  — see [background-tabs.md](./background-tabs.md). An image-based animation
  runs at ~12fps foreground / ~1fps backgrounded, same scheduler, no special
  handling required on your end.

## Compose images with the built-in kit

`spinner()`, `pulse()`, and `iconBadge()` (from [api-core.md](./api-core.md))
each return a plain `PresetRenderer` that only draws — it doesn't clear the
canvas first. That means you can call one manually inside your own renderer
and layer your artwork on top (or underneath) it in the same frame:

```js
import favicon, { spinner } from "@live-favicon/core";

const drawRing = spinner("#10A37F");

favicon.define("branded-loading", (rc) => {
  drawRing(rc); // ring first
  const s = rc.size * 0.45;
  rc.ctx.drawImage(logo, (rc.size - s) / 2, (rc.size - s) / 2, s, s); // logo centered on top
});
```

## Ideas to explore

The pattern above is deliberately minimal — `t`, `drawImage`, and plain Canvas
2D transforms — so it composes into a lot more than a single static logo:

- **Sprite-sheet frame cycling.** Export a hand-drawn animation as one PNG
  strip and pick the source rectangle from `t`:
  ```js
  const FRAME_W = 64, FRAME_COUNT = 8, FPS = 10;
  favicon.define("mascot", ({ ctx, size, t }) => {
    const frame = Math.floor(t * FPS) % FRAME_COUNT;
    ctx.drawImage(spriteSheet, frame * FRAME_W, 0, FRAME_W, FRAME_W, 0, 0, size, size);
  });
  ```
- **Cross-fading between two images** with `globalAlpha` driven by `t`, for a
  logo that morphs into a checkmark rather than being replaced by one.
- **A different brand mark per state** — register several `define()` calls,
  each closing over a different preloaded image, so `uploading`, `syncing`,
  and `error` each get their own on-brand artwork instead of the shared
  built-in shapes.
- **Light/dark-aware artwork** — preload two versions of a logo and pick one
  based on `window.matchMedia("(prefers-color-scheme: dark)")` at draw time,
  so the favicon stays legible against both tab-strip themes.
- **Compositing a live canvas snapshot** — `drawImage` also accepts a
  `<canvas>` or `ImageBitmap`, not just `<img>`, so a favicon can mirror a
  miniature of something already rendering elsewhere on the page (a chart, an
  avatar, a QR code) instead of static artwork at all.

## Reduced motion

When `prefers-reduced-motion: reduce` is set, `live-favicon` never starts the
scheduler for an animated state — it renders your function exactly **once, at
`t = 0`** (see [accessibility.md](./accessibility.md)). Design frame `t = 0`
to look reasonably resolved on its own — e.g. the logo at its rest scale, not
mid-fade-in — since for these users it's the only frame that ever appears.

## Practical limits

- **The render target is a fixed 64×64 canvas**, rendered at 2x a typical
  displayed favicon size for crispness on high-DPI screens and pinned tabs —
  see [renderer/canvas.ts](../packages/core/src/renderer/canvas.ts). Detailed
  source art is wasted below that; bold, simple shapes read far better at the
  16–32px a favicon actually displays at day-to-day.
- **Keep source images small.** A multi-megabyte PNG will decode fine once,
  but there's no reason to ship it — a few hundred pixels square is already
  far more resolution than a 64×64 canvas will ever use.
- **Preload, don't reconstruct.** Building a new `Image` or re-encoding an SVG
  string inside the renderer means doing that work every single frame instead
  of once — always load outside the `PresetRenderer` and reference the
  already-decoded image from the closure, as in every example above.
