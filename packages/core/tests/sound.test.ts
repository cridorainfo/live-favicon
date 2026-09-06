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
});
