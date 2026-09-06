import { useState } from "react";
import { useFaviconState, useFaviconTask, favicon, type FaviconState } from "@live-favicon/react";

function fakeFetch<T>(value: T, ms: number, shouldFail = false): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => (shouldFail ? reject(new Error("simulated failure")) : resolve(value)), ms);
  });
}

/**
 * Demonstrates useFaviconTask: runs a simulated fetch whenever `query`
 * changes, driving the favicon through its task lifecycle automatically.
 */
function SearchResults({ query }: { query: string }) {
  const { status, data, error } = useFaviconTask(
    () => (query ? fakeFetch(`${Math.floor(Math.random() * 900) + 100} results for "${query}"`, 1200) : null),
    [query],
  );

  if (status === "idle") return <p className="hint">Type a query above.</p>;
  if (status === "pending") return <p className="hint">Searching...</p>;
  if (status === "error") return <p className="error">Failed: {String(error)}</p>;
  return <p className="result">{data}</p>;
}

/**
 * Demonstrates useFaviconState: applies `state` declaratively, and resets
 * the favicon when this component unmounts (the default). Toggling it off
 * in the UI below shows that reset happening in real time.
 */
function StatusIndicator({ state }: { state: FaviconState }) {
  useFaviconState(state);
  return <p className="hint">Favicon is showing: <code>{state}</code></p>;
}

export default function App() {
  const [query, setQuery] = useState("");
  const [indicatorOn, setIndicatorOn] = useState(true);
  const [indicatorState, setIndicatorState] = useState<FaviconState>("thinking");

  const [taskStatus, setTaskStatus] = useState<"idle" | "pending" | "success" | "error">("idle");

  async function runImperativeTask(shouldFail: boolean) {
    setTaskStatus("pending");
    try {
      await favicon.task(fakeFetch("done", 1000, shouldFail));
      setTaskStatus("success");
    } catch {
      setTaskStatus("error");
    }
  }

  return (
    <main>
      <h1>live-favicon — React example</h1>
      <p className="sub">Watch the browser tab while you interact below.</p>

      <section>
        <h2>useFaviconTask</h2>
        <p className="hint">Runs a simulated search whenever the query changes.</p>
        <input
          type="text"
          placeholder="Type to search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <SearchResults query={query} />
      </section>

      <section>
        <h2>useFaviconState</h2>
        <p className="hint">Declaratively drives the favicon; resets it on unmount.</p>
        <div className="row">
          <select
            value={indicatorState}
            onChange={(e) => setIndicatorState(e.target.value as FaviconState)}
          >
            {(["thinking", "success", "error", "warning", "notification"] as const).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button onClick={() => setIndicatorOn((v) => !v)}>
            {indicatorOn ? "Unmount indicator" : "Mount indicator"}
          </button>
        </div>
        {indicatorOn ? <StatusIndicator state={indicatorState} /> : <p className="hint">Unmounted — favicon was reset.</p>}
      </section>

      <section>
        <h2>Imperative escape hatch</h2>
        <p className="hint">Using the re-exported <code>favicon</code> singleton directly, outside a hook.</p>
        <div className="row">
          <button onClick={() => runImperativeTask(false)}>Run task (resolves)</button>
          <button onClick={() => runImperativeTask(true)}>Run task (rejects)</button>
        </div>
        <p className="hint">Status: {taskStatus}</p>
      </section>
    </main>
  );
}
