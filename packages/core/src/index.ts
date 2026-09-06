import { Scheduler } from "./core/scheduler";
import { renderFrame, FAVICON_SIZE } from "./renderer/canvas";
import { setFaviconDataUrl, resetFavicon } from "./renderer/favicon-link";
import { setTitle, resetTitle } from "./renderer/title";
import { presets, makeProgress, spinner, pulse, iconBadge, type Preset } from "./presets";
import type { FaviconState, PresetRenderer, TaskOptions } from "./types";

export type { FaviconState, TaskOptions, RenderContext, PresetRenderer } from "./types";
export { spinner, pulse, iconBadge };

export interface DefineOptions {
  /** Whether this state needs a running scheduler, vs. a single static frame. Default: true. */
  animated?: boolean;
  /** For a pop-in/settle style animation: stop the scheduler and force a settled frame this long after activation. */
  settleAfterMs?: number;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

class LiveFavicon {
  private readonly scheduler = new Scheduler((elapsedMs) => this.renderCurrent(elapsedMs / 1000));
  private readonly customPresets = new Map<string, Preset>();
  private currentState: FaviconState = "idle";
  private currentBadge = 0;
  private currentPercent: number | null = null;
  private settleTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Register a custom state so `favicon.state(name)` (and `task()`'s
   * `start`/`success`/`error` options) can use it alongside the built-ins.
   * `renderer` is a `PresetRenderer` — write one by hand, or build one from
   * the exported kit (`spinner()`, `pulse()`, `iconBadge()`) without
   * touching canvas at all:
   *
   * ```js
   * favicon.define("researching", spinner("#10A37F"));
   * favicon.define("blocked", iconBadge("#DC2626", "!"));
   * favicon.state("researching");
   * ```
   *
   * Throws if `name` collides with a built-in state name (including
   * "idle") — built-ins can't be redefined.
   */
  define(name: string, renderer: PresetRenderer, options: DefineOptions = {}): this {
    if (name === "idle" || presets[name as keyof typeof presets]) {
      throw new Error(`live-favicon: "${name}" is a built-in state and can't be redefined via define().`);
    }
    this.customPresets.set(name, {
      render: renderer,
      animated: options.animated ?? true,
      settleAfterMs: options.settleAfterMs,
    });
    return this;
  }

  /** Switch to a named state — a built-in one, or one registered via `define()`. */
  state(name: FaviconState): this {
    this.clearSettleTimer();
    this.currentPercent = null;
    this.currentState = name;

    if (name === "idle") {
      this.scheduler.stop();
      resetFavicon();
      return this;
    }

    const preset = this.getPreset(name);
    if (!preset) {
      if (typeof console !== "undefined") {
        console.warn(`live-favicon: unknown state "${name}" — did you forget to call favicon.define("${name}", ...)?`);
      }
      return this;
    }

    if (!preset.animated || prefersReducedMotion()) {
      this.scheduler.stop();
      this.paint(preset.render, 0);
      return this;
    }

    this.paint(preset.render, 0); // immediate first frame, so there's no blank flash before the first tick
    this.scheduler.start();
    if (preset.settleAfterMs) {
      // Force-paint a frame safely past the pop-in duration before stopping,
      // rather than just freezing on whatever the scheduler last rendered.
      // In a background tab the scheduler ticks at ~1/s, which is *longer*
      // than this settle delay (~0.5s) - without this, the animation would
      // freeze on its blank starting frame and the checkmark/X would never
      // actually appear for a user who switched away before it resolved.
      this.settleTimer = setTimeout(() => {
        this.scheduler.stop();
        this.paint(preset.render, 1);
      }, preset.settleAfterMs);
    }
    return this;
  }

  thinking(): this {
    return this.state("thinking");
  }
  loading(): this {
    return this.state("loading");
  }
  processing(): this {
    return this.state("processing");
  }
  syncing(): this {
    return this.state("syncing");
  }
  reconnecting(): this {
    return this.state("reconnecting");
  }
  uploading(): this {
    return this.state("uploading");
  }
  downloading(): this {
    return this.state("downloading");
  }
  mention(): this {
    return this.state("mention");
  }
  message(): this {
    return this.state("message");
  }
  success(): this {
    return this.state("success");
  }
  error(): this {
    return this.state("error");
  }
  warning(): this {
    return this.state("warning");
  }
  offline(): this {
    return this.state("offline");
  }
  notification(): this {
    return this.state("notification");
  }
  alarm(): this {
    return this.state("alarm");
  }
  celebration(): this {
    return this.state("celebration");
  }
  payment(): this {
    return this.state("payment");
  }
  queue(): this {
    return this.state("queue");
  }

  /** Render a 0-100 progress ring. Stops any running state animation. */
  progress(percent: number): this {
    this.clearSettleTimer();
    this.scheduler.stop();
    this.currentPercent = percent;
    this.paint(makeProgress(percent), 0);
    return this;
  }

  /** Overlay a small numeric badge (e.g. unread count) on the current icon. */
  badge(count: number): this {
    this.currentBadge = count;
    if (!this.scheduler.isRunning()) this.repaintCurrent();
    return this;
  }

  /** Set the browser tab title. The original title is restored by reset(). */
  title(text: string): this {
    setTitle(text);
    return this;
  }

  /**
   * Wraps an async operation with automatic state transitions:
   * `start` while pending (default "thinking"), `success` on resolve,
   * `error` on reject. The original error is rethrown after the state updates.
   */
  async task<T>(promise: Promise<T>, opts: TaskOptions = {}): Promise<T> {
    this.state(opts.start ?? "thinking");
    try {
      const result = await promise;
      this.state(opts.success ?? "success");
      return result;
    } catch (err) {
      this.state(opts.error ?? "error");
      throw err;
    }
  }

  /** Restore the page's original favicon and title, and stop all animation. */
  reset(): this {
    this.clearSettleTimer();
    this.scheduler.stop();
    resetFavicon();
    resetTitle();
    this.currentState = "idle";
    this.currentBadge = 0;
    this.currentPercent = null;
    return this;
  }

  private clearSettleTimer(): void {
    if (this.settleTimer !== null) {
      clearTimeout(this.settleTimer);
      this.settleTimer = null;
    }
  }

  private renderCurrent(t: number): void {
    if (this.currentPercent !== null || this.currentState === "idle") return;
    const preset = this.getPreset(this.currentState);
    if (!preset) return;
    this.paint(preset.render, t);
  }

  private repaintCurrent(): void {
    if (this.currentPercent !== null) {
      this.paint(makeProgress(this.currentPercent), 0);
      return;
    }
    if (this.currentState === "idle") return;
    const preset = this.getPreset(this.currentState);
    if (preset && !preset.animated) this.paint(preset.render, 0);
  }

  private getPreset(name: string): Preset | undefined {
    return presets[name as keyof typeof presets] ?? this.customPresets.get(name);
  }

  private paint(render: Parameters<typeof renderFrame>[0], t: number): void {
    const url = renderFrame(render, t, this.currentBadge);
    if (url) setFaviconDataUrl(url);
  }
}

const favicon = new LiveFavicon();

export default favicon;
export { FAVICON_SIZE };
