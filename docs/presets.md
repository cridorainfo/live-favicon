# Presets

Every image below is a real favicon render captured straight from the
library — the actual 64×64 PNG `live-favicon` produces, not a mockup.
(Generated via [`../examples/vanilla`](../examples/vanilla); regenerate with
`npm run build` then reload that page if you change a preset's drawing code.)

| Preset | | Description | Call |
| --- | --- | --- | --- |
| `thinking` | <img src="./assets/presets/thinking.png" width="48" height="48" alt="thinking"> | Three particles orbiting a shared center, brightening as they pass the front. General-purpose "working on it." | `favicon.thinking()` |
| `loading` | <img src="./assets/presets/loading.png" width="48" height="48" alt="loading"> | Rotating arc spinner, blue. The classic loading affordance. | `favicon.loading()` |
| `processing` | <img src="./assets/presets/processing.png" width="48" height="48" alt="processing"> | Same spinner, purple — for CPU/server-side work as distinct from `loading`. | `favicon.processing()` |
| `syncing` | <img src="./assets/presets/syncing.png" width="48" height="48" alt="syncing"> | Same spinner, teal — for sync/save operations. | `favicon.syncing()` |
| `reconnecting` | <img src="./assets/presets/reconnecting.png" width="48" height="48" alt="reconnecting"> | A broken, flickering ring in amber — deliberately unstable-looking, distinct from the smooth spinners. For dropped-connection / retry states. | `favicon.reconnecting()` |
| `uploading` | <img src="./assets/presets/uploading.png" width="48" height="48" alt="uploading"> | Particles rising from a baseline. | `favicon.uploading()` |
| `downloading` | <img src="./assets/presets/downloading.png" width="48" height="48" alt="downloading"> | Particles falling toward a baseline. | `favicon.downloading()` |
| `notification` | <img src="./assets/presets/notification.png" width="48" height="48" alt="notification"> | A dot with a ring that pulses outward and fades. Generic "something happened." | `favicon.notification()` |
| `mention` | <img src="./assets/presets/mention.png" width="48" height="48" alt="mention"> | An "@" badge with the same expanding-ring pulse, in orange — visually distinct from a plain `notification`. | `favicon.mention()` |
| `message` | <img src="./assets/presets/message.png" width="48" height="48" alt="message"> | A chat bubble with three dots, gently breathing. | `favicon.message()` |
| `success` | <img src="./assets/presets/success.png" width="48" height="48" alt="success"> | Green circle pops in, then a checkmark draws. Holds afterward (stops animating ~500ms after activation). | `favicon.success()` |
| `error` | <img src="./assets/presets/error.png" width="48" height="48" alt="error"> | Red circle pops in, then an X draws. Holds afterward (~450ms). | `favicon.error()` |
| `warning` | <img src="./assets/presets/warning.png" width="48" height="48" alt="warning"> | Static amber circle with `!`. Not color-only — see [accessibility.md](./accessibility.md). | `favicon.warning()` |
| `offline` | <img src="./assets/presets/offline.png" width="48" height="48" alt="offline"> | Static gray ring with a diagonal slash. | `favicon.offline()` |

`success`, `error`, `warning`, and `offline` render as full color; the table
above shows them at rest (a couple hundred ms after activation, or
immediately for the two static ones).

## Progress and badges

`favicon.progress(percent)` and `favicon.badge(count)` aren't presets — they
compose with the above rather than replacing them. See
[api-core.md](./api-core.md#faviconprogresspercent) for details.

## Picking a state

A few pairs exist specifically to carry semantic meaning even though they
look similar (`loading` / `processing` / `syncing` are the same spinner in
different colors) — pick by what's actually happening, not by which looks
best, so the color stays a meaningful signal across your app rather than
arbitrary decoration.
