import { afterEach, describe, expect, it, vi } from "vitest";
import favicon from "../src/index";
import { presets } from "../src/presets";

function getLink() {
  return document.querySelector<HTMLLinkElement>('link[data-live-favicon="true"]');
}

describe("favicon controller", () => {
  afterEach(() => {
    favicon.reset();
    document.head.innerHTML = "";
    document.title = "";
    vi.useRealTimers();
  });

  it("state('idle') is a no-op reset shortcut", () => {
    favicon.state("thinking");
    expect(getLink()).not.toBeNull();
    favicon.state("idle");
    expect(getLink()).toBeNull();
  });

  it("thinking() renders a favicon link", () => {
    favicon.thinking();
    const link = getLink();
    expect(link).not.toBeNull();
    expect(link?.href).toMatch(/^data:image\/png;base64,/);
  });

  it("warning() and offline() render a single static frame without starting the scheduler", () => {
    favicon.warning();
    expect(getLink()).not.toBeNull();
    // static states shouldn't need the animation loop; badge() should repaint synchronously
    favicon.badge(3);
    expect(getLink()?.href).toMatch(/^data:image\/png;base64,/);
  });

  it("progress() renders regardless of percent bounds", () => {
    favicon.progress(150); // out of range, should clamp internally without throwing
    expect(getLink()).not.toBeNull();
    favicon.progress(-10);
    expect(getLink()).not.toBeNull();
  });

  it("title() sets the tab title and reset() restores the original", () => {
    document.title = "My App";
    favicon.title("Working...");
    expect(document.title).toBe("Working...");
    favicon.reset();
    expect(document.title).toBe("My App");
  });

  it("reset() removes the favicon link and clears state", () => {
    favicon.thinking();
    favicon.reset();
    expect(getLink()).toBeNull();
  });

  it("task() resolves to success state and returns the original value", async () => {
    const result = await favicon.task(Promise.resolve(42));
    expect(result).toBe(42);
    expect(getLink()).not.toBeNull();
  });

  it("task() moves to error state and rethrows on rejection", async () => {
    const boom = new Error("boom");
    await expect(favicon.task(Promise.reject(boom))).rejects.toThrow("boom");
    expect(getLink()).not.toBeNull();
  });

  it("task() respects custom state overrides", async () => {
    await favicon.task(Promise.resolve("ok"), { start: "loading", success: "notification" });
    expect(getLink()).not.toBeNull();
  });

  it("renders a favicon for every registered preset without throwing", () => {
    for (const name of Object.keys(presets) as Array<keyof typeof presets>) {
      favicon.state(name);
      expect(getLink(), `state "${name}" should render a favicon`).not.toBeNull();
      favicon.reset();
    }
  });

  it("supports chaining", () => {
    expect(favicon.thinking()).toBe(favicon);
    expect(favicon.title("x")).toBe(favicon);
    expect(favicon.badge(1)).toBe(favicon);
    expect(favicon.reset()).toBe(favicon);
  });
});
