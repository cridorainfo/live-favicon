import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resetFavicon, setFaviconDataUrl } from "../src/renderer/favicon-link";

function clearHead() {
  document.head.innerHTML = "";
}

describe("favicon-link", () => {
  beforeEach(() => {
    clearHead();
  });

  afterEach(() => {
    resetFavicon();
    clearHead();
  });

  it("creates a marked <link> when none exists", () => {
    setFaviconDataUrl("data:image/png;base64,AAA");
    const link = document.querySelector('link[rel="icon"]');
    expect(link).not.toBeNull();
    expect(link?.getAttribute("data-live-favicon")).toBe("true");
    expect(link?.getAttribute("href")).toBe("data:image/png;base64,AAA");
  });

  it("adopts an existing favicon link instead of creating a duplicate", () => {
    const existing = document.createElement("link");
    existing.rel = "icon";
    existing.href = "/original-favicon.png";
    document.head.appendChild(existing);

    setFaviconDataUrl("data:image/png;base64,BBB");

    const links = document.querySelectorAll('link[rel~="icon"]');
    expect(links.length).toBe(1);
    expect(links[0]?.getAttribute("data-live-favicon")).toBe("true");
    expect(links[0]?.getAttribute("href")).toBe("data:image/png;base64,BBB");
  });

  it("reuses the same element across repeated calls", () => {
    setFaviconDataUrl("data:image/png;base64,111");
    const first = document.querySelector('link[data-live-favicon="true"]');
    setFaviconDataUrl("data:image/png;base64,222");
    const second = document.querySelector('link[data-live-favicon="true"]');
    expect(first).toBe(second);
    expect(document.querySelectorAll('link[rel~="icon"]').length).toBe(1);
  });

  it("restores the original href on reset when a favicon was adopted", () => {
    const existing = document.createElement("link");
    existing.rel = "icon";
    existing.href = "/original-favicon.png";
    document.head.appendChild(existing);

    setFaviconDataUrl("data:image/png;base64,CCC");
    resetFavicon();

    const link = document.querySelector('link[rel~="icon"]');
    expect(link?.getAttribute("href")).toBe("/original-favicon.png");
    expect(link?.hasAttribute("data-live-favicon")).toBe(false);
  });

  it("removes the link entirely on reset when it created one", () => {
    setFaviconDataUrl("data:image/png;base64,DDD");
    resetFavicon();
    expect(document.querySelector('link[rel~="icon"]')).toBeNull();
  });
});
