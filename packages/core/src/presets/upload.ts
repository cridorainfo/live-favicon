import type { PresetRenderer } from "../types";

/** Particles rising from a baseline and fading near the top — for uploads/sending. */
export const renderUploading: PresetRenderer = ({ ctx, size, t }) => {
  const cx = size / 2;
  const baseline = size * 0.82;
  const count = 3;

  for (let i = 0; i < count; i++) {
    const phase = ((t * 0.9) + i / count) % 1;
    const y = baseline - phase * size * 0.6;
    const alpha = phase < 0.85 ? 1 - phase * 0.3 : (1 - phase) / 0.15;
    const r = size * 0.09 * (1 - phase * 0.3);

    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.fillStyle = "#3B82F6";
    ctx.beginPath();
    ctx.arc(cx, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.strokeStyle = "rgba(59, 130, 246, 0.35)";
  ctx.lineWidth = size * 0.06;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.22, baseline);
  ctx.lineTo(cx + size * 0.22, baseline);
  ctx.stroke();
};
