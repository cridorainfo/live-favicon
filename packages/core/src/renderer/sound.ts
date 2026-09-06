/**
 * Sound for state changes. A state registered via `favicon.define(name,
 * renderer, { sound: true })` plays a short synthesized chime (Web Audio,
 * no asset file) every time it activates; `{ sound: "url" }` plays a custom
 * audio file instead. `favicon.sound(false)` is a global kill switch that
 * silences both, without touching the icon or title.
 *
 * Browsers block audio (both Web Audio and <audio>) until the page has seen
 * a user gesture — a state activated purely from an incoming network event
 * before the user has clicked/typed anywhere may not audibly play its sound.
 * We don't work around this (there's no reliable way to); we just fail
 * silently instead of throwing, exactly like the rest of this library does
 * when it can't touch the DOM.
 */

let enabled = true;

export function setSoundEnabled(value: boolean): void {
  enabled = value;
}

export function isSoundEnabled(): boolean {
  return enabled;
}

type AudioContextCtor = typeof AudioContext;

function getAudioContextCtor(): AudioContextCtor | undefined {
  if (typeof window === "undefined") return undefined;
  return window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext;
}

let sharedCtx: AudioContext | null | undefined;

function getAudioContext(): AudioContext | null {
  if (sharedCtx !== undefined) return sharedCtx;
  const Ctor = getAudioContextCtor();
  try {
    sharedCtx = Ctor ? new Ctor() : null;
  } catch {
    sharedCtx = null;
  }
  return sharedCtx;
}

/** One tone with a quick fade-in/out envelope, so it clicks-free starts/stops. */
function tone(ctx: AudioContext, freq: number, startAt: number, duration: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, startAt);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(0.2, startAt + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.02);
}

/** Built-in default chime: a quick two-note "ding-dong", no asset required. */
function playChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    if (ctx.state === "suspended") void ctx.resume().catch(() => {});
    const now = ctx.currentTime;
    tone(ctx, 880, now, 0.1);
    tone(ctx, 1318.5, now + 0.09, 0.14);
  } catch {
    // Best-effort — never let a sound failure break a state change.
  }
}

const audioElements = new Map<string, HTMLAudioElement>();

function playUrl(url: string): void {
  if (typeof Audio === "undefined") return;
  try {
    let el = audioElements.get(url);
    if (!el) {
      el = new Audio(url);
      audioElements.set(url, el);
    }
    el.currentTime = 0;
    void el.play().catch(() => {});
  } catch {
    // Best-effort — never let a sound failure break a state change.
  }
}

/** Play `sound` (as declared on a `Preset`) if the global toggle allows it. */
export function playSound(sound: boolean | string): void {
  if (!enabled || sound === false) return;
  if (sound === true) playChime();
  else playUrl(sound);
}
