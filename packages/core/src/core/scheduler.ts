/**
 * Drives the animation loop with adaptive rendering:
 *  - foreground tab -> requestAnimationFrame, throttled to a modest FPS
 *    (a 32x32/64x64 favicon does not need 60fps, and this keeps CPU usage negligible)
 *  - background tab -> setInterval. Browsers clamp background timers to roughly
 *    once per second regardless of what we ask for, so we lean into that instead
 *    of fighting it: a ~1fps favicon pulse is still a perfectly legible status signal.
 *
 * Time is always delta-based (elapsed seconds since the state became active), so
 * presets animate at a consistent visual speed no matter which loop is driving them.
 */

export type TickFn = (elapsedMs: number) => void;

const FOREGROUND_FRAME_MS = 1000 / 12; // ~12fps
const BACKGROUND_INTERVAL_MS = 1000;

/**
 * rAF's own timestamp isn't guaranteed to be >= a performance.now() taken
 * moments before scheduling it (it can register as marginally earlier due
 * to how frame timing is captured), so a naive `now - startTime` can go
 * slightly negative. Presets shouldn't have to individually defend against
 * that — clamp once, here, at the source.
 */
export function elapsedSince(startTime: number, now: number = performance.now()): number {
  return Math.max(0, now - startTime);
}

export class Scheduler {
  private readonly tick: TickFn;
  private rafId: number | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private startTime = 0;
  private lastFrameTime = 0;
  private running = false;

  private readonly onVisibilityChange = () => {
    if (!this.running) return;
    this.stopLoop();
    this.runLoop();
  };

  constructor(tick: TickFn) {
    this.tick = tick;
  }

  start(): void {
    if (this.running || typeof document === "undefined") return;
    this.running = true;
    this.startTime = performance.now();
    this.lastFrameTime = 0;
    document.addEventListener("visibilitychange", this.onVisibilityChange);
    this.runLoop();
  }

  stop(): void {
    if (!this.running) return;
    this.running = false;
    this.stopLoop();
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this.onVisibilityChange);
    }
  }

  isRunning(): boolean {
    return this.running;
  }

  private stopLoop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private runLoop(): void {
    if (typeof document !== "undefined" && document.hidden) {
      this.tick(elapsedSince(this.startTime));
      this.intervalId = setInterval(() => {
        this.tick(elapsedSince(this.startTime));
      }, BACKGROUND_INTERVAL_MS);
      return;
    }

    const frame = (now: number) => {
      if (now - this.lastFrameTime >= FOREGROUND_FRAME_MS) {
        this.lastFrameTime = now;
        this.tick(elapsedSince(this.startTime, now));
      }
      this.rafId = requestAnimationFrame(frame);
    };
    this.rafId = requestAnimationFrame(frame);
  }
}
