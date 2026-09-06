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
for a runnable version of this, including pulling a one-time code out of the
message body as it "arrives."

## Browser autoplay limits

Browsers block both the Web Audio API and `<audio>` playback until the page
has seen a user gesture (a click, a keypress, a tap). If `state()` activates
a sound-carrying state before the user has interacted with the page at all
— e.g. a WebSocket message that arrives one second after page load — the
icon still changes, but the sound may not audibly play. There's no reliable
way to work around this from a library; `live-favicon` fails silently in
that case rather than throwing, the same way it no-ops when there's no
`document` at all. In practice this is rarely an issue: by the time a real
notification arrives, the user has almost always clicked or typed something
on the page already.
