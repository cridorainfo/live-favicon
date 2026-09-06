import { afterEach, describe, expect, it } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import favicon from "@live-favicon/core";
import { useFaviconTask } from "../src/useFaviconTask";

describe("useFaviconTask", () => {
  afterEach(() => {
    favicon.reset();
    document.head.innerHTML = "";
  });

  it("goes pending then success, returning the resolved value", async () => {
    const { result } = renderHook(() => useFaviconTask(() => Promise.resolve(42), []));
    expect(result.current.status).toBe("pending");

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.data).toBe(42);
    expect(result.current.error).toBeUndefined();
  });

  it("goes pending then error, exposing the rejection without throwing", async () => {
    const { result } = renderHook(() => useFaviconTask(() => Promise.reject(new Error("nope")), []));

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect((result.current.error as Error).message).toBe("nope");
    expect(result.current.data).toBeUndefined();
  });

  it("stays idle when the factory returns null", () => {
    const { result } = renderHook(() => useFaviconTask(() => null, []));
    expect(result.current.status).toBe("idle");
  });

  it("re-runs when deps change", async () => {
    const { result, rerender } = renderHook(({ n }: { n: number }) => useFaviconTask(() => Promise.resolve(n), [n]), {
      initialProps: { n: 1 },
    });
    await waitFor(() => expect(result.current.data).toBe(1));

    rerender({ n: 2 });
    await waitFor(() => expect(result.current.data).toBe(2));
  });
});
