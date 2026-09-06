# Getting started

## Install

```bash
npm install @live-favicon/core
```

Using React? Also install the hooks package:

```bash
npm install @live-favicon/core @live-favicon/react
```

No build step? Use the standalone script — see [Vanilla / no-build usage](#vanilla--no-build-usage) below.

## Your first status

```js
import favicon from "@live-favicon/core";

favicon.thinking();
```

That's it — the page's favicon (and, unless you've set one, the tab keeps its
existing title) now shows an animated "thinking" indicator. Switch to another
tab; it keeps animating at a lower frame rate rather than stopping (see
[Background tabs](./background-tabs.md)).

Move to another state at any point:

```js
favicon.success(); // or .error(), .warning(), .loading(), ...
```

Restore everything the library changed — the original favicon and title:

```js
favicon.reset();
```

## Wrapping an async operation with `task()`

This is the API you'll reach for most. It handles the whole lifecycle —
pending state, then success or error — around a promise you already have:

```js
async function generate() {
  const result = await favicon.task(callYourAI());
  return result;
}
```

By default that's `thinking` while pending, `success` on resolve, `error` on
reject (and the original error is rethrown after the favicon updates, so your
own error handling still runs). Override any of the three:

```js
await favicon.task(uploadFile(), {
  start: "uploading",
  success: "success",
  error: "error",
});
```

See [every available state](./presets.md) for the full list of `start` /
`success` / `error` options.

## Showing progress

```js
xhr.upload.onprogress = (e) => {
  favicon.progress((e.loaded / e.total) * 100);
};
```

`progress()` clamps to 0–100 and stops any running state animation — it's
meant for operations that report real, granular progress. For anything else,
one of the looping states (`thinking`, `processing`, `syncing`, ...) is
usually the better fit.

## Badges and the title

```js
favicon.badge(unreadCount); // small numeric overlay, e.g. unread messages
favicon.title(`(${unreadCount}) Inbox`); // most browsers show this in the tab
```

`badge()` composes with whatever state is currently showing. `title()` and
`reset()` both remember and restore the page's original `document.title`.

## Vanilla / no-build usage

```html
<script src="https://unpkg.com/@live-favicon/core"></script>
<script>
  const favicon = LiveFavicon.default;
  favicon.thinking();
</script>
```

See [`examples/vanilla`](../examples/vanilla) for a fuller reference page
exercising every method.

## React

```bash
npm install @live-favicon/core @live-favicon/react
```

```tsx
import { useFaviconState } from "@live-favicon/react";

function GenerationStatus({ status }: { status: "pending" | "done" | "failed" }) {
  useFaviconState(
    status === "pending" ? "thinking" : status === "done" ? "success" : "error",
  );
  return null;
}
```

See [`docs/api-react.md`](./api-react.md) and
[`examples/react`](../examples/react) for the full hooks reference and a
runnable app.

## Next steps

- [Core API reference](./api-core.md) for the complete method list
- [Presets](./presets.md) to see and choose from every built-in state
- [Background tabs](./background-tabs.md) to understand what actually happens
  once the user switches away
- [Accessibility](./accessibility.md) before you rely on this for anything
  time-sensitive
