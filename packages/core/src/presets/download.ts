import type { PresetRenderer } from "../types";

/** Particles falling toward a baseline — for downloads/receiving. */
export const renderDownloading: PresetRenderer = ({ ctx, size, t }) => {
  const cx = size / 2;
  const baseline = size * 0.82;
  const count = 3;

  for (let i = 0; i < count; i++) {
    const phase = ((t * 0.9) + i / count) % 1;
    const y = size * 0.22 + phase * size * 0.6;
    const alpha = phase < 0.85 ? 1 : (1 - phase) / 0.15;
    const r = size * 0.09 * (1 - phase * 0.2);

    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.fillStyle = "#14B8A6";
    ctx.beginPath();
    ctx.arc(cx, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.strokeStyle = "rgba(20, 184, 166, 0.35)";
  ctx.lineWidth = size * 0.06;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.22, baseline);
  ctx.lineTo(cx + size * 0.22, baseline);
  ctx.stroke();
};
