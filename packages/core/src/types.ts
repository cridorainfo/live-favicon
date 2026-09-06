export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  size: number;
  /** seconds elapsed since this state became active (loops for continuous animations) */
  t: number;
}

export type PresetRenderer = (rc: RenderContext) => void;

export type BuiltInFaviconState =
  | "idle"
  | "thinking"
  | "loading"
  | "processing"
  | "syncing"
  | "reconnecting"
  | "uploading"
  | "downloading"
  | "success"
  | "error"
  | "warning"
  | "offline"
  | "notification"
  | "mention"
  | "message"
  | "alarm"
  | "celebration"
  | "payment"
  | "queue";

/**
 * Any built-in state name, or a custom one registered via `favicon.define()`.
 * The `string & {}` half is a TS trick that keeps editor autocomplete for the
 * built-ins while still accepting an arbitrary string — a plain `string`
 * union would silently swallow the autocomplete for the literals above.
 */
export type FaviconState = BuiltInFaviconState | (string & {});

export interface TaskOptions {
  /** state to show while the task is in flight. Default: "thinking" */
  start?: FaviconState;
  /** state to show once the task resolves. Default: "success" */
  success?: FaviconState;
  /** state to show if the task rejects. Default: "error" */
  error?: FaviconState;
}
