# @live-favicon/react

React hooks for [live-favicon](https://www.npmjs.com/package/@live-favicon/core) — turn the browser tab into a live status indicator.

## Install

```bash
npm install @live-favicon/core @live-favicon/react
```

## `useFaviconState`

Drives the favicon from a piece of React state. Resets on unmount by default.

```tsx
import { useFaviconState } from "@live-favicon/react";

function GenerationStatus({ status }: { status: "pending" | "done" | "failed" }) {
  useFaviconState(status === "pending" ? "thinking" : status === "done" ? "success" : "error");
  return null;
}
```

## `useFaviconTask`

Runs an async factory whenever `deps` change, driving the favicon through its
task lifecycle automatically, and returns `{ data, error, status }`.

```tsx
import { useFaviconTask } from "@live-favicon/react";

function SearchResults({ query }: { query: string }) {
  const { status, data, error } = useFaviconTask(
    () => (query ? fetchResults(query) : null),
    [query],
  );

  if (status === "pending") return <p>Loading...</p>;
  if (status === "error") return <p>Failed: {String(error)}</p>;
  return <ResultsList results={data} />;
}
```

## Imperative escape hatch

The underlying singleton and all of core's types are re-exported, for anything
outside a component (event handlers, non-React code):

```tsx
import { favicon } from "@live-favicon/react";

async function onExport() {
  await favicon.task(exportReport());
}
```

See the [live-favicon README](https://github.com/cridorainfo/live-favicon#readme) for the full state list and API.

## License

MIT
