import { afterEach, describe, expect, it } from "vitest";
import { resetTitle, setTitle } from "../src/renderer/title";

describe("title", () => {
  afterEach(() => {
    resetTitle();
  });

  it("sets the document title", () => {
    setTitle("Processing...");
    expect(document.title).toBe("Processing...");
  });

  it("remembers the original title and restores it on reset", () => {
    document.title = "My App";
    setTitle("Thinking...");
    setTitle("Processing...");
    expect(document.title).toBe("Processing...");
    resetTitle();
    expect(document.title).toBe("My App");
  });

  it("is a no-op if reset is called without ever setting a title", () => {
    document.title = "Untouched";
    resetTitle();
    expect(document.title).toBe("Untouched");
  });
});
