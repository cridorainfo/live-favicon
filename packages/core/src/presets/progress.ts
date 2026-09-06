import type { PresetRenderer } from "../types";

/** A progress ring for an arbitrary 0-100 percent value. */
export function makeProgress(percent: number): PresetRenderer {
  const fraction = Math.max(0, Math.min(100, percent)) / 100;

  return ({ ctx, size }) => {
    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.4;

    ctx.lineWidth = size * 0.14;
    ctx.lineCap = "round";

    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "#3B82F6";
    ctx.beginPath();
    ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * fraction);
    ctx.stroke();
  };
}
