/**
 * Sound for state changes. A state registered via `favicon.define(name,
 * renderer, { sound: true })` plays a short synthesized chime (Web Audio,
 * no asset file) every time it activates; `{ sound: "url" }` plays a custom
 * audio file instead. `favicon.sound(false)` is a global kill switch that
 * silences both, without touching the icon or title.
 *
 * Browsers block both Web Audio and <audio> playback until the page has
 * seen a user gesture (a click, keypress, or tap). We can't override that —
 * it's a deliberate anti-annoyance policy, not a bug — but we don't just
 * accept the silent failure either:
 *
 * 1. `ensureAudioUnlock()` (called from `define()` the moment a sound-
 *    carrying state is registered) arms one-time listeners for the page's
 *    very first gesture and uses it to create/resume the AudioContext right
 *    then — synchronously inside a real gesture's call stack, which is what
 *    actually satisfies stricter browsers (notably Safari). In practice this
 *    means the context is already unlocked by the time a real notification
 *    arrives, because almost every real app sees a click within the first
 *    few seconds.
 * 2. For the rarer case where a sound is requested before any gesture at
 *    all (e.g. a websocket message arriving a second after page load), we
 *    remember the most recent blocked attempt and replay it the instant the
 *    user's first interaction lands — a late chime beats a lost one.
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

// The most recent sound that couldn't play because the page hasn't seen a
// user gesture yet — replayed once by `flushPending()`. A single slot, not a
// queue: if several notifications stack up before the user's first click,
// they get one catch-up sound on that click, not a burst of stale ones.
let pendingSound: boolean | string | null = null;

function flushPending(): void {
  if (pendingSound === null) return;
  const sound = pendingSound;
  pendingSound = null;
  playSound(sound);
}

/** Built-in default chime: a quick two-note "ding-dong", no asset required. */
function playChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    if (ctx.state === "suspended") {
      // Scheduling tones against a suspended context's clock now would just
      // waste them (or, worse, have them land at a stale time if the
      // context resumes on its own later) — wait for a real unlock instead.
      pendingSound = true;
      void ctx
        .resume()
        .then(() => {
          if (ctx.state === "running") flushPending();
        })
        .catch(() => {});
      return;
    }
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
    const playPromise = el.play();
    // Autoplay-blocked play() calls reject (rather than throwing) in every
    // browser that implements the policy — queue this one for replay on the
    // next gesture instead of losing it.
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        pendingSound = url;
      });
    }
  } catch {
    pendingSound = url;
  }
}

let unlockInstalled = false;

/**
 * Arms one-time listeners for the page's first user gesture and uses it to
 * unlock audio ahead of time. Safe to call repeatedly (only installs once);
 * called from `favicon.define()` the moment a state is registered with a
 * `sound` option, so apps that never use sound never pay for this at all.
 */
export function ensureAudioUnlock(): void {
  if (unlockInstalled || typeof document === "undefined") return;
  unlockInstalled = true;

  const events = ["pointerdown", "keydown", "touchstart"] as const;
  const onFirstGesture = (): void => {
    for (const type of events) document.removeEventListener(type, onFirstGesture);

    // Touching the AudioContext synchronously inside this real gesture's
    // call stack is the part that matters — it's what convinces stricter
    // browsers to actually unlock it, as opposed to resuming it later from
    // an arbitrary async callback (a websocket handler, a timer, ...).
    const ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") {
      void ctx
        .resume()
        .then(flushPending)
        .catch(() => {});
    } else {
      flushPending();
    }
  };

  for (const type of events) {
    document.addEventListener(type, onFirstGesture, { once: true, passive: true });
  }
}

/** Play `sound` (as declared on a `Preset`) if the global toggle allows it. */
export function playSound(sound: boolean | string): void {
  if (!enabled || sound === false) return;
  if (sound === true) playChime();
  else playUrl(sound);
}
