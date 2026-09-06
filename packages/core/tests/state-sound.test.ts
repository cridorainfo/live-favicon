import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Integration coverage for the `sound` option on `favicon.define()` and the
 * `favicon.sound()` global toggle, exercised through the public API rather
 * than the sound renderer module directly (see sound.test.ts for that).
 *
 * Each test re-imports the module fresh (vi.resetModules()) rather than
 * sharing one top-level import: the sound renderer caches a single
 * AudioContext for its own lifetime, so a shared module instance would let
 * an earlier test's mock leak into a later test's assertions.
 */

class MockAudioContext {
  currentTime = 0;
  state = "running";
  destination = {};
  resume = vi.fn(() => Promise.resolve());
  createOscillator = vi.fn(() => ({
    type: "",
    frequency: { setValueAtTime: vi.fn() },
    connect: vi.fn((dest: unknown) => dest),
    start: vi.fn(),
    stop: vi.fn(),
  }));
  createGain = vi.fn(() => ({
    gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    connect: vi.fn((dest: unknown) => dest),
  }));
}

function stubAudioContext() {
  const ctx = new MockAudioContext();
  vi.stubGlobal("AudioContext", vi.fn(() => ctx));
  return ctx;
}

function stubAudio() {
  const play = vi.fn(() => Promise.resolve());
  const AudioCtor = vi.fn(function (this: { play: unknown; currentTime: number; src: string }, src: string) {
    this.src = src;
    this.currentTime = 0;
    this.play = play;
  });
  vi.stubGlobal("Audio", AudioCtor);
  return { AudioCtor, play };
}

let favicon: typeof import("../src/index").default;
let iconBadge: typeof import("../src/index").iconBadge;

beforeEach(async () => {
  vi.resetModules();
  const mod = await import("../src/index");
  favicon = mod.default;
  iconBadge = mod.iconBadge;
});

afterEach(() => {
  document.head.innerHTML = "";
  vi.unstubAllGlobals();
});

describe("favicon.define() + sound", () => {
  it("plays the built-in chime when a state defined with sound: true activates", () => {
    const ctx = stubAudioContext();
    favicon.define("new-mail", iconBadge("#EA4335", "✉"), { sound: true });

    favicon.state("new-mail");

    expect(ctx.createOscillator).toHaveBeenCalled();
  });

  it("plays a custom audio URL when a state defines sound as a URL", () => {
    const { AudioCtor } = stubAudio();
    favicon.define("new-mail", iconBadge("#EA4335", "✉"), { sound: "https://example.com/mail.mp3" });

    favicon.state("new-mail");

    expect(AudioCtor).toHaveBeenCalledWith("https://example.com/mail.mp3");
  });

  it("plays nothing for a state defined without a sound option", () => {
    const ctx = stubAudioContext();
    favicon.define("silent-mail", iconBadge("#EA4335", "✉"));

    favicon.state("silent-mail");

    expect(ctx.createOscillator).not.toHaveBeenCalled();
  });

  it("re-plays the sound on every activation, e.g. once per incoming email", () => {
    const ctx = stubAudioContext();
    favicon.define("new-mail", iconBadge("#EA4335", "✉"), { sound: true });

    favicon.state("new-mail");
    favicon.state("new-mail");
    favicon.state("new-mail");

    expect(ctx.createOscillator).toHaveBeenCalledTimes(6); // 2 tones × 3 activations
  });

  it("favicon.sound(false) globally silences a state's declared sound", () => {
    const ctx = stubAudioContext();
    favicon.define("new-mail", iconBadge("#EA4335", "✉"), { sound: true });

    favicon.sound(false);
    favicon.state("new-mail");

    expect(ctx.createOscillator).not.toHaveBeenCalled();
  });

  it("favicon.sound(true) re-enables sound after being muted", () => {
    const ctx = stubAudioContext();
    favicon.define("new-mail", iconBadge("#EA4335", "✉"), { sound: true });

    favicon.sound(false);
    favicon.state("new-mail");
    favicon.sound(true);
    favicon.state("new-mail");

    expect(ctx.createOscillator).toHaveBeenCalledTimes(2); // only the second activation
  });

  it("favicon.sound() with no argument defaults to enabling", () => {
    const ctx = stubAudioContext();
    favicon.define("new-mail", iconBadge("#EA4335", "✉"), { sound: true });
    favicon.sound(false);

    favicon.sound();
    favicon.state("new-mail");

    expect(ctx.createOscillator).toHaveBeenCalled();
  });

  it("the mute setting is not cleared by reset() — it persists like define()", () => {
    const ctx = stubAudioContext();
    favicon.define("new-mail", iconBadge("#EA4335", "✉"), { sound: true });
    favicon.sound(false);

    favicon.reset();
    favicon.state("new-mail");

    expect(ctx.createOscillator).not.toHaveBeenCalled();
  });

  it("built-in states stay silent — no sound is attached to them by default", () => {
    const ctx = stubAudioContext();

    favicon.message();

    expect(ctx.createOscillator).not.toHaveBeenCalled();
  });

  it("defining a sound-carrying state arms the autoplay-unlock listeners", () => {
    const addSpy = vi.spyOn(document, "addEventListener");

    favicon.define("new-mail", iconBadge("#EA4335", "✉"), { sound: true });

    expect(addSpy.mock.calls.map((c) => c[0]).sort()).toEqual(["keydown", "pointerdown", "touchstart"]);
  });

  it("defining a state without sound never touches the unlock listeners", () => {
    const addSpy = vi.spyOn(document, "addEventListener");

    favicon.define("silent-mail", iconBadge("#EA4335", "✉"));

    expect(addSpy).not.toHaveBeenCalled();
  });
});
