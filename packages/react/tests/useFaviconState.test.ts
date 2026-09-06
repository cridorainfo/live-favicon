import { afterEach, describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import favicon from "live-favicon";
import { useFaviconState } from "../src/useFaviconState";

function getLink() {
  return document.querySelector<HTMLLinkElement>('link[data-live-favicon="true"]');
}

describe("useFaviconState", () => {
  afterEach(() => {
    favicon.reset();
    document.head.innerHTML = "";
  });

  it("applies the given state on mount", () => {
    renderHook(() => useFaviconState("thinking"));
    expect(getLink()).not.toBeNull();
  });

  it("updates the favicon when the state value changes", () => {
    const { rerender } = renderHook(({ state }: { state: "thinking" | "success" }) => useFaviconState(state), {
      initialProps: { state: "thinking" },
    });
    expect(getLink()).not.toBeNull();
    rerender({ state: "success" });
    expect(getLink()).not.toBeNull();
  });

  it("resets the favicon on unmount by default", () => {
    const { unmount } = renderHook(() => useFaviconState("thinking"));
    unmount();
    expect(getLink()).toBeNull();
  });

  it("does not reset on unmount when resetOnUnmount is false", () => {
    const { unmount } = renderHook(() => useFaviconState("thinking", { resetOnUnmount: false }));
    unmount();
    expect(getLink()).not.toBeNull();
  });

  it("does nothing when state is null", () => {
    renderHook(() => useFaviconState(null));
    expect(getLink()).toBeNull();
  });
});
