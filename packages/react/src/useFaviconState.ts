import { useEffect, useRef } from "react";
import favicon from "live-favicon";
import type { FaviconState } from "live-favicon";

export interface UseFaviconStateOptions {
  /**
   * Restore the page's original favicon and title when this component
   * unmounts. Default: true. Since the favicon is a single, page-wide
   * singleton, only set this to false if another part of the app is
   * responsible for resetting it.
   */
  resetOnUnmount?: boolean;
}

/**
 * Drives the shared favicon singleton from a piece of React state.
 * Pass `null`/`undefined` to leave the favicon untouched — useful before a
 * state is known yet.
 *
 * @example
 * function GenerationStatus({ status }: { status: "pending" | "done" | "failed" }) {
 *   useFaviconState(
 *     status === "pending" ? "thinking" : status === "done" ? "success" : "error"
 *   );
 *   return null;
 * }
 */
export function useFaviconState(
  state: FaviconState | null | undefined,
  options: UseFaviconStateOptions = {},
): void {
  const { resetOnUnmount = true } = options;
  const resetOnUnmountRef = useRef(resetOnUnmount);
  resetOnUnmountRef.current = resetOnUnmount;

  useEffect(() => {
    if (state) favicon.state(state);
  }, [state]);

  useEffect(() => {
    return () => {
      if (resetOnUnmountRef.current) favicon.reset();
    };
  }, []);
}
