# React API reference (`@live-favicon/react`)

```bash
npm install live-favicon @live-favicon/react
```

```tsx
import { useFaviconState, useFaviconTask, favicon } from "@live-favicon/react";
```

The package re-exports the core singleton and its types (`favicon`,
`FAVICON_SIZE`, `FaviconState`, `TaskOptions`) alongside two hooks. The
underlying favicon is still a single, page-wide singleton — these hooks are
convenience wrappers around it, not per-component state.

## `useFaviconState(state, options?)`

```ts
function useFaviconState(
  state: FaviconState | null | undefined,
  options?: { resetOnUnmount?: boolean }, // default true
): void
```

Applies `state` whenever it changes. Pass `null`/`undefined` to leave the
favicon untouched (e.g. before a real status is known yet).

```tsx
function GenerationStatus({ status }: { status: "pending" | "done" | "failed" }) {
  useFaviconState(
    status === "pending" ? "thinking" : status === "done" ? "success" : "error",
  );
  return null;
}
```

By default, the favicon is **reset when the component unmounts** — restoring
the page's original favicon and title. Since there's only one favicon per
page, this is meant for a single top-level status component (a page or route
root), not several components independently driving the same favicon. If
something else in your app owns the reset, pass `resetOnUnmount: false`:

```tsx
useFaviconState(status, { resetOnUnmount: false });
```

## `useFaviconTask(factory, deps, options?)`

```ts
function useFaviconTask<T>(
  factory: () => Promise<T> | null,
  deps: DependencyList,
  options?: TaskOptions,
): { data: T | undefined; error: unknown; status: "idle" | "pending" | "success" | "error" }
```

Runs `factory()` inside an effect whenever `deps` changes, driving the
favicon through `favicon.task()` for the duration. Returning `null` from
`factory` skips the run entirely (e.g. while a required input isn't ready) —
`status` stays `"idle"`.

```tsx
function SearchResults({ query }: { query: string }) {
  const { status, data, error } = useFaviconTask(
    () => (query ? fetchResults(query) : null),
    [query],
  );

  if (status === "idle") return <p>Type to search.</p>;
  if (status === "pending") return <p>Searching...</p>;
  if (status === "error") return <p>Failed: {String(error)}</p>;
  return <ResultsList results={data} />;
}
```

`options` is passed straight through to `favicon.task()` (`start` / `success`
/ `error` overrides). A stale run is not applied if `deps` changes again
before it resolves — the hook tracks cancellation internally, so `data`/`error`
always reflect the most recent call.

## Imperative escape hatch

For anything outside a component — event handlers, a non-React module, a
service worker message handler — use the re-exported singleton directly:

```tsx
import { favicon } from "@live-favicon/react";

async function onExportClick() {
  await favicon.task(exportReport());
}
```

## Next.js / server-side rendering

The core library is a no-op when there's no `document`, so importing it is
SSR-safe. The hooks themselves call `useEffect`, so they only run client-side
— but the component that calls them still needs the `"use client"` directive
in the App Router:

```tsx
"use client";
import { useFaviconState } from "@live-favicon/react";
```
