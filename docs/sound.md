# Sound

`live-favicon` can play a short sound alongside an icon change — useful for
anything that arrives while the user is on another tab and won't see the
favicon change at all until they switch back: a new chat message, an
incoming email, an alarm.

Sound is attached to a state at `define()` time, not passed to `state()` per
call:

```js
import favicon, { iconBadge } from "@live-favicon/core";

favicon.define("new-mail", iconBadge("#EA4335", "✉"), { sound: true });

favicon.state("new-mail"); // icon changes AND the chime plays
```

## Built-in chime vs. your own audio

`sound: true` plays a short two-tone chime synthesized with the Web Audio
API — no MP3/WAV asset to ship, and it works offline. Pass a URL instead to
play your own sound file:

```js
favicon.define("new-mail", iconBadge("#EA4335", "✉"), {
  sound: "/sounds/new-mail.mp3",
});
```

The same `<audio>` element is reused for every replay of that URL (browsers
otherwise re-fetch on every `new Audio()`), so repeated notifications don't
re-download the file.

A state defined without a `sound` option — and every built-in state
(`message`, `notification`, `mention`, `alarm`, …) — stays silent. Sound is
opt-in per state, not attached to any built-in by default.

## The global mute switch

```ts
favicon.sound(enabled?: boolean): this  // default: true
```

`favicon.sound(false)` silences every state's declared sound until you call
`favicon.sound(true)` again. It's a standing preference, not a per-call
option — wire it to whatever "mute notifications" toggle your app already
has:

```js
muteCheckbox.addEventListener("change", (e) => {
  favicon.sound(!e.target.checked);
});
```

Like a `define()`'d state, this setting survives `reset()` — muting is a
user preference, not per-session animation state.

## Combine with `title()` and `badge()` for a full notification

Icon, title, badge, and sound are independent calls, so a single incoming
event typically fires three or four of them together:

```js
function onNewMail(message) {
  favicon.state("new-mail"); // icon + chime
  favicon.badge(unreadCount); // unread count overlay
  favicon.title(`(${unreadCount}) ${message.subject} — Inbox`); // tab title
}
```

See [`examples/vanilla/gmail-inbox.html`](../examples/vanilla/gmail-inbox.html)
for a runnable version of this with *two* states — a plain message and a
verification-code email each get their own icon and sound via `define()`,
and their own `title()` text carrying that message's actual content (a
subject line, or a one-time code) rather than a generic "you have mail."

## Browser autoplay limits

Browsers block both the Web Audio API and `<audio>` playback until the page
has seen a user gesture (a click, a keypress, a tap) — a deliberate
anti-annoyance policy, not something a library can override. `live-favicon`
does two things about it, rather than just failing silently:

1. **It unlocks proactively.** The first `define()` call with a `sound`
   option arms one-time listeners for the page's next click/keypress/tap,
   and uses that exact gesture to create/resume the audio context —
   synchronously inside the gesture's call stack, which is what actually
   satisfies stricter browsers (notably Safari). Since almost every real app
   sees an interaction within the first few seconds, the context is
   typically already unlocked by the time a real notification arrives, well
   before any sound is actually requested.
2. **It doesn't lose a sound that's genuinely too early.** If a
   sound-carrying state activates before any gesture at all — e.g. a
   WebSocket message that arrives one second after page load, before the
   user has touched anything — the icon and title still update immediately,
   and the sound is remembered and replayed the instant the user's first
   interaction lands, instead of being silently dropped. Only the single
   most recent blocked sound is kept — if several notifications stack up
   before that first click, you get one catch-up chime on it, not a burst of
   stale ones.

None of this makes audio play with *zero* gesture ever — that's not
possible, and antivirus for eardrums is a reasonable thing for browsers to
enforce. What it does is close the gap between "the user hasn't clicked
anything at all since the page loaded" (rare, and now handled) and "the
user has clicked something, so audio should just work" (the common case,
now unlocked ahead of time instead of on the first attempt).
