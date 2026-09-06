# Accessibility

## Reduced motion

`live-favicon` checks `prefers-reduced-motion: reduce` on every `state()`
call. When it's set, animated states render a single static frame instead of
looping — the scheduler never starts, so there's no continuous motion for
that state at all, foreground or background.

There's no separate opt-in required and no configuration flag: it follows the
OS/browser-level setting the user already chose, the same way any other
well-behaved animation should.

## Not color-only

`warning` and `error` don't rely on hue alone — `warning` renders a `!` and
`error` pops into an `X`, both in white on top of the colored circle, so the
status is legible even for a user who can't distinguish amber from red. If
you add custom presets (see [presets.md](./presets.md) for the built-in set
as a reference), the same principle applies: pair color with a shape or
symbol, not color instead of one.

## What a favicon can't do

This is the more important section. A favicon and tab title are **not**
accessible in the way a properly authored on-page status message is:

- **Screen readers don't announce favicon or title changes.** A
  `document.title` change is occasionally picked up by some assistive tech in
  some configurations, but it's not reliable, and a favicon change is never
  announced.
- **It's invisible if the tab isn't visible at all** — minimized windows,
  screen readers navigating without sighted use of the tab strip, or browser
  chrome hidden in kiosk/PWA modes.
- **It's easy to miss even for sighted users** who aren't looking at the tab
  strip.

**Use `live-favicon` as a supplementary channel, never the only one.** For
anything the user must not miss — a failed payment, a completed critical
task, a security alert — also render an on-page, ARIA-announced status
(e.g. an `aria-live` region) or another notification channel appropriate to
the severity. Treat the favicon as what it is: a convenience for someone who
has voluntarily switched away and would appreciate not having to check back
manually, not a substitute for accessible status reporting on the page
itself.
