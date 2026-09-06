import type { PresetRenderer } from "../types";
import { drawBadge } from "../presets/badge";

/**
 * Render at 2x a typical favicon display size so browsers that show it larger
 * (pinned tabs, bookmarks, high-DPI displays) still get a crisp image.
 */
export const FAVICON_SIZE = 64;

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;

function getContext(): CanvasRenderingContext2D | null {
  if (ctx) return ctx;
  if (typeof document === "undefined") return null;

  const el = document.createElement("canvas");
  el.width = FAVICON_SIZE;
  el.height = FAVICON_SIZE;
  const context = el.getContext("2d");
  if (!context) return null;

  canvas = el;
  ctx = context;
  return ctx;
}

/**
 * Renders one frame of `renderer` (plus an optional badge overlay) and returns
 * it as a PNG data URL ready to assign to a <link rel="icon"> href.
 */
export function renderFrame(renderer: PresetRenderer, t: number, badgeCount = 0): string | null {
  const context = getContext();
  if (!context || !canvas) return null;

  context.clearRect(0, 0, FAVICON_SIZE, FAVICON_SIZE);
  context.save();
  renderer({ ctx: context, size: FAVICON_SIZE, t });
  context.restore();

  if (badgeCount > 0) drawBadge(context, FAVICON_SIZE, badgeCount);

  return canvas.toDataURL("image/png");
}
