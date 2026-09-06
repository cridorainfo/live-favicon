import { afterEach, describe, expect, it, vi } from "vitest";
import favicon, { spinner, pulse, iconBadge } from "../src/index";

function getLink() {
  return document.querySelector<HTMLLinkElement>('link[data-live-favicon="true"]');
}

describe("favicon.define()", () => {
  afterEach(() => {
    favicon.reset();
    document.head.innerHTML = "";
  });

  it("registers a custom state that favicon.state() can then render", () => {
    favicon.define("researching", spinner("#10A37F"));
    favicon.state("researching");
    expect(getLink()).not.toBeNull();
  });

  it("supports custom states built from pulse()", () => {
    favicon.define("brand-ping", pulse("#FF6B57"));
    favicon.state("brand-ping");
    expect(getLink()).not.toBeNull();
  });

  it("supports custom states built from iconBadge()", () => {
    favicon.define("blocked", iconBadge("#DC2626", "!"));
    favicon.state("blocked");
    expect(getLink()).not.toBeNull();
  });

  it("supports a static (non-animated) custom state", () => {
    favicon.define("brand-mark", iconBadge("#111827", "A"), { animated: false });
    favicon.state("brand-mark");
    expect(getLink()).not.toBeNull();
  });

  it("works with favicon.task()'s start/success/error overrides", async () => {
    favicon.define("researching", spinner("#10A37F"));
    favicon.define("done", iconBadge("#10A37F", "✓"), { animated: false });
    const result = await favicon.task(Promise.resolve(42), { start: "researching", success: "done" });
    expect(result).toBe(42);
    expect(getLink()).not.toBeNull();
  });

  it("throws when defining over a built-in state name", () => {
    expect(() => favicon.define("success", spinner("#000000"))).toThrow(/built-in/);
    expect(() => favicon.define("idle", spinner("#000000"))).toThrow(/built-in/);
  });

  it("warns (does not throw) and no-ops on an unregistered state name", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    favicon.state("totally-unregistered-state");
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("totally-unregistered-state"));
    expect(getLink()).toBeNull();
    warnSpy.mockRestore();
  });

  it("persists a defined state across reset() — define() is not part of reset state", () => {
    favicon.define("researching", spinner("#10A37F"));
    favicon.reset();
    favicon.state("researching");
    expect(getLink()).not.toBeNull();
  });
});
