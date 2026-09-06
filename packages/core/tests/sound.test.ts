import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as SoundModule from "../src/renderer/sound";

class MockAudioParam {
  setValueAtTime = vi.fn();
  exponentialRampToValueAtTime = vi.fn();
}

class MockGainNode {
  gain = new MockAudioParam();
  connect = vi.fn((dest: unknown) => dest);
}

class MockOscillatorNode {
  type = "";
  frequency = new MockAudioParam();
  connect = vi.fn((dest: unknown) => dest);
  start = vi.fn();
  stop = vi.fn();
}

class MockAudioContext {
  currentTime = 0;
  state: "running" | "suspended" = "running";
  destination = {};
  resume = vi.fn(() => Promise.resolve());
  createOscillator = vi.fn(() => new MockOscillatorNode());
  createGain = vi.fn(() => new MockGainNode());
}

// The module caches a single AudioContext for its own lifetime (real browsers
// discourage creating many). That's the right call for production, but it
// means each test needs a *fresh* module instance to observe its own mock —
// hence vi.resetModules() + a dynamic re-import, rather than one shared
// top-level `import`.
let sound: typeof SoundModule;

beforeEach(async () => {
  vi.resetModules();
  sound = await import("../src/renderer/sound");
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("sound", () => {
  it("defaults to enabled", () => {
    expect(sound.isSoundEnabled()).toBe(true);
  });

  it("setSoundEnabled(false) is reflected by isSoundEnabled()", () => {
    sound.setSoundEnabled(false);
    expect(sound.isSoundEnabled()).toBe(false);
  });

  describe("playSound(true) — built-in chime", () => {
    it("plays two tones through the Web Audio API", () => {
      const ctx = new MockAudioContext();
      vi.stubGlobal("AudioContext", vi.fn(() => ctx));

      sound.playSound(true);

      expect(ctx.createOscillator).toHaveBeenCalledTimes(2);
      expect(ctx.createGain).toHaveBeenCalledTimes(2);
    });

    it("resumes a suspended AudioContext before playing", () => {
      const ctx = new MockAudioContext();
      ctx.state = "suspended";
      vi.stubGlobal("AudioContext", vi.fn(() => ctx));

      sound.playSound(true);

      expect(ctx.resume).toHaveBeenCalled();
    });

    it("does nothing when AudioContext isn't available (SSR-safe, no throw)", () => {
      vi.stubGlobal("AudioContext", undefined);
      expect(() => sound.playSound(true)).not.toThrow();
    });

    it("is silenced by the global toggle", () => {
      const ctx = new MockAudioContext();
      vi.stubGlobal("AudioContext", vi.fn(() => ctx));
      sound.setSoundEnabled(false);

      sound.playSound(true);

      expect(ctx.createOscillator).not.toHaveBeenCalled();
    });
  });

  describe("playSound(url) — custom audio", () => {
    function stubAudio() {
      const instances: Array<{ play: ReturnType<typeof vi.fn>; currentTime: number; src: string }> = [];
      const AudioCtor = vi.fn(function (this: { play: unknown; currentTime: number; src: string }, src: string) {
        this.src = src;
        this.currentTime = 0;
        this.play = vi.fn(() => Promise.resolve());
        instances.push(this as unknown as (typeof instances)[number]);
      });
      vi.stubGlobal("Audio", AudioCtor);
      return { AudioCtor, instances };
    }

    it("plays a custom audio URL", () => {
      const { AudioCtor, instances } = stubAudio();

      sound.playSound("https://example.com/chime-a.mp3");

      expect(AudioCtor).toHaveBeenCalledWith("https://example.com/chime-a.mp3");
      expect(instances[0]?.play).toHaveBeenCalledTimes(1);
    });

    it("reuses the same audio element on repeat plays of the same URL", () => {
      const { AudioCtor, instances } = stubAudio();

      sound.playSound("https://example.com/chime-b.mp3");
      sound.playSound("https://example.com/chime-b.mp3");

      expect(AudioCtor).toHaveBeenCalledTimes(1);
      expect(instances[0]?.play).toHaveBeenCalledTimes(2);
    });

    it("is silenced by the global toggle", () => {
      const { AudioCtor } = stubAudio();
      sound.setSoundEnabled(false);

      sound.playSound("https://example.com/chime-c.mp3");

      expect(AudioCtor).not.toHaveBeenCalled();
    });

    it("does nothing when Audio isn't available (SSR-safe, no throw)", () => {
      vi.stubGlobal("Audio", undefined);
      expect(() => sound.playSound("https://example.com/chime-d.mp3")).not.toThrow();
    });
  });

  describe("ensureAudioUnlock() — autoplay recovery", () => {
    it("arms exactly one listener per gesture type", () => {
      const addSpy = vi.spyOn(document, "addEventListener");

      sound.ensureAudioUnlock();

      expect(addSpy.mock.calls.map((c) => c[0]).sort()).toEqual(["keydown", "pointerdown", "touchstart"]);
    });

    it("only installs once even if called repeatedly", () => {
      const addSpy = vi.spyOn(document, "addEventListener");

      sound.ensureAudioUnlock();
      sound.ensureAudioUnlock();
      sound.ensureAudioUnlock();

      expect(addSpy).toHaveBeenCalledTimes(3);
    });

    /**
     * A mock whose `resume()` only actually succeeds once a gesture is
     * "in progress" (`gestureActive`) — real browsers behave the same way:
     * resume() called outside a gesture's call stack stays suspended, resume()
     * called synchronously inside one succeeds. This lets the test tell apart
     * "queued because blocked" from "played immediately."
     */
    function makeGestureGatedContext() {
      let gestureActive = false;
      const ctx = new MockAudioContext();
      ctx.state = "suspended";
      ctx.resume = vi.fn(() => {
        if (!gestureActive) return new Promise<void>(() => {}); // never resolves
        ctx.state = "running";
        return Promise.resolve();
      });
      return { ctx, setGestureActive: (v: boolean) => (gestureActive = v) };
    }

    it("queues a chime requested before any gesture, and replays it on the first gesture", async () => {
      const { ctx, setGestureActive } = makeGestureGatedContext();
      vi.stubGlobal("AudioContext", vi.fn(() => ctx));
      sound.ensureAudioUnlock();

      sound.playSound(true);
      expect(ctx.createOscillator).not.toHaveBeenCalled(); // blocked — queued, not lost

      setGestureActive(true);
      document.dispatchEvent(new Event("pointerdown"));
      await Promise.resolve();
      await Promise.resolve();

      expect(ctx.createOscillator).toHaveBeenCalledTimes(2);
    });

    it("queues a custom-URL sound requested before any gesture, and replays it on the first gesture", async () => {
      let gestureActive = false;
      const play = vi.fn(() => (gestureActive ? Promise.resolve() : Promise.reject(new Error("blocked"))));
      const AudioCtor = vi.fn(function (this: { play: typeof play; currentTime: number; src: string }, src: string) {
        this.src = src;
        this.currentTime = 0;
        this.play = play;
      });
      vi.stubGlobal("Audio", AudioCtor);
      sound.ensureAudioUnlock();

      sound.playSound("https://example.com/chime-e.mp3");
      await Promise.resolve(); // let the rejection land and queue the pending sound
      expect(play).toHaveBeenCalledTimes(1);

      gestureActive = true;
      document.dispatchEvent(new Event("keydown"));
      await Promise.resolve();
      await Promise.resolve();

      expect(play).toHaveBeenCalledTimes(2); // the queued retry
    });

    it("only remembers the single most recent blocked sound", async () => {
      // Both mocks gate on the same flag, so neither "plays for real" until
      // the simulated gesture — otherwise the URL sound would succeed
      // immediately and never actually become the pending one.
      let gestureActive = false;
      const ctx = new MockAudioContext();
      ctx.state = "suspended";
      ctx.resume = vi.fn(() => {
        if (!gestureActive) return new Promise<void>(() => {});
        ctx.state = "running";
        return Promise.resolve();
      });
      vi.stubGlobal("AudioContext", vi.fn(() => ctx));

      const play = vi.fn(() => (gestureActive ? Promise.resolve() : Promise.reject(new Error("blocked"))));
      const AudioCtor = vi.fn(function (this: { play: typeof play; currentTime: number; src: string }, src: string) {
        this.src = src;
        this.currentTime = 0;
        this.play = play;
      });
      vi.stubGlobal("Audio", AudioCtor);
      sound.ensureAudioUnlock();

      sound.playSound(true); // queued...
      sound.playSound("https://example.com/chime-f.mp3"); // ...then overwrites it
      await Promise.resolve(); // let the URL's rejection land

      gestureActive = true;
      document.dispatchEvent(new Event("touchstart"));
      await Promise.resolve();
      await Promise.resolve();

      expect(ctx.createOscillator).not.toHaveBeenCalled(); // the chime was dropped
      expect(play).toHaveBeenCalledTimes(2); // 1st attempt (blocked) + the queued retry
    });

    it("does nothing when there's no document (SSR-safe, no throw)", async () => {
      vi.stubGlobal("document", undefined);
      expect(() => sound.ensureAudioUnlock()).not.toThrow();
    });
  });
});
