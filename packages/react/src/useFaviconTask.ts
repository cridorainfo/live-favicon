import { useEffect, useRef, useState, type DependencyList } from "react";
import favicon from "live-favicon";
import type { TaskOptions } from "live-favicon";

export type UseFaviconTaskStatus = "idle" | "pending" | "success" | "error";

export interface UseFaviconTaskResult<T> {
  data: T | undefined;
  error: unknown;
  status: UseFaviconTaskStatus;
}

/**
 * Runs `factory()` whenever `deps` change, driving the favicon through its
 * task lifecycle (start -> success/error) for the duration. Returning `null`
 * from `factory` skips the run — e.g. while required inputs aren't ready.
 *
 * @example
 * const { status, data } = useFaviconTask(
 *   () => (query ? fetchResults(query) : null),
 *   [query]
 * );
 */
export function useFaviconTask<T>(
  factory: () => Promise<T> | null,
  deps: DependencyList,
  options?: TaskOptions,
): UseFaviconTaskResult<T> {
  const [state, setState] = useState<UseFaviconTaskResult<T>>({
    data: undefined,
    error: undefined,
    status: "idle",
  });

  const factoryRef = useRef(factory);
  factoryRef.current = factory;
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const promise = factoryRef.current();
    if (!promise) return;

    let cancelled = false;
    setState({ data: undefined, error: undefined, status: "pending" });

    favicon
      .task(promise, optionsRef.current)
      .then((data) => {
        if (!cancelled) setState({ data, error: undefined, status: "success" });
      })
      .catch((error: unknown) => {
        if (!cancelled) setState({ data: undefined, error, status: "error" });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
