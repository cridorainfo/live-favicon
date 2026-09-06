# Vanilla example

- **`index.html`** — a zero-build reference page exercising every
  `live-favicon` method: all states, `progress()`, `badge()`, `title()`,
  `task()`, and `reset()`.
- **`gmail-inbox.html`** — icon, tab title, and sound as three independent,
  fully developer-controlled knobs: two `define()`'d states (different icon,
  different sound each), with `title()` set per event to that event's own
  content — a subject line for a plain message, a one-time verification code
  for another. Email/OTP is just the example; the same three calls work for
  any kind of tab notification. See [sound.md](../../docs/sound.md) for the
  sound API.

## Run it

From the repo root:

```bash
npm run build
npx serve .   # or any static file server
```

Then open `examples/vanilla/index.html` through that server (not `file://` —
some browsers restrict favicon data URLs on the file protocol).

In your own project, skip the local build and use the CDN build instead:

```html
<script src="https://unpkg.com/@live-favicon/core"></script>
<script>
  const favicon = LiveFavicon.default;
  favicon.thinking();
</script>
```
