import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Scheduler } from "../src/core/scheduler";

function setHidden(hidden: boolean) {
  Object.defineProperty(document, "hidden", { value: hidden, configurable: true });
  document.dispatchEvent(new Event("visibilitychange"));
}

describe("Scheduler", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "setInterval", "clearInterval", "cancelAnimationFrame"] });
    setHidden(false);
  });

  afterEach(() => {
    vi.useRealTimers();
    setHidden(false);
  });

  it("ticks repeatedly via requestAnimationFrame while visible", () => {
    const tick = vi.fn();
    const scheduler = new Scheduler(tick);
    scheduler.start();

    vi.advanceTimersByTime(500);

    expect(tick.mock.calls.length).toBeGreaterThan(1);
    scheduler.stop();
  });

  it("stops ticking once stop() is called", () => {
    const tick = vi.fn();
    const scheduler = new Scheduler(tick);
    scheduler.start();
    vi.advanceTimersByTime(200);
    const callsBeforeStop = tick.mock.calls.length;

    scheduler.stop();
    vi.advanceTimersByTime(500);

    expect(tick.mock.calls.length).toBe(callsBeforeStop);
  });

  it("ticks immediately and then on a ~1s interval while the tab is hidden", () => {
    setHidden(true);
    const tick = vi.fn();
    const scheduler = new Scheduler(tick);
    scheduler.start();

    expect(tick.mock.calls.length).toBe(1); // immediate tick on start

    vi.advanceTimersByTime(1000);
    expect(tick.mock.calls.length).toBe(2);

    vi.advanceTimersByTime(2000);
    expect(tick.mock.calls.length).toBe(4);

    scheduler.stop();
  });

  it("reports isRunning() accurately", () => {
    const scheduler = new Scheduler(() => {});
    expect(scheduler.isRunning()).toBe(false);
    scheduler.start();
    expect(scheduler.isRunning()).toBe(true);
    scheduler.stop();
    expect(scheduler.isRunning()).toBe(false);
  });

  it("is a no-op to start() twice", () => {
    const tick = vi.fn();
    const scheduler = new Scheduler(tick);
    scheduler.start();
    scheduler.start();
    vi.advanceTimersByTime(200);
    scheduler.stop();
    // Starting twice must not double the tick rate.
    expect(tick.mock.calls.length).toBeLessThan(10);
  });
});
