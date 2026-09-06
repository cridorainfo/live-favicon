export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  size: number;
  /** seconds elapsed since this state became active (loops for continuous animations) */
  t: number;
}

export type PresetRenderer = (rc: RenderContext) => void;

export type FaviconState =
  | "idle"
  | "thinking"
  | "loading"
  | "processing"
  | "syncing"
  | "success"
  | "error"
  | "warning"
  | "offline"
  | "notification";

export interface TaskOptions {
  /** state to show while the task is in flight. Default: "thinking" */
  start?: FaviconState;
  /** state to show once the task resolves. Default: "success" */
  success?: FaviconState;
  /** state to show if the task rejects. Default: "error" */
  error?: FaviconState;
}
