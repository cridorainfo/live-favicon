# Background tabs: what actually happens

This is the entire reason `live-favicon` exists, so it's worth explaining
precisely rather than leaving it as marketing copy.

## The premise

When a tab isn't focused, the browser stops compositing its page content —
but the **tab strip itself** (the row of favicons and titles at the top of
the window) keeps rendering. Updating a background tab's favicon or title
does reach the user, in every major browser, even though nothing else on the
page is visibly running. That's the channel this library uses.

## Why `requestAnimationFrame` isn't enough on its own

`requestAnimationFrame` is the natural way to drive a canvas animation, but
browsers deliberately throttle or fully suspend it once a tab is hidden —
it's designed for compositing the page you can currently see, not for
background work. Relying on it alone would mean the favicon freezes the
instant a user switches away — exactly when they most need the update.

`setInterval`/`setTimeout` keep running in background tabs, but browsers clamp
them too: Chrome, Firefox, and Safari all limit background timers to roughly
once per second, regardless of what interval you ask for (some go further and
throttle repeated short-interval timers even more aggressively the longer a
tab stays hidden).

## What `live-favicon` does

The scheduler ([`src/core/scheduler.ts`](../packages/core/src/core/scheduler.ts))
picks its driver based on `document.visibilityState`:

| Tab state  | Driver              | Effective rate |
| ---------- | -------------------- | -------------- |
| Visible    | `requestAnimationFrame`, throttled | ~12fps |
| Hidden     | `setInterval`         | ~1fps (fires once immediately, then on the interval) |

It switches between the two live, via the `visibilitychange` event — so
animation continues smoothly across a tab switch instead of freezing or
jumping.

12fps and 1fps both sound low next to a typical 60fps UI animation, but the
target is a 64×64 status icon, not a hero animation: the goal is "the user
can tell something changed," not full-motion video. A pulsing dot or a
rotating arc reads clearly at either rate.

## Practical implications

- **Don't expect frame-perfect timing** in a background tab. A `success`
  state's checkmark pop, for instance, settles at whatever the next ~1s tick
  lands on — visually indistinguishable in practice, since the whole point is
  the user isn't watching it happen live.
- **`favicon.progress()` still updates correctly** in the background — each
  call renders synchronously regardless of the scheduler, so a progress bar
  driven by real upload/download events (which fire independent of rAF) stays
  accurate.
- **Extremely short-lived states may not visibly "land"** in a background tab
  if they finish faster than the ~1s background tick — e.g. `task()` calls
  that resolve in a few hundred milliseconds. This is inherent to browser
  timer throttling, not something a library can work around from user space.
- **`prefers-reduced-motion: reduce` skips the scheduler entirely** — states
  render one static frame instead of looping. See
  [accessibility.md](./accessibility.md).

## Verifying it yourself

Open [`demo/index.html`](../demo/index.html) (after `npm run build`), click
**Start task**, and switch to another tab. The demo's task takes a few
seconds by design, specifically so you can watch the transition play out in
the tab strip rather than missing it.
