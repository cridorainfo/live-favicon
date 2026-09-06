# Vanilla example

A zero-build reference page exercising every `live-favicon` method: all
states, `progress()`, `badge()`, `title()`, `task()`, and `reset()`.

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
<script src="https://unpkg.com/live-favicon"></script>
<script>
  const favicon = LiveFavicon.default;
  favicon.thinking();
</script>
```
