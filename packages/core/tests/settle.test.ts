import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import favicon from "../src/index";
import { presets } from "../src/presets";

function setHidden(hidden: boolean) {
  Object.defineProperty(document, "hidden", { value: hidden, configurable: true });
  document.dispatchEvent(new Event("visibilitychange"));
}

// Regression test for a real bug: in a background tab the scheduler only
// ticks once every ~1s, which is *longer* than success/error's settle delay
// (~0.5s). Before the fix, the settle timer just stopped the scheduler on
// whatever frame it last had (t=0, blank) - a task resolving to success/error
// while the user was away would freeze there and never show the completed
// checkmark/X. The fix force-paints a settled frame (t=1) before stopping.
describe("settle behavior in a background tab", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "setInterval", "clearInterval", "cancelAnimationFrame", "setTimeout", "clearTimeout"] });
  });

  afterEach(() => {
    favicon.reset();
    document.head.innerHTML = "";
    setHidden(false);
    vi.useRealTimers();
  });

  it("still renders a settled (t>=1) success frame when backgrounded", () => {
    setHidden(true);
    const renderSpy = vi.spyOn(presets.success, "render");

    favicon.success();
    vi.advanceTimersByTime(600); // past the 500ms settle delay, before a 1000ms bg tick would fire

    const settledCall = renderSpy.mock.calls.find(([rc]) => rc.t >= 1);
    expect(settledCall).toBeDefined();
  });

  it("still renders a settled (t>=1) error frame when backgrounded", () => {
    setHidden(true);
    const renderSpy = vi.spyOn(presets.error, "render");

    favicon.error();
    vi.advanceTimersByTime(550); // past the 450ms settle delay, before a 1000ms bg tick would fire

    const settledCall = renderSpy.mock.calls.find(([rc]) => rc.t >= 1);
    expect(settledCall).toBeDefined();
  });
});
